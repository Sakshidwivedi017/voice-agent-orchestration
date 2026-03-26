import asyncio
import logging
import os
import re
import json
import time
import io
from typing import Annotated
from datetime import datetime, timedelta
import pytz
import asyncpg
import openai
from dotenv import load_dotenv

# LiveKit (Using the supported Agent + AgentSession pattern from saravm.md)
from livekit.agents import (
    JobContext, 
    WorkerOptions, 
    cli, 
    llm,
)
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import openai as lk_openai, sarvam as lk_sarvam, silero

load_dotenv()

# Setup Logging
logger = logging.getLogger("outbound-agent")
logger.setLevel(logging.DEBUG)

# Load fallback config for environments where .env is unreadable
# MUST be loaded before get_openai_client() is called
fallback_config = {}
try:
    with open("/Users/sakshi/Downloads/voice-agent/config_fixed.json", "r") as f:
        fallback_config = json.load(f)
except Exception:
    pass

# ── CACHED OPENAI CLIENT (avoid per-request instantiation) ───────────────────
_openai_client: openai.AsyncOpenAI | None = None

def get_openai_client() -> openai.AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        key = os.getenv("OPENAI_API_KEY") or fallback_config.get("OPENAI_API_KEY", "")
        _openai_client = openai.AsyncOpenAI(api_key=key)
    return _openai_client

# File logger for debugging
log_dir = os.getenv("LOG_DIR", "logs")
os.makedirs(log_dir, exist_ok=True)
LOG_FILE = os.path.join(log_dir, os.getenv("LOG_FILE", "agent_debug.log"))

fh = logging.FileHandler(LOG_FILE)
fh.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
logger.addHandler(fh)

# Also capture sdk logs
logging.getLogger("livekit").addHandler(fh)
logging.getLogger("livekit").setLevel(logging.INFO)

# ── SSL FIX FOR MACOS ────────────────────────────────────────────────────────
import ssl
try:
    import certifi
    os.environ["SSL_CERT_FILE"] = certifi.where()
    os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()
    # Aggressive fix for macOS Python Framework installs
    ssl._create_default_https_context = ssl._create_unverified_context
    logger.info(f"[SSL] Applied macOS SSL fix (unverified context)")
except Exception as e:
    logger.warning(f"[SSL] Failed to apply SSL fix: {e}")

# ══════════════════════════════════════════════════════════════════════════════
# ── HELPER FUNCTIONS ────────────────────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════════

def normalize_number(num: str) -> str:
    """Normalize any Indian phone number variant (0, 91, +91) to E.164 (+91XXXXXXXXXX)."""
    if not num: return ""
    clean = re.sub(r"[^\d+]", "", num).strip()
    # If it's not a real phone number (e.g. 'unknown', 'sip:user'), return as is
    if not clean or len(clean) < 5: return num
    
    num = clean
    if num.startswith("+91") and len(num) == 13: return num
    if num.startswith("91") and len(num) == 12: return "+" + num
    if num.startswith("0") and len(num) == 11: return "+91" + num[1:]
    if len(num) == 10: return "+91" + num
    return num

