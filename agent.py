import os
import json
import logging
import certifi
import pytz
import re
import asyncio
import time
from collections import defaultdict
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import Annotated

import asyncpg

# Fix for macOS SSL certificate verification
os.environ["SSL_CERT_FILE"] = certifi.where()

# ── Sentry error tracking (#21) ───────────────────────────────────────────────
import sentry_sdk
_sentry_dsn = os.environ.get("SENTRY_DSN", "")
if _sentry_dsn:
    from sentry_sdk.integrations.asyncio import AsyncioIntegration
    sentry_sdk.init(
        dsn=_sentry_dsn,
        traces_sample_rate=0.1,
        integrations=[AsyncioIntegration()],
        environment=os.environ.get("ENVIRONMENT", "production"),
    )

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.getLogger("hpack").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

load_dotenv()
logger = logging.getLogger("outbound-agent")
logging.basicConfig(level=logging.INFO)

from livekit import api
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    RoomInputOptions,
    WorkerOptions,
    cli,
    llm,
)
from livekit.plugins import openai, sarvam, silero

CONFIG_FILE = "config.json"

# ── Rate limiting (#37) ───────────────────────────────────────────────────────
_call_timestamps: dict = defaultdict(list)
RATE_LIMIT_CALLS  = 5
RATE_LIMIT_WINDOW = 3600  # 1 hour

def normalize_number(num: str) -> str:
    """Normalize any Indian phone number variant to E.164 (+91XXXXXXXXXX)."""
    num = num.replace(" ", "").replace("-", "").strip()
    if num.startswith("+"):
        return num                 # already E.164
    if num.startswith("91") and len(num) == 12:
        return "+" + num          # 918046733587 → +918046733587
    if len(num) == 10:
        return "+91" + num        # 8046733587   → +918046733587
    return num                     # unknown format — pass through as-is


def is_rate_limited(phone: str) -> bool:
    if phone in ("unknown", "demo"):
        return False
    now = time.time()
    _call_timestamps[phone] = [t for t in _call_timestamps[phone] if now - t < RATE_LIMIT_WINDOW]
    if len(_call_timestamps[phone]) >= RATE_LIMIT_CALLS:
        return True
    _call_timestamps[phone].append(now)
    return False


# ── Config loader (#17 partial — per-client path awareness) ───────────────────
def get_live_config(phone_number: str | None = None):
    """Load fallback config for LLM/TTS/STT settings.
    NOTE: system_prompt + first_message now come from DB via fetch_agent_config_from_db()
    and will always override the 'agent_instructions' / 'first_line' keys here.
    """
    config = {}
    paths = []
    # Per-phone file configs are now SUPERSEDED by DB lookup — commented out
    # if phone_number and phone_number != "unknown":
    #     clean = phone_number.replace("+", "").replace(" ", "")
    #     paths.append(f"configs/{clean}.json")  # e.g. configs/918046733587.json
    paths += ["configs/default.json", CONFIG_FILE]

    for path in paths:
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    config = json.load(f)
                    logger.info(f"[CONFIG] Loaded: {path}")
                    break
            except Exception as e:
                logger.error(f"[CONFIG] Failed to read {path}: {e}")

    return {
        # agent_instructions is ALWAYS overridden by DB — kept here as empty fallback only
        # "agent_instructions": config.get("agent_instructions", ""),
        "stt_min_endpointing_delay": config.get("stt_min_endpointing_delay", 0.05),
        "llm_model":                 config.get("llm_model", "gpt-4o-mini"),
        "llm_provider":              config.get("llm_provider", "openai"),
        "tts_voice":                 config.get("tts_voice", "kavya"),
        "tts_language":              config.get("tts_language", "hi-IN"),
        "tts_provider":              config.get("tts_provider", "sarvam"),
        "stt_provider":              config.get("stt_provider", "sarvam"),
        "stt_language":              config.get("stt_language", "unknown"),
        "lang_preset":               config.get("lang_preset", "multilingual"),
        "max_turns":                 config.get("max_turns", 25),
        **config,
    }



