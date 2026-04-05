# Vaani — AI Voice Agent Platform

> **IMADGEN** · Production-ready, multi-tenant AI phone agent system for hospitality, retail, and service businesses in India.

Vaani is a full-stack platform that enables businesses to deploy AI-powered voice agents on their existing phone numbers. Callers speak naturally in English, Hindi, or Hinglish; the agent understands, responds in real-time, handles bookings, answers questions from a knowledge base, and logs every call — all without human intervention.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
   - [Agent (`agent.py`)](#agent-agentpy)
   - [Backend (`backend/`)](#backend-backend)
   - [Frontend (`frontend/`)](#frontend-frontend)
4. [AI & Voice Pipeline](#ai--voice-pipeline)
5. [Database Schema (Key Tables)](#database-schema-key-tables)
6. [API Reference](#api-reference)
7. [Agent Tools](#agent-tools)
8. [Knowledge Base (RAG)](#knowledge-base-rag)
9. [Call Logging & Analytics](#call-logging--analytics)
10. [Authentication & Session Management](#authentication--session-management)
11. [Ambient Audio](#ambient-audio)
12. [Deployment](#deployment)
13. [Environment Variables](#environment-variables)
14. [Local Development](#local-development)
15. [Technology Stack](#technology-stack)

---

## High-Level Architecture

```
Caller's Phone
      │  (SIP/PSTN via Exotel)
      ▼
LiveKit SIP Gateway
      │
      ▼
 agent.py (LiveKit Worker)
  ├── STT  :  Sarvam Saaras v3  (hi-IN, Hinglish-aware)
  ├── LLM  :  OpenAI GPT-4o-mini
  ├── TTS  :  Sarvam Bulbul v3  (Simran voice, 1.1× pace)
  ├── VAD  :  Silero (voice activity detection)
  └── Tools:  save_reservation / get_reservation /
              search_knowledge_base / cancel / update
      │
      ├── asyncpg → Supabase Postgres (pgvector enabled)
      │      ├── agents          (config per tenant)
      │      ├── phone_numbers   (DID → agent mapping)
      │      ├── reservations    (bookings)
      │      ├── call_logs       (transcript + intent)
      │      └── knowledge_chunks (vector embeddings)
      │
      └── FastAPI Backend  (backend/server.py)
            ├── /api/kb/upload      (file → embeddings → DB)
            ├── /api/reservations   (read reservations)
            ├── /calls/start        (create LiveKit room)
            └── /exotel/*           (Exotel SIP webhook)

Next.js Frontend (frontend/)
  ├── /voice-client   → Agent dashboard (protected)
  ├── /voice-admin    → Admin panel
  ├── /auth           → Login / Register
  ├── /agents         → Public agents showcase
  ├── /studio         → AI Creative Studio page
  └── /api/*          → Next.js API routes
        ├── /api/agent/save-config
        ├── /api/agent/get-config
        ├── /api/reservations
        └── /api/analytics
```

---

## Project Structure

```
voice-agent/
├── agent.py                  # LiveKit voice agent worker (main AI logic)
├── requirements.txt          # Python dependencies
├── Dockerfile                # Multi-stage Docker build
├── supervisord.conf          # Process manager (agent + API server)
├── bg.mp3                    # Default ambient audio file
├── .env                      # Environment secrets (gitignored)
├── .env.example              # Template for environment variables
│
├── backend/                  # Python FastAPI server
│   ├── server.py             # REST API: KB upload, reservations, LiveKit tokens
│   └── core/
│       ├── extraction.py     # File text extraction (PDF, PPTX, DOCX, TXT, CSV)
│       └── reservation_mapper.py  # Reservation data normalization router
│
├── uploads/                  # Uploaded KB files stored here
│   └── kb/                   # UUID-named knowledge base files
│
└── frontend/                 # Next.js 16 marketing + dashboard
    └── src/
        ├── app/
        │   ├── page.tsx          # Landing page (IMADGEN homepage)
        │   ├── layout.tsx        # Root layout, fonts, metadata
        │   ├── agents/           # AI agents showcase page
        │   ├── studio/           # AI Creative Studio page
        │   ├── os/               # Marketing OS page
        │   ├── about/            # About page
        │   ├── demo/             # Demo page
        │   ├── auth/             # Login / Register
        │   ├── voice/            # Voice demo page
        │   ├── voice-client/     # Protected agent management dashboard
        │   ├── voice-admin/      # Admin panel
        │   └── api/              # Next.js API routes
        │       ├── agent/        # save-config, get-config
        │       ├── reservations/ # Reservation fetch
        │       ├── analytics/    # Analytics data
        │       └── auth/         # Auth endpoints
        ├── components/
        │   ├── ui/               # Design system (114 components)
        │   ├── effects/          # Background visuals (NetBGE, SwarmsBGE)
        │   └── providers/        # React context providers
        ├── lib/
        │   ├── auth.ts           # JWT sign/verify (Web Crypto API)
        │   ├── db.ts             # PostgreSQL connection pool (pg)
        │   └── utils.ts          # Shared utility functions
        └── middleware.ts         # Route protection for /voice-client
```

---

## Core Components

### Agent (`agent.py`)

The heart of the platform. A long-running LiveKit worker that:

1. **Waits for incoming calls** dispatched by LiveKit Cloud.
2. **Resolves agent configuration** from the database based on the dialed phone number (DID). Falls back gracefully to the most recently created agent if no direct match is found.
3. **Builds a voice pipeline** with STT → LLM → TTS using the Sarvam and OpenAI plugins.
4. **Starts an `AgentSession`** with Silero VAD for responsive turn-detection.
5. **Speaks a personalized first message** (fetched from DB, normalized for Hinglish pronunciation).
6. **Handles the full conversation** including tool calls for bookings, lookups, cancellations, and knowledge base queries.
7. **Streams optional ambient restaurant audio** (looped `bg.mp3` or any URL/path) as a background track in the LiveKit room.
8. **On shutdown** (call ends): captures the full transcript from the chat context, generates an LLM-powered call summary and intent classification, and saves everything to `call_logs`.
9. **Auto-restarts** with a 5-second delay after any crash, ensuring 24/7 uptime.

#### Key Design Decisions

| Feature | Implementation |
|---------|----------------|
| Resilience | Infinite `while True` loop with typed exception handling (`SystemExit`, `KeyboardInterrupt`, generic `Exception`) |
| DB Connection | `asyncpg` connection pool per call (2–5 connections), closed on shutdown |
| SSL (macOS) | `certifi` + `ssl._create_unverified_context` for macOS certificate issues |
| OpenAI Client | Singleton `_openai_client` cached per process to avoid per-request instantiation overhead |

---

### Backend (`backend/`)

A **FastAPI** application exposing REST endpoints consumed by both the Next.js frontend and the LiveKit agent.

#### `backend/server.py`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check — returns `{"status": "online"}` |
| `/token` | GET | Issues a LiveKit JWT for room join |
| `/calls/start` | POST | Creates a LiveKit room and returns a SIP-ready token |
| `/exotel/call-start` | POST | Handles Exotel call webhooks; creates a LiveKit room |
| `/exotel/connect` | GET | Returns Exotel XML response to bridge call to LiveKit SIP |
| `/api/kb/upload` | POST | Uploads a KB file, extracts text, chunks it, embeds with OpenAI, saves vectors to DB |
| `/api/reservations` | GET | Fetches all reservations for a given `agent_id` |
| `/test-mapper` | POST | Debug endpoint for reservation data normalization |

#### `backend/core/extraction.py`

Extracts plain text from uploaded files. Supported formats:

- `.pdf` — via `pdfplumber`
- `.pptx` — via `python-pptx`
- `.docx` — via `python-docx`
- `.txt` — native file read
- `.csv` — native csv reader

Also implements `chunk_text(text, chunk_size=500, overlap=50)` — word-aware chunker with configurable overlap for vector storage.

#### `backend/core/reservation_mapper.py`

A FastAPI router providing data normalization utilities for reservation payloads captured during a call:

- **Phone**: strips non-digit characters
- **Date**: normalizes to `YYYY-MM-DD` from multiple formats (`DD-MM-YYYY`, `DD/MM/YYYY`, `DD Mon YYYY`, etc.)
- **Time**: normalizes to `HH:MM` 24-hour format from `7pm`, `7:30pm`, `19:30`, etc.
- **Guests**: ensures a valid integer ≥ 1

---

### Frontend (`frontend/`)

A **Next.js 16** (App Router) application serving dual purposes:

1. **Marketing website** for IMADGEN — landing page, verticals showcase, agent catalogue, contact form.
2. **Operator dashboard** — authenticated area where business owners configure their AI agent, view call logs, manage reservations, and upload knowledge base files.

#### Key Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — animated hero, verticals grid, brand carousel, world clock section, contact form |
| `/agents` | AI Agents showcase with filterable cards (Sales, Support, Ops, Growth) |
| `/studio` | AI Creative Studio vertical page |
| `/os` | Marketing OS vertical page |
| `/about` | About IMADGEN |
| `/demo` | Demo request / live demo page |
| `/auth` | Login / Register (JWT-based, HTTP-only cookie) |
| `/voice-client` | **Protected** — agent management dashboard for operators |
| `/voice-admin` | Admin panel |
| `/voice` | Public voice demo |

#### Design System

The frontend has a rich component library under `src/components/ui/` (114 components) organized into functional categories:

- **Layout**: `Container`, `Section`, `Grid`, `Flex`, `Stack`, `Cluster`, `Surface`
- **Typography**: `Heading`, `Text`
- **Forms**: `Button`, `Input`, `Textarea`, `FormField`
- **Marketing**: `Hero`
- **Chat**: `ChatPage`, `ChatContext` — interactive AI chat interface embedded on the homepage
- **Effects**: `NetBGE` (animated network background), `SwarmsBGE` (particle swarm effect)

---

## AI & Voice Pipeline

```
Caller Audio
    │
    ▼
[STT] Sarvam Saaras v3
  · Language: hi-IN  (supports English, Hindi, Hinglish natively)
  · flush_signal: True  (faster phrase completion detection)
    │
    ▼
[VAD] Silero (local ONNX model, no API latency)
  · activation_threshold: 0.5
  · min_silence_duration: 0.8s (natural pause before agent responds)
  · min_speech_duration: 0.1s  (ignores micro-noises/clicks)
  · prefix_padding_duration: 0.2s
    │
    ▼
[LLM] OpenAI GPT-4o-mini
  · System prompt fetched from DB per business
  · IST time context injected dynamically
  · Pronunciation guidelines for Indian names/places
  · Function calling for 5 registered tools
    │
    ▼
[TTS] Sarvam Bulbul v3
  · Speaker: simran (natural, conversational Indian voice)
  · Language: hi-IN
  · Pace: 1.1× (slightly faster for service bot feel)
    │
    ▼
Caller's earpiece
```

### Hinglish Text Normalization (`normalize_indian_text`)

Applied to all agent speech before TTS synthesis:

- **Phonetic spacing** for Hinglish words (`Haanji → Haan ji`, `Namaste → Na-mas-te`)
- **Symbol/abbreviation expansion** (`Rs. → Rupees`, `& → and`, `@ → at the rate`)
- **Punctuation injection** — adds commas before natural filler words for TTS breathing cadence
- **Terminal period** — ensures all utterances end with punctuation for clean TTS finishing

### Phone Number Normalization (`normalize_number`)

Handles all Indian number variants → E.164 `+91XXXXXXXXXX`:

| Input | Output |
|-------|--------|
| `9876543210` | `+919876543210` |
| `919876543210` | `+919876543210` |
| `09876543210` | `+919876543210` |
| `+919876543210` | `+919876543210` |

---

## Database Schema (Key Tables)

> Database: **Supabase Postgres** with `pgvector` extension for semantic search.

### `agents`
Stores per-tenant AI agent configuration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Agent identifier |
| `system_prompt` | TEXT | LLM system prompt for this business |
| `first_message` | TEXT | Greeting spoken when call connects |
| `created_at` | TIMESTAMP | Creation timestamp |

### `phone_numbers`
Maps DID phone numbers to agents.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | |
| `agent_id` | UUID (FK → agents) | |
| `phone_number` | TEXT | E.164 phone number |

### `reservations`
All bookings captured by the voice agent.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | |
| `agent_id` | UUID (FK → agents) | |
| `customer_name` | TEXT | |
| `phone` | TEXT | Caller's number |
| `date` | DATE | Reservation date |
| `time` | TIME | Reservation time |
| `guests` | INTEGER | Party size |
| `status` | TEXT | `confirmed` / `cancelled` |
| `special_request` | TEXT | Guest requests |
| `created_at` | TIMESTAMP | |

### `call_logs`
Full call history with transcript, duration, and LLM-generated analytics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | |
| `agent_id` | UUID (FK → agents) | |
| `caller_number` | TEXT | Caller's E.164 number |
| `phone_number` | TEXT | Dialed DID |
| `duration` | INTEGER | Call duration in seconds |
| `intent` | TEXT | LLM-classified intent category |
| `summary` | TEXT | One-sentence LLM summary |
| `transcript` | TEXT | Full conversation transcript |
| `status` | TEXT | `resolved` |
| `created_at` | TIMESTAMP | |

### `knowledge_files`
Metadata for uploaded KB documents.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | |
| `agent_id` | UUID (FK → agents) | |
| `file_name` | TEXT | Original file name |
| `file_url` | TEXT | Local storage path |
| `created_at` | TIMESTAMP | |

### `knowledge_chunks`
Vector chunks for semantic search (pgvector).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | |
| `agent_id` | UUID (FK → agents) | |
| `content` | TEXT | Text chunk |
| `embedding` | VECTOR(1536) | OpenAI `text-embedding-3-small` |

---

## API Reference

### Python Backend (FastAPI — `backend/server.py`)

#### `GET /`
Health check.
```json
{ "status": "online", "service": "Voice Orchestrator" }
```

#### `GET /token?room=<room>&name=<name>`
Returns a LiveKit JWT for a participant joining a room.

#### `POST /calls/start`
```json
{ "dialed_number": "+911234567890", "room_name": "optional-room-name" }
```
Creates a LiveKit room and returns `{ room, token, url }`.

#### `POST /exotel/call-start`
Exotel webhook. Body: `{ "CallTo": "+91...", "CallFrom": "+91..." }`.

#### `GET /exotel/connect?To=&From=&CallSid=`
Returns an Exotel XML `<Connect><Sip>` response that bridges the call into LiveKit.

#### `POST /api/kb/upload`
Multipart form: `file` + `agent_id`. Extracts, chunks, embeds, and stores KB content.
```json
{
  "status": "success",
  "file_id": "uuid",
  "file_url": "/uploads/kb/uuid.pdf",
  "chunks_processed": 42,
  "extracted_text_preview": "..."
}
```

#### `GET /api/reservations?agent_id=<uuid>`
Returns all reservations for an agent, ordered by creation time.

---

### Next.js API Routes (`frontend/src/app/api/`)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/agent/save-config` | POST | Create or update an agent's system prompt, first message, etc. Returns `agent_id` |
| `/api/agent/get-config` | GET | Fetch an agent's configuration by `agent_id` |
| `/api/reservations` | GET | Fetch reservations for dashboard display |
| `/api/analytics` | GET | Returns call analytics data for the dashboard |
| `/api/auth/*` | POST | Auth endpoints (login, register, logout) |

---

## Agent Tools

The `AgentTools` class (in `agent.py`) exposes five function tools to GPT-4o-mini via LiveKit's `@llm.function_tool` decorator. Each tool is scoped to the current `agent_id` and `caller_phone`.

### `search_knowledge_base(query: str)`
Performs semantic (vector) search over the agent's uploaded KB documents.
1. Calls OpenAI `text-embedding-3-small` to embed the user's query.
2. Queries `knowledge_chunks` with `pgvector` cosine distance (`<->`) operator.
3. Returns top-3 matching chunks concatenated.

### `save_reservation(name, date, time, guests, phone?, special_req?)`
Books a table/room by inserting into the `reservations` table.
- Parses dates in both `YYYY-MM-DD` and `DD-MM-YYYY` formats.
- Uses caller's phone if `phone` argument is omitted.
- Returns a confirmation string on success.

### `get_reservation(phone?, date?)`
Looks up an existing reservation for modification or cancellation context.
- Defaults to the current caller's number.
- Returns reservation ID, name, date, time, and guests.

### `update_reservation(res_id, date?, time?, guests?)`
Updates an existing reservation's date, time, or guest count by ID.
- Builds a dynamic `UPDATE` query based on which fields are provided.

### `cancel_reservation(res_id)`
Sets a reservation's status to `cancelled` by ID.

---

## Knowledge Base (RAG)

The platform implements Retrieval-Augmented Generation (RAG) to let agents answer questions specific to each business (menu items, policies, hours, pricing, etc.).

**Upload flow:**
1. Operator uploads a file via the dashboard → hits `POST /api/kb/upload`
2. File is saved to `uploads/kb/` with a UUID filename
3. Text is extracted (PDF / PPTX / DOCX / TXT / CSV)
4. Text is chunked into ~500-character overlapping segments
5. Each chunk is embedded using OpenAI `text-embedding-3-small` (1536 dimensions)
6. Embeddings + text are stored in `knowledge_chunks` with `pgvector`

**Query flow (during a live call):**
1. Caller asks a question → agent calls `search_knowledge_base`
2. Query is embedded in real-time
3. Top-3 nearest chunks are retrieved via cosine distance
4. Chunks are injected into the LLM context as grounding

---

## Call Logging & Analytics

Every call is fully logged at the end of the session via the `on_shutdown` callback:

1. **Transcript capture** — reads `assistant.chat_ctx.messages` for the authoritative full conversation history. Falls back to segment-by-segment listeners if chat context is unavailable.

2. **Intent Classification** — GPT-4o-mini classifies the call into one of:
   - `New reservation`, `Modify reservation`, `Cancel reservation`
   - `Menu question`, `Room reservation`
   - `Housekeeping`, `laundry`, `In-room dining`, `Spa-booking`
   - `Airport Pickup`, `Maintenance`, `complaint`, `other`

3. **Summary** — GPT-4o-mini generates a one-sentence summary alongside the intent.

4. **Database persistence** — all data is written to `call_logs` using a fresh direct connection on shutdown.

---

## Authentication & Session Management

Authentication is implemented using the browser's native **Web Crypto API** (`crypto.subtle`) — no third-party auth libraries:

- **Algorithm**: HMAC-SHA256 (HS256 JWT)
- **Token lifetime**: 7 days
- **Storage**: HTTP-only cookie (`voice_client_session`)
- **Middleware**: `src/middleware.ts` intercepts all `/voice-client/*` routes, verifies the token cryptographically, and passes the `x-user-id` header to downstream Route Handlers

---

## Ambient Audio

The agent can play soft background audio (e.g., restaurant ambience) during calls:

- Set `AMBIENT_AUDIO_URL` in `.env` to a **local file path** (e.g., `bg.mp3`) or an **HTTP/HTTPS URL**
- Published as a LiveKit `LocalAudioTrack` separate from the agent's voice
- Volume reduced to 15% (`volume=0.15`) by default
- Loops indefinitely; handles Docker relative path fallback automatically

---

## Deployment

### Docker (Production)

The `Dockerfile` uses a **two-stage build**:

1. **Builder stage** (`python:3.11-slim`): Installs all Python dependencies
2. **Runtime stage** (`python:3.11-slim`): Copies packages + code, runs `supervisord`

Both `backend/server.py` (FastAPI on port 8000) and `agent.py` (LiveKit Worker on port 8081) are managed by **supervisord**.

```bash
# Build
docker build -t vaani-agent .

# Run
docker run -p 8000:8000 -p 8081:8081 --env-file .env vaani-agent
```

### Frontend (Vercel)

```bash
cd frontend
vercel deploy --prod
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

| Variable | Required | Description |
|----------|----------|-------------|
| `LIVEKIT_URL` | ✅ | LiveKit Cloud WSS URL (e.g., `wss://xxx.livekit.cloud`) |
| `LIVEKIT_API_KEY` | ✅ | LiveKit project API key |
| `LIVEKIT_API_SECRET` | ✅ | LiveKit project API secret |
| `LIVEKIT_SIP_DOMAIN` | ✅ | LiveKit SIP ingress domain (for Exotel bridge) |
| `OPENAI_API_KEY` | ✅ | OpenAI API key (LLM + embeddings) |
| `SARVAM_API_KEY` | ✅ | Sarvam AI API key (STT + TTS) |
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string (SSL required) |
| `JWT_SECRET` | ✅ | Secret for signing session JWTs (use a long random string) |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_KEY` | ✅ | Supabase anon key |
| `AMBIENT_AUDIO_URL` | ⬜ | Path or URL to background audio file (e.g., `bg.mp3`) |
| `LOG_DIR` | ⬜ | Log file directory (default: `logs/`) |
| `LOG_FILE` | ⬜ | Log filename (default: `agent_debug.log`) |

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase project with `pgvector` enabled
- LiveKit Cloud account
- Sarvam AI and OpenAI API keys

### 1. Python Agent & Backend

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env

# Start the FastAPI backend
uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload

# In a separate terminal, start the LiveKit agent worker
python agent.py start
```

### 2. Next.js Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Logs

Agent logs are written to `logs/agent_debug.log` (configurable via `LOG_DIR` and `LOG_FILE`). LiveKit SDK logs are captured in the same file at `INFO` level.

---

## Technology Stack

### AI / Voice

| Component | Technology |
|-----------|-----------|
| Voice Orchestration | LiveKit Agents SDK v1.4.2 |
| Speech-to-Text | Sarvam Saaras v3 (`hi-IN`) |
| Large Language Model | OpenAI GPT-4o-mini |
| Text-to-Speech | Sarvam Bulbul v3 (`simran`) |
| Voice Activity Detection | Silero VAD (local ONNX) |
| Embeddings | OpenAI `text-embedding-3-small` |

### Backend

| Component | Technology |
|-----------|-----------|
| API Framework | FastAPI + Uvicorn |
| Async DB Driver | asyncpg |
| PDF Extraction | pdfplumber |
| PPTX Extraction | python-pptx |
| Audio Processing | PyAV (libav) |
| Environment | python-dotenv |

### Frontend

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| State Management | Redux Toolkit |
| Database Client | pg (PostgreSQL) |
| Auth | Web Crypto API (custom JWT) |
| UI Components | Custom design system (Radix UI primitives) |
| AI SDK | Vercel AI SDK v6 |

### Infrastructure

| Component | Technology |
|-----------|-----------|
| Database | Supabase PostgreSQL (pgvector enabled) |
| Real-time Voice | LiveKit Cloud |
| Telephony | Exotel via SIP |
| Container | Docker (multi-stage, Python 3.11-slim) |
| Process Supervision | supervisord |
| Frontend Hosting | Vercel |

---

*Built by the IMADGEN team. For support or enterprise inquiries, visit [imadgen.com](https://imadgen.com).*
