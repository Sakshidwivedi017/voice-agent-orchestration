# 🎙️ LiveKit AI Voice Agent — Codebase Analysis

This document provides a comprehensive overview of the current codebase, its architecture, the purpose of each file, and an analysis of our current objectives and recent debugging efforts.

---

## 🏗️ Core Architecture & Purpose

This project implements a real-time, conversational AI voice assistant. It bridges traditional telephony (phone calls) with cutting-edge AI models using **LiveKit** as the real-time audio transport layer and **Vobiz** as the SIP trunk provider. 

The system is designed to handle both **outbound** (system calls the user) and **inbound** (user calls the system) workflows.

### The AI Pipeline
The agent operates on a continuous loop of three core components:
1. **STT (Speech-to-Text)**: Listens to the human caller and transcribes audio to text (using Deepgram or Sarvam).
2. **LLM (Large Language Model)**: Understands the transcribed text, maintains conversation context, and generates a text response (using OpenAI GPT-4o-mini / GPT-4o).
3. **TTS (Text-to-Speech)**: Converts the LLM's text response back into natural-sounding audio (using OpenAI, Cartesia, or Sarvam) and streams it back to the caller.

---

## 📂 File Breakdown & Responsibilities

### Core Executables
*   **`agent.py`**: **The Brain.** This is the main LiveKit worker. It runs continuously in the background listening for "job requests" (either an incoming call or a dispatch command to make an outbound call). 
    *   It configures the STT, LLM, and TTS models.
    *   It contains the `OutboundAssistant` defining the AI's prompt and behavior.
    *   It contains tools (like `TransferFunctions`) that the AI can trigger mid-conversation to transfer calls to human agents.
*   **`make_call.py`**: **The Trigger.** A utility script used to initiate outbound calls. It takes a phone number as an argument (`--to +91...`), generates a unique LiveKit room, and sends an `AgentDispatchRequest` to LiveKit, injecting the target phone number into the job's `metadata`.
*   **`setup_trunk.py`**: **The Bridge Builder.** A setup script used to programmatically configure your LiveKit project to securely connect to your Vobiz SIP Trunk using the credentials stored in your `.env` file.

### Documentation & Protocols
*   **`README.md`**: The standard setup guide, detailing prerequisites, environment variable configuration, and basic usage commands.
*   **`SOP.md` (Standard Operating Protocol)**: A highly detailed, mandate-driven instruction manual for AI Agents (like myself). It mandates how we should architect solutions, use multiple "software skills" in tandem, review code, and structure debugging sessions to ensure high quality and security.
*   **`saravm.md`**: Excellent specialized documentation for swapping out the default OpenAI/Deepgram pipeline for **Sarvam AI**, which provides highly optimized Speech-to-Text and Text-to-Speech models specifically tuned for Indian languages, accents, and code-mixed speech (e.g., Hinglish). It also details inbound SIP routing via Vobiz.
*   **`mpconfig.md`**: Architectural documentation detailing a recent structural change to the booking flow. It explains moving the calendar booking logic from an active "during-call" tool (which causes awkward pauses) to a "post-call" shutdown hook that executes silently after the user hangs up.

### Environment & Setup
*   **`.env`**: Contains all vital, secret API keys (LiveKit, OpenAI, Deepgram, Vobiz, etc.).
*   **`requirements.txt`**: Pins the exact Python package versions required to run the project stably, most notably `livekit-agents` and its associated plugins.

---

## 🔍 What We Are Currently Doing

### 1. Phase One: The `AttributeError` Crash (Resolved)
Earlier, your agent was crashing immediately on startup with `AttributeError: 'TransferFunctions' object has no attribute 'all_tools'`. 
*   **The Cause:** The newest versions of the `livekit-agents` SDK changed how tools are registered. The `AgentSession` class no longer accepts a `tools` argument, and `ToolContext` no longer uses `.all_tools`.
*   **The Fix:** We updated `agent.py` to use `llm.find_function_tools()` to extract the tools from your class, and we moved the registration of those tools directly into the `OutboundAssistant` (the `Agent` class) rather than the `AgentSession`. The agent now successfully starts and registers with LiveKit.

### 2. Phase Two: The Call Dispatch Failure (Current Investigation)
Currently, you are experiencing an issue where running `python3 make_call.py --to [NUMBER]` does not result in your phone ringing.
*   **The Symptoms:**
    1.  `make_call.py` successfully dispatches the job.
    2.  `agent.py` receives the job and connects to the room.
    3.  However, the agent logs output: *"No valid JSON metadata found. This might be an inbound call."*
    4.  Because it thinks it's an inbound call, it skips the crucial block of code (`api.sip.create_sip_participant(...)`) that actually dials out to your phone via the Vobiz trunk.
*   **Our Next Steps:** 
    *   We added debug logging to `agent.py` to print *exactly* what raw metadata it receives from LiveKit.
    *   Once you trigger a test call, those logs will reveal if the metadata string is empty, malformed, or if LiveKit has changed the property name (e.g., from `ctx.job.metadata` to something else). 
    *   Once we identify the malformed data, we can fix the parsing logic in `agent.py` so it properly extracts the number and dials out.