# ── DB config fetcher — fetches system_prompt + first_message from PostgreSQL ─
async def fetch_agent_config_from_db(phone_number: str) -> dict:
    """
    Two-step DB lookup on every call:
      1. phone_numbers.phone_number = $1  →  agent_id   (via phone_numbers.agent_id FK)
      2. agents.id = agent_id             →  system_prompt, first_message
    Hard-raises if anything is missing so call fails loudly instead of
    silently using the wrong agent config.

    Schema: phone_numbers.agent_id → agents.id  (FK is on phone_numbers side)
    """
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        raise RuntimeError("[DB-CONFIG] DATABASE_URL is not set — cannot fetch agent config")
    if phone_number in ("unknown", "demo", ""):
        raise RuntimeError(f"[DB-CONFIG] Cannot fetch agent config for unresolved phone: {phone_number!r}")

    logger.info(f"[DB-CONFIG] ▶ Incoming number: {phone_number}")

    conn = await asyncpg.connect(dsn=db_url, ssl="require")
    try:
        # ── Step 1: phone_number → agent_id ──────────────────────────────
        # Schema: phone_numbers.agent_id is the FK pointing to agents.id
        phone_row = await conn.fetchrow(
            "SELECT agent_id FROM phone_numbers "
            "WHERE phone_number = $1 "
            "LIMIT 1",
            phone_number,
        )

        if not phone_row:
            raise RuntimeError(
                f"[DB-CONFIG] No agent found for number: {phone_number} — "
                f"check phone_numbers table and agent assignment"
            )

        agent_id = phone_row["agent_id"]
        logger.info(f"[DB-CONFIG] ✅ Resolved agent_id: {agent_id}")

        # ── Step 2: agent_id → system_prompt + first_message ─────────────
        agent_row = await conn.fetchrow(
            "SELECT system_prompt, first_message FROM agents WHERE id = $1",
            agent_id,
        )

        if not agent_row:
            # TRY AUTO-RECOVERY: If mapped agent is missing, pick the most recent existing agent
            # to prevent a total service outage.
            logger.warning(f"[DB-CONFIG] ⚠️ Agent {agent_id} missing — attempting to find any valid agent...")
            recovery_row = await conn.fetchrow(
                "SELECT id, system_prompt, first_message FROM agents ORDER BY created_at DESC LIMIT 1"
            )

            if not recovery_row:
                raise RuntimeError(
                    f"[DB-CONFIG] CRITICAL: Agent {agent_id} is missing AND no other agents exist in the 'agents' table. "
                    f"Please create an agent in the dashboard first."
                )

            agent_row = recovery_row
            new_id = recovery_row["id"]

            try:
                # Update mapping so we don't hit this recovery path for every single call
                await conn.execute(
                    "UPDATE phone_numbers SET agent_id = $1 WHERE phone_number = $2",
                    new_id, phone_number
                )
                logger.info(f"[DB-CONFIG] ✅ Auto-recovered: Remapped {phone_number} to valid agent {new_id}")
            except Exception as e:
                logger.warning(f"[DB-CONFIG] Failed to update phone_numbers mapping: {e} (continuing with recovered agent)")

        system_prompt = agent_row["system_prompt"] or ""
        
        # Inject reservation rules
        system_prompt += """

RESERVATION RULES:
If user wants to book a table:
1. Ask number of guests
2. Ask date
3. Ask time
4. Ask name
5. Ask phone (if needed)
6. Confirm all details
7. ONLY after confirmation → call save_reservation

Never book without confirmation.
Keep responses short and natural.

AVAILABILITY RULE:
Before confirming any reservation:
- Call check_availability
- If available → proceed
- If full → suggest another time

Never confirm a booking without checking availability.
"""

        first_message = agent_row["first_message"] or ""

        if not system_prompt:
            raise RuntimeError(
                f"[DB-CONFIG] system_prompt is empty for agent_id={agent_id} — "
                f"save a prompt via /api/agent/save-config first"
            )

        logger.info(f"[DB-CONFIG] ✅ Using prompt   : {system_prompt[:80]!r}{'...' if len(system_prompt) > 80 else ''}")
        logger.info(f"[DB-CONFIG] ✅ First message  : {first_message[:80]!r}{'...' if len(first_message) > 80 else ''}")
        logger.info(f"[DB-CONFIG] ✅ Prompt length  : {len(system_prompt)} chars")

        return {
            "agent_instructions": system_prompt,
            "first_line":         first_message,
            "agent_id":           str(agent_id),
        }
    finally:
        await conn.close()


# ── Token counter (#11) ───────────────────────────────────────────────────────
def count_tokens(text: str) -> int:
    try:
        import tiktoken
        enc = tiktoken.encoding_for_model("gpt-4o")
        return len(enc.encode(text))
    except Exception:
        return len(text.split())


# ── IST time context ──────────────────────────────────────────────────────────
def get_ist_time_context() -> str:
    ist = pytz.timezone("Asia/Kolkata")
    now = datetime.now(ist)
    today_str = now.strftime("%A, %B %d, %Y")
    time_str  = now.strftime("%I:%M %p")
    days_lines = []
    for i in range(7):
        day   = now + timedelta(days=i)
        label = "Today" if i == 0 else ("Tomorrow" if i == 1 else day.strftime("%A"))
        days_lines.append(f"  {label}: {day.strftime('%A %d %B %Y')} → ISO {day.strftime('%Y-%m-%d')}")
    days_block = "\n".join(days_lines)
    return (
        f"\n\n[SYSTEM CONTEXT]\n"
        f"Current date & time: {today_str} at {time_str} IST\n"
        f"Resolve ALL relative day references using this table:\n{days_block}\n"
        f"Always use ISO dates when calling save_booking_intent. Appointments in IST (+05:30).]"
    )


# ── Language presets ──────────────────────────────────────────────────────────
LANGUAGE_PRESETS = {
    "hinglish":    {"label": "Hinglish (Hindi+English)", "tts_language": "hi-IN", "tts_voice": "kavya",  "instruction": "Speak in natural Hinglish — mix Hindi and English like educated Indians do. Default to Hindi but use English words when more natural."},
    "hindi":       {"label": "Hindi",                   "tts_language": "hi-IN", "tts_voice": "ritu",   "instruction": "Speak only in pure Hindi. Avoid English words wherever a Hindi equivalent exists."},
    "english":     {"label": "English (India)",         "tts_language": "en-IN", "tts_voice": "dev",    "instruction": "Speak only in Indian English with a warm, professional tone."},
    "tamil":       {"label": "Tamil",                   "tts_language": "ta-IN", "tts_voice": "priya",  "instruction": "Speak only in Tamil. Use standard spoken Tamil for a professional context."},
    "telugu":      {"label": "Telugu",                  "tts_language": "te-IN", "tts_voice": "kavya",  "instruction": "Speak only in Telugu. Use clear, polite spoken Telugu."},
    "gujarati":    {"label": "Gujarati",                "tts_language": "gu-IN", "tts_voice": "rohan",  "instruction": "Speak only in Gujarati. Use polite, professional Gujarati."},
    "bengali":     {"label": "Bengali",                 "tts_language": "bn-IN", "tts_voice": "neha",   "instruction": "Speak only in Bengali (Bangla). Use standard, polite spoken Bengali."},
    "marathi":     {"label": "Marathi",                 "tts_language": "mr-IN", "tts_voice": "shubh",  "instruction": "Speak only in Marathi. Use polite, standard spoken Marathi."},
    "kannada":     {"label": "Kannada",                 "tts_language": "kn-IN", "tts_voice": "rahul",  "instruction": "Speak only in Kannada. Use clear, professional spoken Kannada."},
    "malayalam":   {"label": "Malayalam",               "tts_language": "ml-IN", "tts_voice": "ritu",   "instruction": "Speak only in Malayalam. Use polite, professional spoken Malayalam."},
    "multilingual":{"label": "Multilingual (Auto)",     "tts_language": "hi-IN", "tts_voice": "kavya",  "instruction": "Detect the caller's language from their first message and reply in that SAME language for the entire call. Supported: Hindi, Hinglish, English, Tamil, Telugu, Gujarati, Bengali, Marathi, Kannada, Malayalam. Switch if caller switches."},
}

