# Local Start-Up Guide 🚀

This guide explains how to properly start your LiveKit AI Voice Agent and the Developer Control Panel (UI) on your local computer (Mac/PC) for testing and configuration.

## Prerequisites

Before starting, ensure you have completed the following:
1. You have a terminal window open.
2. You are in your project folder (`/Users/shreyasraj/Desktop/inbound AI voice`).
3. You have created your `.env` file (or plan to enter your API keys entirely via the UI).

---

## 🛠️ Step 1: Start the Developer Control Panel (UI Server)

The UI Server allows you to easily configure your agent's prompt, select voices/models, and securely paste your API keys without touching code.

1. **Open a new Terminal window** and navigate to your project folder:
   ```bash
   cd "/Users/shreyasraj/Desktop/inbound AI voice"
   ```

2. **Activate your Python Virtual Environment** (the "sandbox"):
   ```bash
   source ".venv/bin/activate"
   ```
   *(You should see `(.venv)` appear at the beginning of your terminal prompt.)*

3. **Start the FastAPI UI Server**:
   ```bash
   python3 ui_server.py
   ```

4. **Open the Dashboard**:
   Open your web browser (Chrome, Safari, etc.) and go to:
   **[http://localhost:8000](http://localhost:8000)**

   *Note: If you get an `address already in use` error, it means the server is already running in another terminal window or in the background. Just open your browser to the link above!*

---

## ⚙️ Step 2: Configure Your Agent via the UI

Before starting the voice agent, let's make sure it has the keys it needs to run.

1. On the `http://localhost:8000` dashboard, go to the **🔑 API Credentials** tab.
2. Ensure at least the following four essential keys are filled in (if they aren't already in your `.env` file):
   - `LiveKit URL`
   - `LiveKit API Key`
   - `LiveKit API Secret`
   - `OpenAI API Key`
   - `Sarvam API Key`
3. Click **Save Configuration** at the bottom right.

---

## 🎙️ Step 3: Start the Voice Agent (Backend Worker)

Now that the UI is running and your keys are saved, it's time to start the actual AI application that answers calls.

1. **Open a SECOND new Terminal window** (leave the UI server running in the first one).
2. Navigate to your project folder and activate the virtual environment again:
   ```bash
   cd "/Users/shreyasraj/Desktop/inbound AI voice"
   source .venv/bin/activate
   ```

3. **Start the LiveKit Agent**:
   ```bash
   python3 agent.py devSimple fix. Two distinct errors here, both from the same root cause.

***

## Error 1: `TypeError: LLM.__init__() got an unexpected keyword argument 'max_tokens'`

`livekit-agents` v1.4's `openai.LLM()` wrapper **does not accept `max_tokens` directly** in the constructor. That parameter belongs inside an `openai.LLMOptions` or needs to be passed differently. My bad for suggesting it that way — remove it from `openai.LLM()`.

The correct way to cap response length in `livekit-agents` v1.4 is to pass it through `chat_ctx` or simply rely on your system prompt instead. **Remove `max_tokens` from the LLM constructor:**

```python
# ❌ WRONG — causes the crash
llm=openai.LLM(
    model=llm_model,
    max_tokens=80,     # ← DELETE THIS LINE
),

# ✅ CORRECT
llm=openai.LLM(
    model=llm_model,
),
```

To achieve the same token-capping effect without the crash, add this to your **system prompt** instead:

```
CRITICAL: Every reply must be under 20 words. Maximum 1 sentence. Never give lists.
```

That's more reliable anyway since it controls the LLM's intent rather than hard-cutting its output mid-sentence.

***

## Error 2: `AssignmentTimeoutError`

This is a **cascade** from Error 1 — not a separate bug. Here's exactly what happened:

```
1. Job AJ_zSHY39THxV5J received
2. Process spun up (pid: 47757)
3. agent.py crashed instantly on the max_tokens TypeError
4. Process exited before LiveKit Server got assignment confirmation
5. LiveKit Server waited, timed out → AssignmentTimeoutError
6. Same happened for job AJ_uvWAsMwvbRWf (duplicate dispatch)
```

Fix Error 1 and Error 2 disappears completely. The `AssignmentTimeoutError` has no independent fix needed.

***

## Also: Duplicate Job Dispatches

You'll notice the same `job_id` being received **3 times** each:

```
22:57:42.487 — received job request AJ_uvWAsMwvbRWf
22:57:47.420 — received job request AJ_uvWAsMwvbRWf  ← duplicate
22:57:43.444 — received job request AJ_zSHY39THxV5J
22:57:48.438 — received job request AJ_zSHY39THxV5J  ← duplicate
22:57:48.440 — received job request AJ_zSHY39THxV5J  ← duplicate again
```

This happens because the worker crashed and LiveKit retried the dispatch. Once the `max_tokens` crash is fixed and the worker stays alive, the retries stop. No action needed beyond fixing Error 1.

***

## The One-Line Fix

In `agent.py`, find this and delete the `max_tokens` line:

```python
llm=openai.LLM(
    model=llm_model,
    # max_tokens=80,   ← DELETE or comment out
),
```

Save, re-run `python3 agent.py dev`, and both errors are gone.
   ```

4. **Verify it's working**:
   Watch the terminal output. Within a few seconds, you should see a message saying:
   `INFO:livekit.agents:registered worker {"id": "...", "url": "wss://..."}`

   **Congratulations!** Your agent is now online and actively listening for incoming phone calls from Vobiz/LiveKit.

---

## 📞 Step 4: Make a Test Call

To verify everything is flowing correctly locally:

1. **Open a THIRD Terminal window**, navigate, and activate:
   ```bash
   cd "/Users/shreyasraj/Desktop/inbound AI voice"
   source ".venv/bin/activate"
   ```

2. **Run the Make Call script**, replacing the placeholder with your actual phone number:
   ```bash
   python3 make_call.py --to "+91XXXXXXXXXX"
   ```

3. Answer the call on your phone and start talking to your Med Spa Concierge!

---

## 🛑 How to Stop Everything
When you are done testing:
1. Go to the terminal window running `agent.py dev` and press **`CTRL + C`**.
2. Go to the terminal window running `ui_server.py` and press **`CTRL + C`**.
