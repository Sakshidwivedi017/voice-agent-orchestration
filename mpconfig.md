---

# 🔄 Change: Move Calendar Booking to Post-Call

## What Changes

| | Before | Now |
|---|---|---|
| **During call** | Agent books directly via MCP tool | Agent only collects details (date, time, email) |
| **After call** | Nothing | Shutdown callback creates the calendar event |
| **Caller experience** | Slight pause mid-call while MCP runs | Zero interruption — call flows naturally |

---

## Step 1: Remove Calendar `@function_tool` from the Agent

Replace the two calendar `@function_tool` functions with a single
**data-collection-only tool** that just saves what the caller wants.
No MCP, no API call — just storing the info.

```python
# agent.py

import asyncio
import logging
from dotenv import load_dotenv
from livekit.agents import JobContext, WorkerOptions, cli, function_tool, RunContext
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import openai, sarvam
from calendar_mcp import create_calendar_event  # Only used post-call

load_dotenv()
logger = logging.getLogger("sarvam-voice-agent")


# ── Shared booking store (populated during call, used after) ──────────────────
class BookingStore:
    def __init__(self):
        self.requested = False
        self.title: str = "Follow-up Call"
        self.date: str = None
        self.start_time: str = None
        self.duration_minutes: int = 30
        self.attendee_email: str = None
        self.notes: str = None

    def is_complete(self) -> bool:
        """True only if we have everything needed to create the event."""
        return all([self.date, self.start_time, self.attendee_email])

    def summary(self) -> str:
        return (
            f"'{self.title}' on {self.date} at {self.start_time} "
            f"({self.duration_minutes} mins) → {self.attendee_email}"
        )
```

---

## Step 2: The One Tool — `save_booking_details`

This is the **only** calendar-related tool the live agent has.
It just saves what the caller said — no external calls whatsoever.

```python
def make_save_booking_tool(store: BookingStore):
    """
    Factory that returns a function_tool bound to the call's BookingStore.
    Called by the agent when the caller confirms they want an appointment.
    """

    @function_tool
    async def save_booking_details(
        context: RunContext,
        date: str,
        start_time: str,
        attendee_email: str,
        title: str = "Follow-up Call",
        duration_minutes: int = 30,
        notes: str = None,
    ) -> str:
        """
        Save the caller's appointment details for post-call processing.
        Call this ONLY after the caller has confirmed ALL details verbally.
        Do NOT call this speculatively — wait for explicit confirmation.

        Args:
            date: Appointment date in YYYY-MM-DD format
            start_time: Start time in 24-hour HH:MM format (IST)
            attendee_email: Caller's email address for the calendar invite
            title: Short appointment name, default 'Follow-up Call'
            duration_minutes: Meeting length in minutes, default 30
            notes: Any extra context the caller mentioned
        """
        store.requested = True
        store.title = title
        store.date = date
        store.start_time = start_time
        store.duration_minutes = duration_minutes
        store.attendee_email = attendee_email
        store.notes = notes
        store.is_complete()

        logger.info(f"📋 Booking details saved: {store.summary()}")

        # Return a confirmation string — agent reads this out to the caller
        return (
            f"Got it. I've noted your appointment: {title} on {date} at {start_time}. "
            f"I'll send the calendar invite to {attendee_email} once our call ends."
        )

    return save_booking_details
```

---

## Step 3: Updated `InboundVoiceAgent`

```python
class InboundVoiceAgent(Agent):
    def __init__(self, store: BookingStore) -> None:
        super().__init__(
            instructions="""
            You are a friendly inbound voice assistant.

            Booking behaviour:
            - At the END of the call, ask once: "Would you like to schedule
              a follow-up?" — never push it mid-conversation.
            - If YES: collect date → time → email, ONE question at a time.
            - Convert relative dates ("tomorrow", "next Monday") to YYYY-MM-DD.
            - Convert times ("3 PM", "half past 2") to 24-hour HH:MM format.
            - Confirm ALL details back to the caller before calling save_booking_details.
            - After saving: tell them "I'll send the calendar invite to your
              email once our call wraps up." Do NOT say it's done yet.
            - If they say NO to booking, just wrap up warmly.
            """,

            # Only one tool — saves details, no external calls
            tools=[make_save_booking_tool(store)],

            stt=sarvam.STT(
                language="unknown",
                model="saaras:v3",
                mode="transcribe",
                flush_signal=True,
            ),
            llm=openai.LLM(model="gpt-4o"),
            tts=sarvam.TTS(
                target_language_code="en-IN",
                model="bulbul:v3",
                speaker="anand",
            ),
        )

    async def on_enter(self):
        import datetime, pytz
        today = datetime.datetime.now(pytz.timezone("Asia/Kolkata")).strftime("%A, %B %d, %Y")
        await self.session.generate_reply(
            instructions=f"Today is {today}. Greet the caller warmly and ask how you can help."
        )
```

---

## Step 4: Updated `entrypoint` — Post-Call Booking Trigger

```python
async def entrypoint(ctx: JobContext):
    logger.info(f"Inbound call: {ctx.room.name}")

    # One store per call — passed into both the agent and the shutdown hook
    store = BookingStore()

    @ctx.add_shutdown_callback
    async def on_call_ended(_ctx: JobContext):
        """
        Runs automatically when the caller hangs up.
        Creates the Google Calendar event if booking details were collected.
        """
        logger.info("📞 Call ended. Checking for post-call booking...")

        if not store.requested:
            logger.info("No booking requested. Nothing to do.")
            return

        if not store.is_complete():
            logger.warning(
                f"Booking requested but incomplete details: "
                f"date={store.date}, time={store.start_time}, "
                f"email={store.attendee_email}. Skipping."
            )
            return

        logger.info(f"🗓️  Creating calendar event: {store.summary()}")

        try:
            result = await create_calendar_event(
                title=store.title,
                date=store.date,
                start_time=store.start_time,
                duration_minutes=store.duration_minutes,
                attendee_email=store.attendee_email,
                description=store.notes,
            )
            logger.info(f"✅ Post-call booking complete: {result}")

        except Exception as e:
            logger.error(f"❌ Post-call booking failed: {e}")

    session = AgentSession(
        turn_detection="stt",
        min_endpointing_delay=0.07,
    )

    await session.start(
        agent=InboundVoiceAgent(store=store),
        room=ctx.room,
    )
```

---

## How It Flows Now

```
During the call:
─────────────────────────────────────────────────
Caller: "Can we book a follow-up?"
Agent:  "Sure! What date works?" → "What time?" → "What's your email?"
Agent:  [Calls save_booking_details(...)]  ← stores to BookingStore, NO API call
Agent:  "Perfect! I'll send the invite to your email once our call wraps up."

After the caller hangs up:
─────────────────────────────────────────────────
ctx.add_shutdown_callback fires
→ store.is_complete() == True
→ create_calendar_event() called via MCP
→ Google Calendar event created
→ Email invite sent to caller
→ Done ✅
```

---

## Summary of What the `agent.py` Imports Now

```python
# agent.py — full import block
import asyncio
import logging
from dotenv import load_dotenv
from livekit.agents import JobContext, WorkerOptions, cli, function_tool, RunContext
from livekit.agents.voice import Agent, AgentSession
from livekit.plugins import openai, sarvam
from calendar_mcp import create_calendar_event   # ← only used post-call in shutdown hook
```

No MCP connection is ever open during the live call — it only spins up
in the shutdown callback after the caller disconnects.
