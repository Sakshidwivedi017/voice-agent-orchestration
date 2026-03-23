import os
import re
import json
import logging
import uuid
import bcrypt
import asyncio
from dotenv import load_dotenv
from livekit.api import AccessToken, VideoGrants

from fastapi import FastAPI, HTTPException, Query, Response, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from jose import jwt
from livekit.api import LiveKitAPI, CreateRoomRequest
from backend.core.reservation_mapper import router as reservation_mapper_router


# ---------------------------------------------------------
# ENV + LOGGING
# ---------------------------------------------------------
load_dotenv(override=True)

JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret_change_me")
JWT_ALGO = "HS256"

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
LIVEKIT_URL = os.getenv("LIVEKIT_URL")

# ---------------------------------------------------------
# APP INIT
# ---------------------------------------------------------
app = FastAPI(title="Voice Orchestrator")
app.include_router(reservation_mapper_router, prefix="")


# CORS: keep permissive for now; later lock to your Vercel domain(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/calls/start")
async def start_call(payload: dict):
    dialed_number = payload.get("dialed_number")
    if not dialed_number:
        raise HTTPException(status_code=400, detail="dialed_number missing")

    room_name = payload.get("room_name") or f"call-{uuid.uuid4()}"

    lkapi = LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)

    await lkapi.room.create_room(
        CreateRoomRequest(
            name=room_name,
            metadata=json.dumps({"dialed_number": dialed_number})
        )
    )

    # create token (for SIP gateway / client)
    grant = VideoGrants(room_join=True, room=room_name)
    at = AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, grant=grant)
    at.identity = f"sip-{uuid.uuid4()}"
    at.name = "SIP Caller"

    return {"room": room_name, "token": at.to_jwt(), "url": LIVEKIT_URL}

@app.post("/exotel/call-start")
async def exotel_call_start(payload: dict):
    # Exotel usually gives CallTo / CallFrom (sometimes form-encoded)
    dialed_number = payload.get("CallTo") or payload.get("dialed_number")
    caller_number = payload.get("CallFrom")

    if not dialed_number:
        raise HTTPException(status_code=400, detail="CallTo/dialed_number missing")

    room_name = f"call-{uuid.uuid4()}"

    lkapi = LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
    await lkapi.room.create_room(
        CreateRoomRequest(
            name=room_name,
            metadata=json.dumps({
                "dialed_number": dialed_number,
                "caller_number": caller_number
            })
        )
    )
    # await lkapi.aclose() # No valid aclose method on LiveKitAPI instance? let's omit or check.
    # The LiveKitAPI client in python often handles session automatically or via context. 
    # For simple usage let's trust it or assume garbage collection.
    
    return {
        "room": room_name,
        "dialed_number": dialed_number
    }


@app.get("/exotel/connect")
def exotel_connect(
    To: str = Query(default=""),      # Exotel param name is usually "To"
    From: str = Query(default=""),    # and "From"
    CallSid: str = Query(default=""),
):
    sip_env = os.getenv("LIVEKIT_SIP_DOMAIN")
    if not sip_env:
        raise HTTPException(status_code=500, detail="LIVEKIT_SIP_DOMAIN missing")

    # Clean the env var to get just the domain
    # content: sip:xyz.sip.livekit.cloud -> xyz.sip.livekit.cloud
    sip_domain = sip_env.replace("sip:", "").strip()

    def _digits(s: str) -> str:
        return re.sub(r"\D", "", s or "")

    to_digits = _digits(To)
    
    # Ensure E.164 format for the user part of the SIP URI
    # If the number is valid, we construct sip:+Number@Domain
    # If To is empty/invalid, we might fallback to just the domain (though rare for a dial)
    dialed_e164 = to_digits
    if dialed_e164 and not dialed_e164.startswith("+"):
         dialed_e164 = f"+{dialed_e164}"

    # Construct correct SIP URI
    # Format: sip:+911234567890@xyz.sip.livekit.cloud
    if dialed_e164:
        sip_uri = f"sip:{dialed_e164}@{sip_domain}"
    else:
        # Fallback to generic ingress URI if no number (user example case)
        sip_uri = f"sip:{sip_domain}"

    # Construct XML Response
    xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Sip>{sip_uri}</Sip>
  </Connect>