def get_language_instruction(lang_preset: str) -> str:
    preset = LANGUAGE_PRESETS.get(lang_preset, LANGUAGE_PRESETS["multilingual"])
    return f"\n\n[LANGUAGE DIRECTIVE]\n{preset['instruction']}"


# ── External imports ──────────────────────────────────────────────────────────
from calendar_tools import get_available_slots, create_booking, cancel_booking
from notify import (
    notify_booking_confirmed,
    notify_booking_cancelled,
    notify_call_no_booking,
    notify_agent_error,
)


# ══════════════════════════════════════════════════════════════════════════════
# TOOL CONTEXT — All AI-callable functions
# ══════════════════════════════════════════════════════════════════════════════

class AgentTools(llm.ToolContext):

    def __init__(self, caller_phone: str, caller_name: str = "", agent_id: str = ""):
        super().__init__(tools=[])
        self.caller_phone        = caller_phone
        self.caller_name         = caller_name
        self.agent_id            = agent_id
        self.booking_intent: dict | None = None
        self.sip_domain          = os.getenv("VOBIZ_SIP_DOMAIN")
        self.ctx_api             = None
        self.room_name           = None
        self._sip_identity       = None

    # ── Tool: Search Knowledge Base (RAG) ─────────────────────────────────
    @llm.function_tool(description="Search the hotel/restaurant knowledge base for information. Call this whenever the user asks about the menu, hours, location, prices, or general info.")
    async def search_knowledge_base(self, query: Annotated[str, "The user's specific question"]) -> str:
        logger.info(f"[RAG] searching for: {query}")
        if not self.agent_id:
            return "Knowledge base unavailable (no agent_id)."
            
        try:
            import openai
            import asyncpg
            client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            resp = await client.embeddings.create(input=query, model="text-embedding-3-small")
            emb = resp.data[0].embedding
            emb_str = f"[{','.join(str(f) for f in emb)}]"
            
            db_url = os.getenv("DATABASE_URL")
            conn = await asyncpg.connect(db_url, ssl='require')
            rows = await conn.fetch(
                """
                SELECT content
                FROM knowledge_chunks
                WHERE agent_id = CAST($1 AS uuid)
                ORDER BY embedding <-> $2::vector
                LIMIT 3
                """,
                self.agent_id, emb_str
            )
            await conn.close()
            
            if not rows:
                return "No specific information found in the knowledge base."
            
            knowledge = "\n\n".join(r["content"] for r in rows)
            logger.info(f"[RAG] Found chunks: {len(rows)}")
            return knowledge
        except Exception as e:
            logger.error(f"[RAG] Search failed: {e}")
            return "Knowledge base is currently unavailable."

    # ── Tool: Transfer to Human ───────────────────────────────────────────
    @llm.function_tool(description="Transfer this call to a human agent. Use if: caller asks for human, is angry, or query is outside scope.")
    async def transfer_call(self) -> str:
        logger.info("[TOOL] transfer_call triggered")
        destination = os.getenv("DEFAULT_TRANSFER_NUMBER")
        if destination and self.sip_domain and "@" not in destination:
            clean_dest  = destination.replace("tel:", "").replace("sip:", "")
            destination = f"sip:{clean_dest}@{self.sip_domain}"
        if destination and not destination.startswith("sip:"):
            destination = f"sip:{destination}"
        try:
            if self.ctx_api and self.room_name and destination and self._sip_identity:
                await self.ctx_api.sip.transfer_sip_participant(
                    api.TransferSIPParticipantRequest(
                        room_name=self.room_name,
                        participant_identity=self._sip_identity,
                        transfer_to=destination,
                        play_dialtone=False,
                    )
                )
                return "Transfer initiated successfully."
            return "Unable to transfer right now."
        except Exception as e:
            logger.error(f"Transfer failed: {e}")
            return "Unable to transfer right now."

    # ── Tool: End Call ────────────────────────────────────────────────────
    @llm.function_tool(description="End the call. Use ONLY when caller says bye/goodbye or after booking is fully confirmed.")
    async def end_call(self) -> str:
        logger.info("[TOOL] end_call triggered — hanging up.")
        try:
            if self.ctx_api and self.room_name and self._sip_identity:
                await self.ctx_api.sip.transfer_sip_participant(
                    api.TransferSIPParticipantRequest(
                        room_name=self.room_name,
                        participant_identity=self._sip_identity,
                        transfer_to="tel:+00000000",
                        play_dialtone=False,
                    )
                )
        except Exception as e:
            logger.warning(f"[END-CALL] SIP hangup failed: {e}")
        return "Call ended."

    # ── Tool: Save Booking Intent ─────────────────────────────────────────
    @llm.function_tool(description="Save booking intent after caller confirms appointment. Call this ONCE after you have name, phone, email, date, time.")
    async def save_booking_intent(
        self,
        start_time:  Annotated[str,  "ISO 8601 datetime e.g. '2026-03-01T10:00:00+05:30'"],
        caller_name: Annotated[str,  "Full name of the caller"],
        caller_phone:Annotated[str,  "Phone number of the caller"],
        notes:       Annotated[str,  "Any notes, email, or special requests"] = "",
    ) -> str:
        logger.info(f"[TOOL] save_booking_intent: {caller_name} at {start_time}")
        try:
            self.booking_intent = {
                "start_time":   start_time,
                "caller_name":  caller_name,
                "caller_phone": caller_phone,
                "notes":        notes,
            }
            self.caller_name = caller_name
            return f"Booking intent saved for {caller_name} at {start_time}. I'll confirm after the call."
        except Exception as e:
            logger.error(f"[TOOL] save_booking_intent failed: {e}")
            return "I had trouble saving the booking. Please try again."

    # ── Tool: Check Availability ──────────────────────────────────────────
    @llm.function_tool(description="Check if a table is available for a given date, time, and party size. Always call this before confirming a booking.")
    async def check_availability(
        self,
        date: Annotated[str, "Date to check in YYYY-MM-DD format e.g. '2026-03-01'"],
        time: Annotated[str, "Time to check in HH:MM format"],
        guests: Annotated[int, "Number of guests"]
    ) -> str:
        logger.info(f"[TOOL] check_availability: date={date}, time={time}, guests={guests}")
        if not self.agent_id:
            return "Unable to check availability (missing agent context)."
            
        try:
            import asyncpg
            import json
            from datetime import datetime, timedelta
            
            # Normalize time to nearest 30 mins
            try:
                dt_time = datetime.strptime(time, "%H:%M")
                m = dt_time.minute
                rounded_minute = 0 if m < 15 else (30 if m < 45 else 0)
                hour_adj = 1 if m >= 45 else 0
                # Be careful crossing the day boundary (24:00 is invalid in strptime/strftime for next day)
                dt_time = (dt_time.replace(minute=rounded_minute) + timedelta(hours=hour_adj))
                normalized_time = dt_time.strftime("%H:%M")
            except Exception:
                normalized_time = time
                
            db_url = os.getenv("DATABASE_URL")
            conn = await asyncpg.connect(db_url, ssl='require')
            
            row = await conn.fetchrow("""
                SELECT COALESCE(SUM(guests), 0) as total
                FROM reservations
                WHERE agent_id = CAST($1 AS uuid)
                AND date = CAST($2 AS date)
                AND time = CAST($3 AS time)
                AND status = 'confirmed'
            """, self.agent_id, date, normalized_time)

            current = row["total"] if row and row["total"] else 0

            capacity_val = await conn.fetchval("""
                SELECT max_capacity
                FROM agents
                WHERE id = CAST($1 AS uuid)
            """, self.agent_id)
            capacity = capacity_val if capacity_val is not None else 20
            
            await conn.close()

            if current + guests <= capacity:
                return json.dumps({"status": "available"})
            else:
                try:
                    dt = datetime.strptime(normalized_time, "%H:%M")
                    sug_list = []
                    # Provide 4 alternatives
                    for offset in [-60, -30, 30, 60]:
                        sug = (dt + timedelta(minutes=offset)).strftime("%I:%M %p")
                        sug_list.append(sug)
                    return json.dumps({
                        "status": "full",
                        "suggestions": sug_list
                    })
                except Exception:
                    return json.dumps({"status": "full", "suggestions": ["7:30 PM", "9:00 PM"]})
        except Exception as e:
            logger.error(f"[TOOL] check_availability failed: {e}")
            return "I'm having trouble checking availability right now."

    # ── Tool: Business Hours (#31) ────────────────────────────────────────
    @llm.function_tool(description="Check if the business is currently open and what the operating hours are.")
    async def get_business_hours(self) -> str:
        ist  = pytz.timezone("Asia/Kolkata")
        now  = datetime.now(ist)
        hours = {
            0: ("Monday",    "10:00", "19:00"),
            1: ("Tuesday",   "10:00", "19:00"),
            2: ("Wednesday", "10:00", "19:00"),
            3: ("Thursday",  "10:00", "19:00"),
            4: ("Friday",    "10:00", "19:00"),
            5: ("Saturday",  "10:00", "17:00"),
            6: ("Sunday",    None,    None),
        }
        day_name, open_t, close_t = hours[now.weekday()]
        current_time = now.strftime("%H:%M")
        if open_t is None:
            return "We are closed on Sundays. Next opening: Monday 10:00 AM IST."
        if open_t <= current_time <= close_t:
            return f"We are OPEN. Today ({day_name}): {open_t}–{close_t} IST."
        return f"We are CLOSED. Today ({day_name}): {open_t}–{close_t} IST."

    # ── Tool: Save Reservation ──────────────────────────────────────────────
    @llm.function_tool(description="Save a reservation for the user after collecting all details and confirming.")
    async def save_reservation(
        self,
        name: Annotated[str, "Customer Name"],
        phone: Annotated[str, "Customer Phone Number"],
        date: Annotated[str, "Reservation Date in YYYY-MM-DD format"],
        time: Annotated[str, "Reservation Time in HH:MM format"],
        guests: Annotated[int, "Number of Guests"],
        special_request: Annotated[str, "Special requests or notes"] = ""
    ) -> str:
        logger.info(f"[TOOL] save_reservation triggered for {name}")
        if not self.agent_id:
            return "Unable to save reservation right now (missing agent context)."
            
        try:
            import asyncpg
            db_url = os.getenv("DATABASE_URL")
            conn = await asyncpg.connect(db_url, ssl='require')
            await conn.execute("""
                INSERT INTO reservations (
                    agent_id, customer_name, phone, date, time, guests, status, special_request
                )
                VALUES (CAST($1 AS uuid), $2, $3, CAST($4 AS date), CAST($5 AS time), $6, $7, $8)
            """,
            self.agent_id,
            name,
            phone,
            date,
            time,
            guests,
            "confirmed",
            special_request
            )
            await conn.close()
            return "Reservation confirmed successfully"
        except Exception as e:
            logger.error(f"[RESERVATION] Save failed: {e}")
            return "Failed to save reservation."