def normalize_indian_text(text: str) -> str:
    """Normalize text for smoother Indian-English TTS pronunciation."""
    if not text: return ""
    replacements = {
        "Rs.": "Rupees",
        "INR": "Rupees",
        "AI": "A.I.",
        "&": "and",
        "No.": "Number",
        "hr": "hour",
        "min": "minute",
        "sec": "second",
        "vs": "versus",
        "km": "kilometers",
        "kg": "kilograms",
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    # Ensure punctuation ends sentences for breathing room
    if text and text[-1].isalnum():
        text += "."
    return text

def get_ist_time_context() -> str:
    tz = pytz.timezone('Asia/Kolkata')
    now = datetime.now(tz)
    tomorrow = now + timedelta(days=1)
    day_name = now.strftime("%A")
    date_str = now.strftime("%Y-%m-%d")
    tomorrow_str = tomorrow.strftime("%Y-%m-%d")
    curr_time = now.strftime("%I:%M %p")
    return f"\n\n[TIME CONTEXT] Today is {day_name}, {date_str}. Tomorrow is {tomorrow_str}. Current IST Time: {curr_time}\n"

# ══════════════════════════════════════════════════════════════════════════════
# ── CORE BUSINESS LOGIC: AgentTools ──────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════════

class AgentTools:
    def __init__(self, agent_id: str, caller_phone: str, pool: asyncpg.Pool):
        self.agent_id = agent_id
        self.caller_phone = caller_phone
        self.pool = pool

    @llm.function_tool(description="Search the hotel/restaurant knowledge base for menu, hours, or general info.")
    async def search_knowledge_base(self, query: Annotated[str, "The user's question"]) -> str:
        logger.info(f"[TOOL] RAG query: {query}")
        try:
            client = get_openai_client()
            resp = await client.embeddings.create(input=query, model="text-embedding-3-small")
            emb = resp.data[0].embedding
            emb_str = f"[{','.join(str(f) for f in emb)}]"
            
            async with self.pool.acquire() as conn:
                rows = await conn.fetch(
                    "SELECT content FROM knowledge_chunks WHERE agent_id = CAST($1 AS uuid) ORDER BY embedding <-> $2::vector LIMIT 3",
                    self.agent_id, emb_str
                )
            knowledge = "\n".join([r['content'] for r in rows])
            return knowledge if knowledge else "No specific info found in knowledge base."
        except Exception as e:
            logger.error(f"[RAG ERROR] {e}")
            return "Error searching knowledge base."

    @llm.function_tool(description="Save a new reservation after collecting name, date, time, and guests.")
    async def save_reservation(self, name: str, date: str, time: str, guests: int, phone: str = "", special_req: str = "") -> str:
        logger.info(f"[TOOL] save_reservation called: name={name}, date={date}, time={time}, guests={guests}, phone={phone}")
        final_phone = phone or self.caller_phone
        try:
            from datetime import datetime
            try:
                dt_date = datetime.strptime(date, "%Y-%m-%d").date()
            except:
                dt_date = datetime.strptime(date, "%d-%m-%Y").date()
            
            time_str = time if ":" in time else f"{time}:00"
            if time_str.count(":") == 1:
                dt_time = datetime.strptime(time_str, "%H:%M").time()
            else:
                dt_time = datetime.strptime(time_str, "%H:%M:%S").time()

            async with self.pool.acquire() as conn:
                await conn.execute(
                    "INSERT INTO reservations (agent_id, customer_name, phone, date, time, guests, status, special_request) "
                    "VALUES (CAST($1 AS uuid), $2, $3, $4, $5, $6, 'confirmed', $7)",
                    self.agent_id, name, final_phone, dt_date, dt_time, int(guests), special_req
                )
            logger.info(f"[DB-SUCCESS] Reservation saved for {name} (Agent: {self.agent_id})")
            return f"Success! Reservation confirmed for {name} on {date} at {time} for {guests} guests."
        except Exception as e:
            logger.error(f"[DB ERR] {e}")
            return f"Failed to save reservation: {str(e)}"

    @llm.function_tool(description="Search for an existing reservation to confirm details or prepare for modification. Useful for 'Modify reservation' or 'Cancel reservation' requests.")
    async def get_reservation(self, phone: str = "", date: str = "") -> str:
        logger.info(f"[TOOL] get_reservation called: phone={phone}, date={date}")
        try:
            from datetime import datetime
            search_phone = phone or self.caller_phone
            
            query = "SELECT id, customer_name, date, time, guests FROM reservations WHERE agent_id = CAST($1 AS uuid) AND phone = $2"
            args = [self.agent_id, search_phone]
            
            if date:
                try:
                    dt_date = datetime.strptime(date, "%Y-%m-%d").date()
                except:
                    dt_date = datetime.strptime(date, "%d-%m-%Y").date()
                query += f" AND date = $3"
                args.append(dt_date)
            
            query += " ORDER BY created_at DESC LIMIT 1"
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow(query, *args)
            
            if row:
                return (f"Found reservation: ID {row['id']}, Name: {row['customer_name']}, "
                        f"Date: {row['date']}, Time: {row['time']}, Guests: {row['guests']}. "
                        "You can now offer to modify or cancel this.")
            return "No reservation found for these details. Ask the user for the phone number or date used."
        except Exception as e:
            logger.error(f"[SEARCH ERR] {e}")
            return f"Error searching: {e}"

    @llm.function_tool(description="Update an existing reservation's date, time, or guests. Requires the reservation ID found via get_reservation.")
    async def update_reservation(self, res_id: str, date: str = "", time: str = "", guests: int = 0) -> str:
        try:
            from datetime import datetime
            updates = []
            args = [res_id]
            i = 2
            
            if date:
                try:
                    dt_date = datetime.strptime(date, "%Y-%m-%d").date()
                except:
                    dt_date = datetime.strptime(date, "%d-%m-%Y").date()
                updates.append(f"date = ${i}")
                args.append(dt_date)
                i += 1
            if time:
                time_str = time if ":" in time else f"{time}:00"
                updates.append(f"time = ${i}")
                args.append(time_str)
                i += 1
            if guests:
                updates.append(f"guests = ${i}")
                args.append(guests)
                i += 1
                
            if not updates:
                return "No updates provided."
                
            query = f"UPDATE reservations SET {', '.join(updates)} WHERE id = CAST($1 AS uuid)"
            async with self.pool.acquire() as conn:
                await conn.execute(query, *args)
            return "Success! The reservation has been updated."
        except Exception as e:
            logger.error(f"[UPDATE ERR] {e}")
            return f"Error updating: {e}"

    @llm.function_tool(description="Cancel an existing reservation using the ID found via get_reservation.")
    async def cancel_reservation(self, res_id: str) -> str:
        try:
            async with self.pool.acquire() as conn:
                await conn.execute(
                    "UPDATE reservations SET status = 'cancelled' WHERE id = CAST($1 AS uuid)",
                    res_id
                )
            return "Success! The reservation has been cancelled."
        except Exception as e:
            logger.error(f"[CANCEL ERR] {e}")
            return f"Error cancelling: {e}"

# ══════════════════════════════════════════════════════════════════════════════
# ── ENTRYPOINT ──────────────────────────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════════


# ══════════════════════════════════════════════════════════════════════════════
# ── AMBIENT BACKGROUND AUDIO ─────────────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════════

async def _play_ambient_audio(room, audio_url: str, volume: float = 0.15):
    """
    Load an ambient audio file (local path or HTTP URL) and loop it as a
    background track in the LiveKit room so the caller hears restaurant ambience.
    Volume is a gain multiplier: 0.15 = 15% of original (subtle background).
    Set AMBIENT_AUDIO_URL in .env to a local file path or HTTP URL to enable.
    """
    try:
        import av
        from livekit import rtc

        # Support both local file paths and remote HTTP URLs
        if audio_url.startswith("http://") or audio_url.startswith("https://"):
            import aiohttp
            logger.info(f"[AMBIENT] Fetching audio from URL: {audio_url}")
            async with aiohttp.ClientSession() as http:
                async with http.get(audio_url) as resp:
                    audio_bytes = await resp.read()
        else:
            try:
                logger.info(f"[AMBIENT] Loading local audio file: {audio_url}")
                with open(audio_url, "rb") as f:
                    audio_bytes = f.read()
            except FileNotFoundError:
                # Fallback to local filename only (for Docker/relative paths)
                rel_path = audio_url.split("/")[-1]
                logger.info(f"[AMBIENT] Retrying with relative path: {rel_path}")
                with open(rel_path, "rb") as f:
                    audio_bytes = f.read()

        source = rtc.AudioSource(sample_rate=24000, num_channels=1)
        track = rtc.LocalAudioTrack.create_audio_track("restaurant-ambient", source)
        pub_opts = rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_MICROPHONE)
        await room.local_participant.publish_track(track, pub_opts)
        logger.info("[AMBIENT] Published background audio track.")

        SAMPLES_PER_CHUNK = 2400  # 100ms of audio at 24kHz

        while True:
            container = av.open(io.BytesIO(audio_bytes))
            resampler = av.audio.resampler.AudioResampler(
                format='s16',
                layout='mono',
                rate=24000,
            )
            for packet in container.demux(audio=0):
                for frame in packet.decode():
                    for resampled in resampler.resample(frame):
                        samples = resampled.to_ndarray().flatten()
                        # Apply volume reduction so ambient doesn't overpower voice
                        samples = (samples * volume).astype('int16')
                        # Send in 100ms chunks
                        for i in range(0, len(samples), SAMPLES_PER_CHUNK):
                            chunk = samples[i:i + SAMPLES_PER_CHUNK]
                            audio_frame = rtc.AudioFrame(
                                data=chunk.tobytes(),
                                sample_rate=24000,
                                num_channels=1,
                                samples_per_channel=len(chunk),
                            )
                            await source.capture_frame(audio_frame)
                            await asyncio.sleep(len(chunk) / 24000)
            # Loop: restart from beginning when file ends
            logger.debug("[AMBIENT] Audio loop restarting.")
    except Exception as e:
        logger.warning(f"[AMBIENT] Background audio failed (non-critical): {e}")