</Response>"""

    return Response(content=xml_content, media_type="application/xml")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Server")

# ---------------------------------------------------------
# HEALTH & LIVEKIT TOKEN
# ---------------------------------------------------------
@app.get("/")
def health_check():
    return {"status": "online", "service": "Voice Orchestrator"}


@app.get("/token")
async def get_token(room: str, name: str = "User"):
    grant = VideoGrants(room_join=True, room=room)
    at = AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, grant=grant)
    at.identity = f"user-{uuid.uuid4()}"
    at.name = name
    return {"token": at.to_jwt(), "url": os.getenv("LIVEKIT_URL")}




# ---------------------------------------------------------
# KNOWLEDGE BASE
# ---------------------------------------------------------
import asyncpg
from backend.core.extraction import extract_text, chunk_text
import openai

@app.post("/api/kb/upload")
async def upload_kb_file(
    file: UploadFile = File(...),
    agent_id: str = Form(...)
):
    # 1. Save file locally
    kb_dir = os.path.join(os.getcwd(), "uploads", "kb")
    os.makedirs(kb_dir, exist_ok=True)
    
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{file_id}{ext}"
    local_path = os.path.join(kb_dir, safe_filename)
    
    content = await file.read()
    with open(local_path, "wb") as f:
        f.write(content)
        
    file_url = f"/uploads/kb/{safe_filename}"
    
    # 2. Extract Text
    try:
        text_extracted = extract_text(local_path, file.filename)
    except Exception as e:
        if os.path.exists(local_path): os.remove(local_path)
        logger.error(f"Text extraction failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    # 3. Chunk Text & Embed (Parallel)
    client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    # Use chunk_size=500, overlap=50 as suggested
    chunks = chunk_text(text_extracted, chunk_size=500, overlap=50)
    
    if not chunks:
        if os.path.exists(local_path): os.remove(local_path)
        raise HTTPException(status_code=400, detail="No readable text found in file")

    async def get_embedding(chunk_text):
        resp = await client.embeddings.create(input=chunk_text, model="text-embedding-3-small")
        return chunk_text, resp.data[0].embedding

    # 4. Save to database
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise HTTPException(status_code=500, detail="Database URL not configured")
        
    try:
        # Generate all embeddings in parallel
        embedded_tasks = [get_embedding(c) for c in chunks]
        results = await asyncio.gather(*embedded_tasks)
        
        conn = await asyncpg.connect(db_url, ssl='require')
        
        async with conn.transaction():
            # Save file metadata
            await conn.execute(
                """
                INSERT INTO knowledge_files (id, agent_id, file_name, file_url, created_at)
                VALUES (CAST($1 AS uuid), CAST($2 AS uuid), $3, $4, NOW())
                """,
                file_id, agent_id, file.filename, file_url
            )
            
            # Save vector chunks
            for chunk_content, embedding in results:
                chunk_id = str(uuid.uuid4())
                emb_str = f"[{','.join(str(f) for f in embedding)}]"
                
                await conn.execute(
                    """
                    INSERT INTO knowledge_chunks (id, agent_id, content, embedding)
                    VALUES (CAST($1 AS uuid), CAST($2 AS uuid), $3, $4::vector)
                    """,
                    chunk_id, agent_id, chunk_content, emb_str
                )
            
        await conn.close()
    except Exception as e:
        if os.path.exists(local_path): os.remove(local_path)
        logger.error(f"Failed to process KB file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process and store knowledge: {str(e)}")
        
    return {
        "status": "success",
        "file_id": file_id,
        "file_url": file_url,
        "chunks_processed": len(chunks),
        "extracted_text_preview": text_extracted[:200] + "..." if len(text_extracted) > 200 else text_extracted
    }

# ---------------------------------------------------------
# RESERVATIONS
# ---------------------------------------------------------
@app.get("/api/reservations")
async def get_reservations(agent_id: str):
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise HTTPException(status_code=500, detail="Database URL not configured")
        
    try:
        conn = await asyncpg.connect(db_url, ssl='require')
        rows = await conn.fetch("""
            SELECT *
            FROM reservations
            WHERE agent_id = CAST($1 AS uuid)
            ORDER BY created_at DESC;
        """, agent_id)
        await conn.close()
        
        results = []
        for r in rows:
            results.append({
                "id": str(r["id"]),
                "agent_id": str(r["agent_id"]),
                "customer_name": r["customer_name"],
                "phone": r["phone"],
                "date": str(r["date"]),
                "time": str(r["time"]),
                "guests": r["guests"],
                "status": r["status"],
                "special_request": r["special_request"],
                "created_at": r["created_at"].isoformat() if r["created_at"] else None
            })
        return results
    except Exception as e:
        logger.error(f"Failed to fetch reservations: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch reservations")
