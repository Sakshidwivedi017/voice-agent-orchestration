import os
import logging
import httpx
from datetime import datetime

logger = logging.getLogger("notify")


# ─── WhatsApp via Twilio ──────────────────────────────────────────────────────

def send_whatsapp(to_phone: str, message: str) -> bool:
    """Send a WhatsApp message via Twilio."""
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID", "")
    auth_token  = os.environ.get("TWILIO_AUTH_TOKEN", "")
    from_number = os.environ.get("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

    if not account_sid or not auth_token:
        logger.debug("[WHATSAPP] Twilio credentials not set — skipping.")
        return False

    to_wa = f"whatsapp:{to_phone}" if not to_phone.startswith("whatsapp:") else to_phone

    try:
        resp = httpx.post(
            f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
            auth=(account_sid, auth_token),
            data={"From": from_number, "To": to_wa, "Body": message},
            timeout=8.0,
        )
        resp.raise_for_status()
        logger.info(f"[WHATSAPP] Sent to {to_phone}: {resp.status_code}")
        return True
    except Exception as e:
        logger.error(f"[WHATSAPP] Failed to send to {to_phone}: {e}")
        return False


def _booking_whatsapp(caller_phone: str, caller_name: str, booking_time_iso: str) -> bool:
    """Send WhatsApp confirmation after a booking is made."""
    try:
        dt = datetime.fromisoformat(booking_time_iso)
        readable = dt.strftime("%A, %d %B %Y at %I:%M %p IST")
    except Exception:
        readable = booking_time_iso

    message = (
        f"✅ Hi {caller_name or 'there'}! Your appointment is *confirmed*.\n\n"
        f"📅 *Date & Time:* {readable}\n\n"
        f"If you need to reschedule or cancel, just call us back.\n\n"
        f"— RapidX AI 🤖"
    )
    return send_whatsapp(caller_phone, message)


# ─── Notification Functions ───────────────────────────────────────────────────

def notify_booking_confirmed(
    caller_name: str,
    caller_phone: str,
    booking_time_iso: str,
    booking_id: str,
    notes: str = "",
    tts_voice: str = "",
    ai_summary: str = "",
) -> bool:
    """Send WhatsApp confirmation when a booking is confirmed."""
    logger.info(f"[NOTIFY] Booking confirmed for {caller_name} ({caller_phone})")
    return _booking_whatsapp(caller_phone, caller_name, booking_time_iso)


def notify_booking_cancelled(
    caller_name: str,
    caller_phone: str,
    booking_id: str,
    reason: str = "",
) -> bool:
    logger.info(f"[NOTIFY] Booking cancelled for {caller_name} ({caller_phone})")
    return True  # No-op without Telegram; extend with WhatsApp if needed


def notify_call_no_booking(
    caller_name: str,
    caller_phone: str,
    call_summary: str = "",
    tts_voice: str = "",
    ai_summary: str = "",
    duration_seconds: int = 0,
) -> bool:
    logger.info(f"[NOTIFY] Call ended, no booking — {caller_phone} ({duration_seconds}s)")
    return True


def notify_agent_error(caller_phone: str, error: str) -> bool:
    logger.error(f"[NOTIFY] Agent error on {caller_phone}: {error}")
    return True


# ─── n8n / Custom Webhook ─────────────────────────────────────────────────────

async def send_webhook(webhook_url: str, event_type: str, payload: dict) -> bool:
    """Deliver an event to a configurable webhook URL."""
    if not webhook_url:
        return False
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                webhook_url,
                json={
                    "event":     event_type,
                    "timestamp": datetime.utcnow().isoformat(),
                    "data":      payload,
                },
                headers={"Content-Type": "application/json"},
            )
            logger.info(f"[WEBHOOK] Delivered {event_type} → {resp.status_code}")
            return resp.status_code < 300
    except Exception as e:
        logger.warning(f"[WEBHOOK] Failed to deliver {event_type}: {e}")
        return False