async def entrypoint(ctx: JobContext):

    logger.info(f"--- [NEW JOB RECEIVED] ID: {ctx.job.id} Room: {ctx.room.name} ---")
    try:
        await _entrypoint_inner(ctx)
    except Exception as exc:
        logger.error(f"[ENTRYPOINT] Unhandled exception during job {ctx.job.id}: {exc}", exc_info=True)
        raise  # re-raise so LiveKit marks the job as failed and assigns next one


async def _entrypoint_inner(ctx: JobContext):
    
    # 1. Connect and Wait for Participant (Ensure call is established)
    await ctx.connect()
    try:
        participant = await ctx.wait_for_participant()
        logger.info(f"Participant identifed: {participant.identity}")
    except Exception as e:
        logger.warning(f"Timeout waiting for participant: {e}")
    
    # Fetch Metadata for Identity
    metadata = {}
    try:
        raw_meta = getattr(ctx.job, 'metadata', "")
        logger.info(f"[JOB-METADATA] Raw: {raw_meta}")
        if raw_meta:
            metadata = json.loads(raw_meta)
        elif hasattr(ctx.job, 'metadata_obj') and ctx.job.metadata_obj:
            metadata = ctx.job.metadata_obj
    except Exception as e:
        logger.warning(f"Failed to parse job metadata: {e}")

    # Log identified numbers
    agent_did = normalize_number(metadata.get("sip.toUser", metadata.get("toUser", "")))
    caller_phone = normalize_number(metadata.get("sip.fromUser", metadata.get("fromUser", "unknown")))
    
    if participant and (not caller_phone or caller_phone == "unknown"):
        caller_phone = normalize_number(participant.identity)

    logger.info(f"[DB-LOOKUP] Dialed DID: '{agent_did}' | Caller: '{caller_phone}'")

    if not agent_did or len(agent_did) < 5:
        # Fallback: Search room name for digits
        matches = re.findall(r"(\+?91\d{10})|(\d{10})", ctx.job.room.name)
        if matches:
            for m_set in matches:
                raw_found = [m for m in m_set if m][0]
                found_num = normalize_number(raw_found)
                # If the extracted number matches the caller, it's likely not the DID
                if found_num != caller_phone:
                    agent_did = found_num
                    logger.info(f"[FALLBACK] Extracted DID from room: '{agent_did}'")
                    break
            if not agent_did:
                # If only caller number found, we still don't have a DID
                logger.warning(f"[FALLBACK] Room name only contained caller number ({caller_phone}). Still no DID.")
    
