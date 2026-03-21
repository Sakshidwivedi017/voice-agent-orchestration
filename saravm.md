# 🎙️ Sarvam AI Voice Agent — Complete Implementation Guide
### Stack: Sarvam AI · LiveKit · OpenAI · Vobiz Telephony

---

## Overview

| Layer | Service | Purpose |
|---|---|---|
| STT | Sarvam `saaras:v3` | Speech-to-text (Indian languages + English) |
| LLM | OpenAI `gpt-4o` | Conversation intelligence |
| TTS | Sarvam `bulbul:v3` | Natural Indian-accent voice output |
| Transport | LiveKit | WebRTC real-time audio |
| Telephony | Vobiz SIP | Inbound phone call routing |

---

## Part 1: Prerequisites & API Keys

You need four sets of credentials before writing any code.

### 1.1 Sarvam AI
1. Go to [dashboard.sarvam.ai](https://dashboard.sarvam.ai)
2. Sign up and go to **API Keys**
3. Copy your key → `sk_xxxxxxxxxxxxxxxxxx`

### 1.2 LiveKit Cloud
1. Go to [cloud.livekit.io](https://cloud.livekit.io)
2. Create a project
3. Go to **Settings → Keys**, copy:
   - `LIVEKIT_URL` → e.g. `wss://my-project-abc123.livekit.cloud`
   - `LIVEKIT_API_KEY` → e.g. `APIxxxxxxxxxxxxx`
   - `LIVEKIT_API_SECRET` → long secret string
4. Go to **Settings → Project**, copy your:
   - `SIP URI` → e.g. `sip:my-project-id.sip.livekit.cloud:5060`

### 1.3 OpenAI
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new secret key → `sk-proj-xxxxxxxxxxxxxxxx`

### 1.4 Vobiz
1. Go to [vobiz.ai](https://vobiz.ai) and create an account
2. Add balance for inbound calls
3. Create a SIP trunk (Part 3 covers this in detail)
4. Purchase a DID phone number

---

## Part 2: Project Setup

### 2.1 Install Dependencies

```bash
# Recommended: use a virtual environment
python -m venv .venv
source .venv/bin/activate        # macOS/Linux
# OR
.venv\Scripts\activate           # Windows

# Install all required packages
pip install "livekit-agents[sarvam,openai,silero]~=1.3" python-dotenv
```

> **Note:** The `~=1.3` pins you to LiveKit Agents v1.3+ which officially supports the Sarvam plugin.

### 2.2 Project Structure

```
voice-agent/
├── agent.py          ← Main agent logic
├── .env              ← All your API keys (never commit this)
├── requirements.txt  ← Pinned dependencies
└── README.md
```

### 2.3 Create `.env` File

```env
# LiveKit
LIVEKIT_URL=wss://your-project-abc123.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Sarvam AI
SARVAM_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxx

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
```

### 2.4 Create `requirements.txt`

```txt
livekit-agents[sarvam,openai,silero]~=1.3
python-dotenv>=1.0
```

---

## Part 3: The Agent — `agent.py`

This is the production-ready agent with all Sarvam best practices applied.

```python
import logging
from dotenv import load_dotenv
from livekit.agents import JobContext, WorkerOptions, cli
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import openai, sarvam

load_dotenv()

logger = logging.getLogger("sarvam-voice-agent")
logger.setLevel(logging.INFO)


class InboundVoiceAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""
            You are a friendly, professional inbound voice assistant.
            Keep your responses short, clear, and conversational — you are
            speaking on a phone call. Always greet callers warmly and help
            them efficiently. Avoid long monologues; ask one question at a time.
            If you don't understand something, ask the caller to repeat it.
            """,

            # ── STT: Sarvam Saaras v3 ──────────────────────────────────
            # flush_signal=True is REQUIRED for proper turn detection
            stt=sarvam.STT(
                language="unknown",       # Auto-detect: en-IN, hi-IN, mr-IN, etc.
                model="saaras:v3",        # Latest Sarvam STT model
                mode="transcribe",        # Use "translate" to force English output
                flush_signal=True,        # Enables speech start/end events
            ),

            # ── LLM: OpenAI GPT-4o ────────────────────────────────────
            llm=openai.LLM(model="gpt-4o"),

            # ── TTS: Sarvam Bulbul v3 ─────────────────────────────────
            tts=sarvam.TTS(
                target_language_code="en-IN",   # Indian English output
                model="bulbul:v3",              # Latest Sarvam TTS model
                speaker="anand",                # Male, clear Indian accent
                # Other voices ↓
                # Female: priya, simran, ishita, kavya, ritu, neha, pooja
                # Male:   aditya, rohan, shubh, rahul, amit, dev, varun
                pitch=0.0,       # Range: -20.0 to 20.0
                pace=1.0,        # Range: 0.5 to 2.0 (speed)
                loudness=1.0,    # Range: 0.5 to 2.0
            ),
        )

    async def on_enter(self):
        """Triggered when a caller connects — agent speaks first."""
        await self.session.generate_reply(
            instructions="Greet the caller warmly. Say: 'Hello! Thanks for calling. How can I help you today?'"
        )


async def entrypoint(ctx: JobContext):
    """
    LiveKit calls this function every time a new call arrives.
    The agent name 'voice-assistant' MUST match your LiveKit dispatch rule.
    """
    logger.info(f"Inbound call connected to room: {ctx.room.name}")

    # ── AgentSession: Sarvam-optimised settings ────────────────────────
    # ❌ Do NOT pass vad= here — Sarvam handles VAD internally
    session = AgentSession(
        turn_detection="stt",         # Let Sarvam STT handle turn detection
        min_endpointing_delay=0.07,   # 70ms — matches Sarvam STT latency
    )

    await session.start(
        agent=InboundVoiceAgent(),
        room=ctx.room,
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="voice-assistant",   # ← Must match LiveKit dispatch rule
        )
    )
```

---

## Part 4: Vobiz SIP Trunk Setup

### 4.1 Create a SIP Trunk via Vobiz API

```bash
curl -X POST https://api.vobiz.ai/api/v1/account/{YOUR_ACCOUNT_ID}/trunks \
  -H "Authorization: Bearer YOUR_VOBIZ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarvam-LiveKit-Agent-Trunk",
    "auth_type": "credentials"
  }'
```

**Save from the response:**
- `sip_domain` → e.g. `5f3a607b.sip.vobiz.ai`
- `username`
- `password`

### 4.2 Purchase a Phone Number

```bash
curl -X POST https://api.vobiz.ai/api/v1/account/{ACCOUNT_ID}/numbers \
  -H "Authorization: Bearer YOUR_VOBIZ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "IN",
    "type": "local"
  }'
```

### 4.3 Point Vobiz Inbound Traffic → LiveKit

> ⚠️ **Critical:** Remove the `sip:` prefix from the LiveKit SIP URI.

```bash
curl -X PATCH https://api.vobiz.ai/api/v1/account/{ACCOUNT_ID}/trunks/{TRUNK_ID} \
  -H "Authorization: Bearer YOUR_VOBIZ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "inbound_destination": "my-project-id.sip.livekit.cloud:5060"
  }'
```

| LiveKit Shows | What You Enter in Vobiz |
|---|---|
| `sip:my-project.sip.livekit.cloud:5060` | `my-project.sip.livekit.cloud:5060` |

---

## Part 5: LiveKit SIP Configuration

### 5.1 Create LiveKit Inbound Trunk (Dashboard)

1. Go to **LiveKit Cloud Dashboard → Telephony → Trunks**
2. Click **Create new trunk → Inbound**
3. Fill in:
   - **Phone Numbers:** Your Vobiz DID number (e.g. `+918071XXXXXX`)
   - **Allowed Addresses:** `0.0.0.0/0` *(restrict to Vobiz IPs in production)*
4. Click **Create** and save the **Trunk ID**

### 5.2 Create Dispatch Rule (Dashboard)

This tells LiveKit to auto-spawn your agent when a call arrives.

1. Go to **Telephony → Dispatch Rules**
2. Click **Create new dispatch rule**
3. Configure:
   - **Rule Type:** `Individual`
   - **Room Prefix:** `call-`
   - **Match Trunks:** Select your inbound trunk from Step 5.1
4. Expand **"Agent dispatch"** section and set:
   - **Agent Name:** `voice-assistant` ← *Must exactly match `agent_name` in `agent.py`*
5. Click **Create**

### 5.3 (Optional) Create Outbound Trunk via Python

If you want your agent to also make outbound calls:

```python
import asyncio
from livekit import api as livekit_api

async def setup_outbound_trunk():
    lk = livekit_api.LiveKitAPI(
        url="YOUR_LIVEKIT_URL",
        api_key="YOUR_LIVEKIT_API_KEY",
        api_secret="YOUR_LIVEKIT_API_SECRET",
    )

    trunk = await lk.sip.create_sip_outbound_trunk(
        livekit_api.CreateSIPOutboundTrunkRequest(
            trunk=livekit_api.SIPOutboundTrunkInfo(
                name="Vobiz Outbound Trunk",
                address="5f3a607b.sip.vobiz.ai",       # Your Vobiz sip_domain
                auth_username="YOUR_VOBIZ_USERNAME",
                auth_password="YOUR_VOBIZ_PASSWORD",
                numbers=["+918071XXXXXX"],               # Your Vobiz DID number
            )
        )
    )
    print(f"Trunk created: {trunk.sip_trunk_id}")

asyncio.run(setup_outbound_trunk())
```

---

## Part 6: Run & Test

### 6.1 Start the Agent

```bash
# Development mode (verbose logging)
python agent.py dev

# Production mode
python agent.py start
```

### 6.2 Test in Console (No Phone Required)

```bash
# In a second terminal — simulates a caller
python agent.py console
```

### 6.3 Test a Real Inbound Call

1. Ensure `agent.py dev` is running
2. Call your Vobiz DID phone number from any phone
3. The call routes: `Phone → Vobiz SIP → LiveKit → Your Agent`
4. You should hear the greeting from Sarvam's `anand` voice

---

## Part 7: Voice Customisation

### 7.1 Available Sarvam Bulbul v3 Voices

| Gender | Voices |
|---|---|
| **Male (23)** | `shubh`, `aditya`, `rahul`, `rohan`, `amit`, `dev`, `ratan`, `varun`, `manan`, `sumit`, `kabir`, `aayan`, `anand`, `tarun`, `sunny`, `mani`, `gokul`, `vijay`, `mohit`, `rehan`, `soham` |
| **Female (16)** | `ritu`, `priya`, `neha`, `pooja`, `simran`, `kavya`, `ishita`, `shreya`, `roopa`, `amelia`, `sophia`, `tanya`, `shruti`, `suhani`, `kavitha`, `rupali` |

### 7.2 Language Codes

| Language | Code |
|---|---|
| English (India) | `en-IN` |
| Hindi | `hi-IN` |
| Marathi | `mr-IN` |
| Tamil | `ta-IN` |
| Telugu | `te-IN` |
| Gujarati | `gu-IN` |
| Kannada | `kn-IN` |
| Bengali | `bn-IN` |
| Auto-detect | `unknown` |

### 7.3 Multilingual / Hinglish Agent

Sarvam models natively handle code-mixed speech (Hinglish, Tanglish, etc.):

```python
stt=sarvam.STT(
    language="unknown",     # Auto-detects Hindi, Marathi, Hinglish, etc.
    model="saaras:v3",
    mode="transcribe",
    flush_signal=True,
),
tts=sarvam.TTS(
    target_language_code="hi-IN",
    model="bulbul:v3",
    speaker="priya",
),
```

---

## Part 8: Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| Agent doesn't answer inbound call | Dispatch rule misconfigured | Verify agent name matches exactly (`voice-assistant`) |
| Call disconnects immediately | `sip:` prefix not removed | Remove `sip:` from Vobiz `inbound_destination` |
| `401 Unauthorized` | Credentials mismatch | Re-check Vobiz `username`/`password` in LiveKit trunk |
| Poor transcription quality | Wrong language code | Use `language="unknown"` for auto-detection |
| Agent interrupts caller mid-sentence | VAD conflict | Ensure NO `vad=` param in `AgentSession()` |
| High latency | Endpointing delay not set | Add `min_endpointing_delay=0.07` to `AgentSession` |

---

## Part 9: Production Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Restrict `allowed_addresses` in LiveKit inbound trunk to Vobiz IP ranges
- [ ] Set `language=` explicitly (not `"unknown"`) if you know the caller's language
- [ ] Monitor Vobiz account balance
- [ ] Add error handling / reconnection logic in `entrypoint()`
- [ ] Deploy `agent.py` to a cloud server (Railway, Fly.io, or a VPS) so it runs 24/7
- [ ] Use `python agent.py start` (not `dev`) in production

---

## Architecture Flow

```
Caller dials DID number
        ↓
   Vobiz SIP Trunk
        ↓
LiveKit SIP Gateway  ←── Dispatch Rule auto-spawns agent
        ↓
  LiveKit WebRTC Room
        ↓
 ┌─────────────────────────────────────────┐
 │         InboundVoiceAgent               │
 │                                         │
 │  Audio In → Sarvam STT (saaras:v3)     │
 │           → OpenAI GPT-4o (LLM)        │
 │           → Sarvam TTS (bulbul:v3)     │
 │           → Audio Out                  │
 └─────────────────────────────────────────┘
```

---

*Sarvam AI docs: [docs.sarvam.ai](https://docs.sarvam.ai) | Vobiz docs: [docs.vobiz.ai](https://docs.vobiz.ai) | LiveKit docs: [docs.livekit.io/agents](https://docs.livekit.io/agents)*
