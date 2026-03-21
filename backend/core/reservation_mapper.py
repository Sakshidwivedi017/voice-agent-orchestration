import re
from datetime import datetime
from fastapi import APIRouter

router = APIRouter()

# -----------------------------
# HELPERS
# -----------------------------

def _clean_text(val):
    """Return clean string or empty."""
    if not val:
        return ""
    return str(val).strip()


def _clean_phone(phone):
    """Normalize phone numbers: digits only."""
    if not phone:
        return ""

    phone = str(phone)
    phone = re.sub(r"[^\d]", "", phone)  # keep digits only
    return phone


def _clean_date(date_str):
    """Normalize date into YYYY-MM-DD."""
    if not date_str:
        return ""

    date_str = date_str.strip()

    # Already valid
    if re.match(r"^\d{4}-\d{2}-\d{2}$", date_str):
        return date_str

    # Try flexible parsing
    formats = [
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%d %m %Y",
        "%d %b %Y",
        "%d %B %Y",
    ]

    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime("%Y-%m-%d")
        except Exception:
            continue

    # If everything fails → return raw
    return date_str


def _clean_time(time_str):
    """Normalize time into HH:MM (24h)."""
    if not time_str:
        return ""

    t = time_str.lower().replace(" ", "").replace(".", "")

    # Formats like 7pm, 7:30pm
    match = re.match(r"^(\d{1,2})(:?(\d{2}))?(am|pm)?$", t)
    if match:
        hour = int(match.group(1))
        minute = int(match.group(3)) if match.group(3) else 0
        ampm = match.group(4)

        if ampm == "pm" and hour != 12:
            hour += 12
        elif ampm == "am" and hour == 12:
            hour = 0

        return f"{hour:02d}:{minute:02d}"

    # Already HH:MM
    if re.match(r"^\d{2}:\d{2}$", t):
        return t

    return t


def _clean_guests(guests):
    """Ensure valid guest count (int >=1)."""
    if guests is None:
        return 2

    try:
        g = int(guests)
        return max(g, 1)
    except Exception:
        return 2


# -----------------------------
# MAIN NORMALIZER
# -----------------------------

def normalize_reservation_data(data: dict) -> dict:
    """
    Clean & normalize RAW reservation data captured during the call.

    Accepts BOTH:
    - new tool fields: guest_name, guest_phone, special_requests
    - old fields: name, phone, special
    """

    # NEW + FALLBACK
    name = _clean_text(data.get("guest_name") or data.get("name"))
    phone = _clean_phone(data.get("guest_phone") or data.get("phone"))
    special = _clean_text(data.get("special_requests") or data.get("special"))

    # ALWAYS PRESENT
    date = _clean_date(data.get("date"))
    time = _clean_time(data.get("time"))
    guests = _clean_guests(data.get("guests"))

    return {
        "guest_name": name,
        "guest_phone": phone,
        "date": date,
        "time": time,
        "guests": guests,
        "special_requests": special
    }


# -----------------------------
# DEBUG ENDPOINT
# -----------------------------
@router.post("/test-mapper")
def test_mapper(payload: dict):
    """
    Test mapping with sample JSON such as:
    {
        "guest_name": "Sid",
        "guest_phone": "77777",
        "date": "2 Dec 2025",
        "time": "7pm",
        "guests": "4",
        "special_requests": "birthday"
    }
    Or old format:
    {
        "name": "Sid",
        "phone": "777 77 777",
        "date": "2/12/2025",
        "time": "7pm",
        "guests": "4",
        "special": "birthday"
    }
    """
    return normalize_reservation_data(payload)