# Database Connection Pool (reused across all tools for this call)
    db_url = os.getenv("DATABASE_URL")
    if not db_url and "DATABASE_URL" in fallback_config:
        db_url = fallback_config["DATABASE_URL"]

    pool = None
    try:
        pool = await asyncpg.create_pool(db_url, ssl='require', min_size=2, max_size=5)
        logger.info("[DB-POOL] ✅ Connection pool created")
    except Exception as e:
        logger.error(f"[DB ERROR] Pool creation failed: {e}")

    row = None
    try:
        async with pool.acquire() as conn:
            if agent_did:
                # Normal Lookup
                row = await conn.fetchrow(
                    "SELECT a.id, a.system_prompt, a.first_message FROM agents a "
                    "JOIN phone_numbers p ON a.id = p.agent_id "
                    "WHERE p.phone_number = $1 OR p.phone_number LIKE $2", 
                    agent_did, f"%{agent_did[-10:]}"
                )
                if not row:
                    # Direct agent search
                    row = await conn.fetchrow(
                        "SELECT id, system_prompt, first_message FROM agents WHERE phone_number_id::text LIKE $1 LIMIT 1",
                        f"%{agent_did[-10:]}"
                    )
            
            if not row:
                # Deep Fallback: most recent agent
                logger.warning("[FALLBACK] Could not resolve identity, fetching latest agent.")
                row = await conn.fetchrow("SELECT id, system_prompt, first_message FROM agents ORDER BY created_at DESC LIMIT 1")
    except Exception as e:
        logger.error(f"[DB ERROR] Agent lookup failed: {e}")

    if not row:
        logger.error(f"[CRITICAL] Could not resolve any agent for this call.")
        return

    agent_id = str(row['id'])
    logger.info(f"[DB-CONFIG] ✅ Resolved agent_id: {agent_id}")
    system_prompt = row['system_prompt'] or "You are a helpful assistant."
    first_message = row['first_message'] or "Hello, how can I help you today?"
    
    final_prompt = (
        system_prompt + 
        "\n\n[INSTRUCTIONS] You MUST call the 'save_reservation' tool to actually book a table in the system. "
        "Do this as soon as you have the guest's name, date, time, and guest count. "
        "Wait for the tool's success response before confirming to the user that they are booked."
        "\n\n[PRONUNCIATION GUIDELINE] Always use full words for abbreviations. For Indian names or places, "
        "if you notice the voice engine struggling, you can use phonetic spelling. Avoid using symbols like "
        "& or @. Always end sentences with punctuation to allow the voice to breathe."
        + get_ist_time_context()
    )
    
    # 2. Build Pipeline Components
    sarvam_key = os.getenv("SARVAM_API_KEY") or fallback_config.get("SARVAM_API_KEY")

    # STT: Saaras v3 in hi-IN mode handles English/Hindi/Hinglish best
    stt_p = lk_sarvam.STT(
        language="hi-IN",
        model="saaras:v3",
        flush_signal=True,
        api_key=sarvam_key
    )

    # TTS: meera on bulbul:v3 in hi-IN mode creates the most natural Hinglish flow.
    # She still handles English terms/numbers perfectly.
    tts_p = lk_sarvam.TTS(
        target_language_code="hi-IN",
        model="bulbul:v3",
        speaker="meera",
        api_key=sarvam_key
    )

    openai_key = os.getenv("OPENAI_API_KEY") or fallback_config.get("OPENAI_API_KEY")
    llm_p = lk_openai.LLM(model="gpt-4o-mini", api_key=openai_key)

    tools_obj = AgentTools(agent_id, caller_phone, pool)
    tools = llm.find_function_tools(tools_obj)
    logger.info(f"[AGENT] Registered {len(tools)} tools")

    # 3. Create Agent
    assistant = Agent(
        instructions=final_prompt,
        stt=stt_p,
        tts=tts_p,
        llm=llm_p,
        tools=tools,
    )

    # 4. Initialize Session
    # Silero VAD tuned for responsive Indian service bot:
    #   activation_threshold=0.5 → Sensitive enough for mobile/office calls
    #   min_silence_duration=0.8 → Natural pause before agent replies
    #   min_speech_duration=0.1  → Ignores short clicks/noises
    vad = silero.VAD.load(
        activation_threshold=0.5,
        min_silence_duration=0.8,
        min_speech_duration=0.1,
        prefix_padding_duration=0.2,
    )
    session = AgentSession(
        turn_detection="vad",        # Faster response than STT-based detection
        vad=vad,
        min_endpointing_delay=0.4,   # Fast response gating
        max_endpointing_delay=5.0,
        allow_interruptions=True,
    )

    # --- CALL LOGGING & TRANSCRIPTION SETUP ---
    start_time = datetime.now()
    transcript_segments = []
    tz_ist = pytz.timezone('Asia/Kolkata')

    @session.on("user_transcript")
    def on_user_transcript(ev):
        # Support both string events and transcript objects
        text = ev if isinstance(ev, str) else getattr(ev, 'text', "")
        if text:
            logger.debug(f"[TRANSCRIPT] User: {text}")
            transcript_segments.append(f"User: {text}")

    @session.on("agent_transcript")
    def on_agent_transcript(ev):
        text = ev if isinstance(ev, str) else getattr(ev, 'text', "")
        if text:
            logger.debug(f"[TRANSCRIPT] Agent: {text}")
            transcript_segments.append(f"Agent: {text}")

    # 4. Start Session
    logger.info("Starting agent session...")
    await session.start(agent=assistant, room=ctx.room)

    # 5. Background ambient restaurant noise
    # Runs as a background task — loops a restaurant ambience audio URL
    ambient_url = os.getenv("AMBIENT_AUDIO_URL", "")
    if ambient_url:
        asyncio.create_task(_play_ambient_audio(ctx.room, ambient_url))
        logger.info(f"[AMBIENT] Started background audio: {ambient_url}")
    else:
        logger.info("[AMBIENT] No AMBIENT_AUDIO_URL set — skipping background audio.")

    # 6. Speak First Message
    if first_message:
        logger.info(f"Speaking greeting: {first_message}")
        await session.say(first_message, allow_interruptions=True)

    # --- REMOVED REDUNDANT LISTENERS (Caught before session start) ---

    @ctx.add_shutdown_callback
    async def on_shutdown():
        logger.info(f"--- [JOB {ctx.job.id} CLOSED] ---")
        end_time = datetime.now()
        duration = int((end_time - start_time).total_seconds())
        
        # Close the DB pool when the call ends
        if pool:
            await pool.close()
            logger.info("[DB-POOL] Connection pool closed.")
        
        # 1. Capture Full Transcript from the Assistant's actual Chat Context (Memory)
        # This is the single most reliable way to get the entire history.
        chat_history = []
        try:
            # Flexible check for messages (property vs method)
            msgs = assistant.chat_ctx.messages
            if callable(msgs):
                msgs = msgs()
                
            for msg in msgs:
                # ChatMessage in 1.4.x typically uses .content
                content = getattr(msg, 'content', getattr(msg, 'text', ""))
                if msg.role in ["user", "assistant"] and content:
                    role_label = "User" if msg.role == "user" else "Agent"
                    chat_history.append(f"{role_label}: {content}")
        except Exception as e:
            logger.warning(f"Failed to read chat_ctx safely: {e}")

        # Fallback to segments if chat_history is empty
        full_transcript = "\n".join(chat_history) if chat_history else "\n".join(transcript_segments)
        
        intent = "Dropped"
        summary = "Call ended before any conversation was recorded."
        
        if full_transcript:
            # Generate summary and intent using LLM with the user's specific categories
            summary_prompt = (
                "Summarize the following call transcript concisely and classify the user's primary intent "
                "from this EXACT list: [New reservation, Modify reservation, Cancel reservation, Menu question, "
                "Room reservation, Housekeeping, laundry, In-room dining, Spa-booking, Airport Pickup, "
                "Maintenance, complaint, other].\n\n"
                "Format the output as follows:\nIntent: [Exact Categorized Intent]\nSummary: [One Sentence Summary]\n\n"
                f"Transcript:\n{full_transcript}"
            )
            
            try:
                # Generate summary with a quick LLM call using the cached OpenAI client
                client = get_openai_client()
                resp = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": summary_prompt}]
                )
                summary_raw = resp.choices[0].message.content
                
                # Strict Intent Extraction Guardrail
                valid_intents = [
                    "New reservation", "Modify reservation", "Cancel reservation", 
                    "Menu question", "Room reservation", "Housekeeping", "laundry", 
                    "In-room dining", "Spa-booking", "Airport Pickup", 
                    "Maintenance", "complaint", "other"
                ]
                
                # Clean and parse the LLM's raw response
                for res_line in summary_raw.split('\n'):
                    res_line = res_line.replace('*', '').strip() 
                    if "intent:" in res_line.lower():
                        ext_intent = res_line.split(":", 1)[1].strip()
                        for v in valid_intents:
                            if v.lower() in ext_intent.lower():
                                intent = v
                                break
                    if "summary:" in res_line.lower():
                        summary = res_line.split(":", 1)[1].strip()
            except Exception as e:
                logger.error(f"❌ LLM summarizing failed: {e}")
                intent = "other"
                summary = "Conversation occurred but summarization failed."
        else:
            full_transcript = "[No conversation recorded]"

        try:
            # Final resolution for caller number from participant identity if mapping failed
            # SIP callers often identify as part of the participant.identity
            resolved_caller = caller_phone
            if resolved_caller == "unknown" or not resolved_caller:
                resolved_caller = normalize_number(getattr(participant, "identity", "unknown"))

            # Save to Database with correct mapping and IST Time (Simple naive datetime per system clock)
            now_ist = datetime.now()
            
            # Use a fresh single connection for shutdown (pool may already be closing)
            db_url_log = os.getenv("DATABASE_URL") or fallback_config.get("DATABASE_URL")
            log_conn = await asyncpg.connect(db_url_log, ssl='require')
            await log_conn.execute(
                """
                INSERT INTO call_logs (agent_id, caller_number, phone_number, duration, intent, summary, transcript, created_at, status)
                VALUES (CAST($1 AS uuid), $2, $3, $4, $5, $6, $7, $8, 'resolved')
                """,
                agent_id, resolved_caller, agent_did, duration, intent, summary, full_transcript, now_ist
            )
            await log_conn.close()
            logger.info(f"✅ Call Log successfully saved for {resolved_caller} at {now_ist} (Intent: {intent})")
        except Exception as e:
            logger.error(f"❌ Failed to save call log to DB: {e}")

    logger.info("Agent Live & Ready.")