# ══════════════════════════════════════════════════════════════════════════════
# AGENT CLASS
# ══════════════════════════════════════════════════════════════════════════════

class OutboundAssistant(Agent):

    def __init__(self, agent_tools: AgentTools, first_line: str = "", live_config: dict | None = None):
        tools = llm.find_function_tools(agent_tools)
        self._first_line  = first_line
        self._live_config = live_config or {}
        live_config_loaded = self._live_config

        base_instructions = live_config_loaded.get("agent_instructions", "")
        ist_context       = get_ist_time_context()
        lang_preset       = live_config_loaded.get("lang_preset", "multilingual")
        lang_instruction  = get_language_instruction(lang_preset)
        final_instructions = base_instructions + ist_context + lang_instruction

        # Token counter (#11)
        token_count = count_tokens(final_instructions)
        logger.info(f"[PROMPT] System prompt: {token_count} tokens")
        if token_count > 600:
            logger.warning(f"[PROMPT] Prompt exceeds 600 tokens — consider trimming for latency")

        super().__init__(instructions=final_instructions, tools=tools)

    async def on_enter(self):
        # first_line always comes from DB via fetch_agent_config_from_db()
        # The hardcoded fallback below is unreachable in production
        # (we hard-fail if first_message is missing in DB)
        greeting = self._live_config.get("first_line", self._first_line)
        # Previously hardcoded fallback — now commented out:
        # greeting = self._live_config.get(
        #     "first_line",
        #     self._first_line or (
        #         "Namaste! This is Aryan from RapidX AI — we help businesses automate with AI. "
        #         "Hmm, may I ask what kind of business you run?"
        #     )
        # )
        await self.session.generate_reply(
            instructions=f"Say exactly this phrase: '{greeting}'"
        )


# ══════════════════════════════════════════════════════════════════════════════
# MAIN ENTRYPOINT
# ══════════════════════════════════════════════════════════════════════════════

agent_is_speaking = False

async def entrypoint(ctx: JobContext):
    global agent_is_speaking

    # ── Connect ───────────────────────────────────────────────────────────
    await ctx.connect()
    logger.info(f"[ROOM] Connected: {ctx.room.name}")

    # ── Extract caller info ───────────────────────────────────────────────
    phone_number = None
    agent_number = None
    caller_name  = ""
    caller_phone = "unknown"

    # Try metadata first (outbound dispatch)
    metadata = ctx.job.metadata or ""
    if metadata:
        try:
            meta = json.loads(metadata)
            phone_number = meta.get("phone_number")
            agent_number = meta.get("agent_number")
        except Exception:
            pass

    # Extract from SIP participants
    for identity, participant in ctx.room.remote_participants.items():
        # Name from caller ID (#32)
        if participant.name and participant.name not in ("", "Caller", "Unknown"):
            caller_name = participant.name
            logger.info(f"[CALLER-ID] Name from SIP: {caller_name}")
            
        attr = participant.attributes or {}
        
        if not phone_number:
            phone_number = attr.get("sip.phoneNumber") or attr.get("phoneNumber")
        if not phone_number and "+" in identity:
            import re as _re
            m = _re.search(r"\+\d{7,15}", identity)
            if m:
                phone_number = m.group()
                
        if not agent_number:
            agent_number = attr.get("sip.callTo", "")

    # ── Normalize phone to E.164 BEFORE rate-limiting and DB lookup ────────
    caller_phone = normalize_number(phone_number) if phone_number else "unknown"
    logger.info(f"[PHONE] Caller Normalized: {phone_number!r} → {caller_phone!r}")
    
    agent_phone_normalized = normalize_number(agent_number) if agent_number else ""
    # Fallback to the known DID if extraction fails
    if not agent_phone_normalized:
        agent_phone_normalized = "+918046733587"
        
    logger.info(f"[PHONE] Agent Normalized: {agent_number!r} → {agent_phone_normalized!r}")

    # ── Rate limiting (#37) ───────────────────────────────────────────────
    if is_rate_limited(caller_phone):
        logger.warning(f"[RATE-LIMIT] Blocked {caller_phone} — too many calls in 1h")
        return

    # ── Load config ───────────────────────────────────────────────────────
    # Base config from file (llm_model, tts_voice, etc.) ─────────────────
    live_config   = get_live_config(caller_phone)

    # ── 🔥 ALWAYS fetch system_prompt + first_message from DB ────────────
    # Hard-fails if number is not found — no silent fallback in production.
    # Look up using the agent's DID, not the caller's number!
    db_agent_config = await fetch_agent_config_from_db(agent_phone_normalized)
    live_config.update(db_agent_config)  # DB values override file values
    logger.info("[DB-CONFIG] ✅ Agent config loaded from database — injecting into session")

    delay_setting = live_config.get("stt_min_endpointing_delay", 0.05)
    llm_model     = live_config.get("llm_model", "gpt-4o-mini")
    llm_provider  = live_config.get("llm_provider", "openai")
    tts_voice     = live_config.get("tts_voice", "kavya")
    tts_language  = live_config.get("tts_language", "hi-IN")
    tts_provider  = live_config.get("tts_provider", "sarvam")
    stt_provider  = live_config.get("stt_provider", "sarvam")
    stt_language  = live_config.get("stt_language", "unknown")  # auto-detect (#20)
    max_turns     = live_config.get("max_turns", 25)

    # Override OS env vars from UI config
    for key in ["LIVEKIT_URL","LIVEKIT_API_KEY","LIVEKIT_API_SECRET","OPENAI_API_KEY",
                "SARVAM_API_KEY","CAL_API_KEY"]:
        val = live_config.get(key.lower(), "")
        if val:
            os.environ[key] = val

    # ── Instantiate tools ─────────────────────────────────────────────────
    agent_id = live_config.get("agent_id", "")
    agent_tools = AgentTools(caller_phone=caller_phone, caller_name=caller_name, agent_id=agent_id)
    agent_tools._sip_identity = (
        f"sip_{caller_phone.replace('+','')}" if phone_number else "inbound_caller"
    )
    agent_tools.ctx_api   = ctx.api
    agent_tools.room_name = ctx.room.name

    # ── Build LLM (#8 Groq support) ───────────────────────────────────────
    if llm_provider == "groq":
        agent_llm = openai.LLM.with_groq(
            model=llm_model or "llama-3.3-70b-versatile",
            max_completion_tokens=120,
        )
        logger.info(f"[LLM] Using Groq: {llm_model}")
    elif llm_provider == "claude":
        # Claude Haiku 3.5 via Anthropic API (#27)
        _anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")
        agent_llm = openai.LLM(
            model=llm_model or "claude-haiku-3-5-latest",
            base_url="https://api.anthropic.com/v1/",
            api_key=_anthropic_key,
            max_completion_tokens=120,
        )
        logger.info(f"[LLM] Using Claude via Anthropic: {llm_model}")
    else:
        agent_llm = openai.LLM(model=llm_model, max_completion_tokens=120)  # cap tokens (#7)
        logger.info(f"[LLM] Using OpenAI: {llm_model}")

    # ── Build STT (#1 16kHz, #20 auto-detect, #9 Deepgram) ──────────────
    if stt_provider == "deepgram":
        try:
            from livekit.plugins import deepgram
            agent_stt = deepgram.STT(
                model="nova-2-general",
                language="multi",        # multilingual mode
                interim_results=False,
            )
            logger.info("[STT] Using Deepgram Nova-2")
        except ImportError:
            logger.warning("[STT] deepgram plugin not installed — falling back to Sarvam")
            agent_stt = sarvam.STT(
                language=stt_language,
                model="saaras:v3",
                mode="translate",
                flush_signal=True,
                sample_rate=16000,
            )
    else:
        agent_stt = sarvam.STT(
            language=stt_language,      # "unknown" = auto-detect (#20)
            model="saaras:v3",
            mode="translate",
            flush_signal=True,
            sample_rate=16000,          # force 16kHz (#1)
        )
        logger.info("[STT] Using Sarvam Saaras v3")

    # ── Build TTS (#2 24kHz, #10 ElevenLabs, OpenAI) ────────────────────
    if tts_provider == "openai":
        _oai_voice = os.environ.get("OPENAI_TTS_VOICE", tts_voice or "alloy")
        _oai_model = os.environ.get("OPENAI_TTS_MODEL", "tts-1")
        agent_tts = openai.TTS(
            model=_oai_model,
            voice=_oai_voice,
        )
        logger.info(f"[TTS] Using OpenAI TTS — model: {_oai_model}, voice: {_oai_voice}")
    elif tts_provider == "elevenlabs":
        try:
            from livekit.plugins import elevenlabs
            _el_voice_id = live_config.get("elevenlabs_voice_id", "21m00Tcm4TlvDq8ikWAM")
            agent_tts = elevenlabs.TTS(
                model="eleven_turbo_v2_5",
                voice_id=_el_voice_id,
            )
            logger.info(f"[TTS] Using ElevenLabs Turbo v2.5 — voice: {_el_voice_id}")
        except ImportError:
            logger.warning("[TTS] elevenlabs plugin not installed — falling back to OpenAI TTS")
            agent_tts = openai.TTS(voice="alloy")
    else:
        agent_tts = sarvam.TTS(
            target_language_code=tts_language,
            model="bulbul:v3",
            speaker=tts_voice,
            speech_sample_rate=24000,          # force 24kHz (#2)
        )
        logger.info(f"[TTS] Using Sarvam Bulbul v3 — voice: {tts_voice} lang: {tts_language}")

    # ── Sentence chunker (keep responses short for voice) ─────────────────
    def before_tts_cb(agent_response: str) -> str:
        sentences = re.split(r'(?<=[।.!?])\s+', agent_response.strip())
        return sentences[0] if sentences else agent_response

    # ── Turn counter + auto-close (#29) ──────────────────────────────────
    turn_count    = 0
    interrupt_count = 0  # (#30)

    # ── Build agent ───────────────────────────────────────────────────────
    agent = OutboundAssistant(
        agent_tools=agent_tools,
        first_line=live_config.get("first_line", ""),
        live_config=live_config,
    )

    # ── Build session (#3 noise cancellation attempted) ───────────────────
    try:
        from livekit.agents import noise_cancellation as nc
        _noise_cancel = nc.BVC()
        logger.info("[AUDIO] BVC noise cancellation enabled")
    except Exception:
        _noise_cancel = None
        logger.info("[AUDIO] BVC not available — running without noise cancellation")

    room_input = RoomInputOptions(close_on_disconnect=False)
    if _noise_cancel:
        try:
            room_input = RoomInputOptions(close_on_disconnect=False, noise_cancellation=_noise_cancel)
        except Exception:
            room_input = RoomInputOptions(close_on_disconnect=False)

    session = AgentSession(
        stt=agent_stt,
        llm=agent_llm,
        tts=agent_tts,
        turn_detection="stt",
        min_endpointing_delay=float(delay_setting),  # 0.05 default (#6)
        allow_interruptions=True,
    )

    await session.start(room=ctx.room, agent=agent, room_input_options=room_input)

    # ── TTS pre-warm (#12) ────────────────────────────────────────────────
    try:
        await session.tts.prewarm()
        logger.info("[TTS] Pre-warmed successfully")
    except Exception as e:
        logger.debug(f"[TTS] Pre-warm skipped: {e}")

    logger.info("[AGENT] Session live — waiting for caller audio.")
    call_start_time = datetime.now()

    egress_id = None  # Recording disabled (Supabase S3 removed)

    # ── Session event handlers ────────────────────────────────────────────
    @session.on("agent_speech_started")
    def _agent_speech_started(ev):
        global agent_is_speaking
        agent_is_speaking = True

    @session.on("agent_speech_finished")
    def _agent_speech_finished(ev):
        global agent_is_speaking
        agent_is_speaking = False

    # Interrupt logging (#30)
    @session.on("agent_speech_interrupted")
    def _on_interrupted(ev):
        nonlocal interrupt_count
        interrupt_count += 1
        logger.info(f"[INTERRUPT] Agent interrupted. Total: {interrupt_count}")

    FILLER_WORDS = {
        "okay.", "okay", "ok", "uh", "hmm", "hm", "yeah", "yes",
        "no", "um", "ah", "oh", "right", "sure", "fine", "good",
        "haan", "han", "theek", "theek hai", "accha", "ji", "ha",
    }

    @session.on("user_speech_committed")
    def on_user_speech_committed(ev):
        nonlocal turn_count
        global agent_is_speaking

        transcript = ev.user_transcript.strip()
        transcript_lower = transcript.lower().rstrip(".")

        if agent_is_speaking:
            logger.debug(f"[FILTER-ECHO] Dropped: '{transcript}'")
            return
        if not transcript or len(transcript) < 3:
            return
        if transcript_lower in FILLER_WORDS:
            logger.debug(f"[FILTER-FILLER] Dropped: '{transcript}'")
            return

        # Turn counter + auto-close (#29)
        turn_count += 1
        logger.info(f"[TRANSCRIPT] Turn {turn_count}/{max_turns}: '{transcript}'")
        if turn_count >= max_turns:
            logger.info(f"[LIMIT] Reached {max_turns} turns — wrapping up")
            asyncio.create_task(
                session.generate_reply(
                    instructions="Politely wrap up: thank the caller, say they can call back anytime, and say a warm goodbye."
                )
            )

    @ctx.room.on("participant_disconnected")
    def on_participant_disconnected(participant):
        global agent_is_speaking
        logger.info(f"[HANGUP] Participant disconnected: {participant.identity}")
        agent_is_speaking = False
        asyncio.create_task(unified_shutdown_hook(ctx))

    # ══════════════════════════════════════════════════════════════════════
    # POST-CALL SHUTDOWN HOOK
    # ══════════════════════════════════════════════════════════════════════

    async def unified_shutdown_hook(shutdown_ctx: JobContext):
        logger.info("[SHUTDOWN] Sequence started.")

        duration = int((datetime.now() - call_start_time).total_seconds())

        # Booking
        booking_status_msg = "No booking"
        if agent_tools.booking_intent:
            from calendar_tools import async_create_booking
            intent = agent_tools.booking_intent
            result = await async_create_booking(
                start_time=intent["start_time"],
                caller_name=intent["caller_name"] or "Unknown Caller",
                caller_phone=intent["caller_phone"],
                notes=intent["notes"],
            )
            if result.get("success"):
                notify_booking_confirmed(
                    caller_name=intent["caller_name"],
                    caller_phone=intent["caller_phone"],
                    booking_time_iso=intent["start_time"],
                    booking_id=result.get("booking_id"),
                    notes=intent["notes"],
                    tts_voice=tts_voice,
                    ai_summary="",
                )
                booking_status_msg = f"Booking Confirmed: {result.get('booking_id')}"
            else:
                booking_status_msg = f"Booking Failed: {result.get('message')}"
        else:
            notify_call_no_booking(
                caller_name=agent_tools.caller_name,
                caller_phone=agent_tools.caller_phone,
                call_summary="Caller did not schedule during this call.",
                tts_voice=tts_voice,
                duration_seconds=duration,
            )

        # Build transcript
        transcript_text = ""
        try:
            messages = agent.chat_ctx.messages
            if callable(messages):
                messages = messages()
            lines = []
            for msg in messages:
                if getattr(msg, "role", None) in ("user", "assistant"):
                    content = getattr(msg, "content", "")
                    if isinstance(content, list):
                        content = " ".join(str(c) for c in content if isinstance(c, str))
                    lines.append(f"[{msg.role.upper()}] {content}")
            transcript_text = "\n".join(lines)
        except Exception as e:
            logger.error(f"[SHUTDOWN] Transcript read failed: {e}")
            transcript_text = "unavailable"

        async def process_call_analytics(transcript: str, booking_msg: str, dest_duration: int):
            import random
            call_id = f"CL-{random.randint(10000, 99999)}"
            
            # ── Capture Call Data (Step 2) ────────────────────────
            call_data = {
                "call_id": call_id,
                "phone_number": agent_phone_normalized,
                "caller_number": caller_phone,
                "agent_id": agent_id,
                "transcript": transcript,
                "duration": dest_duration
            }

            sentiment = "unknown"
            intent = "Other"
            summary = "No summary available"
            
            if transcript and transcript != "unavailable":
                try:
                    import openai as _oai
                    _client = _oai.AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
                    
                    # Sentiment
                    resp = await _client.chat.completions.create(
                        model="gpt-4o-mini", max_tokens=5,
                        messages=[{"role":"user","content": f"Classify this call as one word: positive, neutral, negative, or frustrated.\n\n{transcript[:800]}"}]
                    )
                    sentiment = resp.choices[0].message.content.strip().lower()
                    logger.info(f"[SENTIMENT] {sentiment}")

                    # Intent Detection
                    intent_prompt = f"""Classify the intent of this call into one of:

- Reservation
- FAQ
- Order
- Complaint
- Escalation
- Other

Transcript:
{transcript}

Return only the intent."""
                    resp_intent = await _client.chat.completions.create(
                        model="gpt-4o-mini", max_tokens=10,
                        messages=[{"role":"user","content": intent_prompt}]
                    )
                    intent = resp_intent.choices[0].message.content.strip()
                    logger.info(f"[INTENT] {intent}")

                    # Summary
                    summary_prompt = f"Summarize this call in 1–2 lines:\n\n{transcript}"
                    resp_summary = await _client.chat.completions.create(
                        model="gpt-4o-mini", max_tokens=100,
                        messages=[{"role":"user","content": summary_prompt}]
                    )
                    summary = resp_summary.choices[0].message.content.strip()
                    logger.info(f"[SUMMARY] Generated summary.")

                except Exception as e:
                    logger.warning(f"[LLM LOGIC] Failed (sentiment/intent/summary): {e}")

            # Status logic
            if intent == "Escalation":
                status = "escalated"
            elif dest_duration < 20:
                status = "dropped"
            else:
                status = "resolved"

            # ── Save to DB (Step 5) ───────────────────────────────
            if agent_id:
                try:
                    db_url = os.getenv("DATABASE_URL")
                    if db_url:
                        conn = await asyncpg.connect(db_url, ssl='require')
                        await conn.execute("""
                            INSERT INTO call_logs (
                                agent_id,
                                phone_number,
                                caller_number,
                                duration,
                                transcript,
                                summary,
                                intent,
                                status
                            )
                            VALUES (CAST($1 AS uuid), $2, $3, $4, $5, $6, $7, $8)
                        """,
                        agent_id,
                        agent_phone_normalized,
                        caller_phone,
                        dest_duration,
                        transcript,
                        summary,
                        intent,
                        status
                        )
                        await conn.close()
                        logger.info(f"[DB] Saved call log {call_id} to call_logs table with status {status}.")
                except Exception as e:
                    logger.error(f"[DB] Failed to save call log: {e}")

            # Cost estimation (#34)
            def estimate_cost(dur: int, chars: int) -> float:
                return round((dur / 60) * 0.002 + (dur / 60) * 0.006 + (chars / 1000) * 0.003 + (chars / 4000) * 0.0001, 5)
            estimated_cost = estimate_cost(dest_duration, len(transcript))
            logger.info(f"[COST] Estimated: ${estimated_cost}")
            
            # Analytics timestamps (#19)
            ist = pytz.timezone("Asia/Kolkata")
            call_dt = call_start_time.astimezone(ist)

            recording_url = ""

            # n8n webhook (#39)
            _n8n_url = os.getenv("N8N_WEBHOOK_URL")
            if _n8n_url:
                try:
                    import httpx
                    await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: httpx.post(_n8n_url, json={
                            "call_id":      call_id,
                            "event":        "call_completed",
                            "phone":        caller_phone,
                            "caller_name":  agent_tools.caller_name,
                            "duration":     dest_duration,
                            "booked":       bool(agent_tools.booking_intent),
                            "sentiment":    sentiment,
                            "summary":      booking_msg,
                            "recording_url":recording_url,
                            "interrupt_count": interrupt_count,
                            "intent":       intent,
                            "status":       status
                        }, timeout=5.0)
                    )
                    logger.info("[N8N] Webhook triggered")
                except Exception as e:
                    logger.warning(f"[N8N] Webhook failed: {e}")

            # Save call log locally
            import json as _json
            _log_entry = {
                "call_id":      call_id,
                "phone":        caller_phone,
                "duration":     dest_duration,
                "summary":      booking_msg,
                "sentiment":    sentiment,
                "intent":       intent,
                "status":       status,
                "caller_name":  agent_tools.caller_name or "",
                "was_booked":   bool(agent_tools.booking_intent),
                "estimated_cost_usd": estimated_cost,
                "timestamp":    call_dt.isoformat(),
            }
            try:
                with open("call_logs.jsonl", "a") as _f:
                    _f.write(_json.dumps(_log_entry) + "\n")
                logger.info(f"[LOG] Call log {call_id} saved locally for {caller_phone}")
            except Exception as _e:
                logger.warning(f"[LOG] Local log failed: {_e}")

        # Start background task without blocking the shutdown hook
        asyncio.create_task(process_call_analytics(transcript_text, booking_status_msg, duration))

    ctx.add_shutdown_callback(unified_shutdown_hook)


# ══════════════════════════════════════════════════════════════════════════════
# WORKER ENTRY
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        agent_name="outbound-caller",
    ))