def _build_worker_options() -> WorkerOptions:
    return WorkerOptions(
        entrypoint_fnc=entrypoint,
        agent_name="outbound-caller",
        ws_url=os.getenv("LIVEKIT_URL") or fallback_config.get("LIVEKIT_URL"),
        api_key=os.getenv("LIVEKIT_API_KEY") or fallback_config.get("LIVEKIT_API_KEY"),
        api_secret=os.getenv("LIVEKIT_API_SECRET") or fallback_config.get("LIVEKIT_API_SECRET"),
    )


if __name__ == "__main__":
    RESTART_DELAY = 5  # seconds to wait before reconnecting after a crash

    while True:
        try:
            logger.info("[AGENT] Starting LiveKit worker...")
            cli.run_app(_build_worker_options())
            # cli.run_app blocks until the worker stops cleanly (e.g. SIGTERM).
            # If we reach here it means a clean shutdown was requested — exit.
            logger.info("[AGENT] Worker stopped cleanly. Exiting.")
            break
        except KeyboardInterrupt:
            logger.info("[AGENT] Keyboard interrupt received. Shutting down.")
            break
        except SystemExit as exc:
            # cli.run_app may raise SystemExit(0) on clean stop.
            if exc.code == 0:
                logger.info("[AGENT] Clean SystemExit(0). Exiting.")
                break
            logger.warning(f"[AGENT] SystemExit({exc.code}) — restarting in {RESTART_DELAY}s...")
            time.sleep(RESTART_DELAY)
        except Exception as exc:
            logger.error(f"[AGENT] Worker crashed: {exc}. Restarting in {RESTART_DELAY}s...", exc_info=True)
            time.sleep(RESTART_DELAY)
