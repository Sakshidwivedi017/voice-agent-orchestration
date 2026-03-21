# Deploying the Voice Agent to Coolify 🚀

This guide explains how to deploy your AI voice agent (`agent.py`) onto a **Coolify** server. Deploying via Coolify allows the agent to run continuously in the background and scale to handle multiple concurrent calls.

## Prerequisites
1. A running **Coolify** instance (either self-hosted or Cloud).
2. A GitHub/GitLab repository containing this project code.
3. All your API keys ready (LiveKit, Sarvam, Telegram, Cal.com, OpenAI, Vobiz).

---

## Step 1: Push Your Code to Git
Coolify integrates directly with Git providers. 
1. Make sure your local codebase (including the `Dockerfile` provided in this repository) is pushed to your GitHub or GitLab repository.
2. Ensure you **do not commit your `.env` file** to public source control.

---

## Step 2: Create a New Project in Coolify
1. Log in to your Coolify dashboard.
2. Click **Create New Resource**.
3. Select **Public Repository** or **Private Repository** (depending on where your code lives).
4. Connect your GitHub/GitLab account if you haven't already.
5. Select the repository containing your voice agent.
6. Choose the branch to deploy (e.g., `main`).

---

## Step 3: Configure Build Options
1. When prompted for the build pack, select **Docker** (Coolify will automatically detect the `Dockerfile` we included).
2. Set the custom port if asked, though the agent itself connects out via WebSockets (wss://) to LiveKit, so it does not strictly need an inbound exposed port. 
   - *Tip: You do not need to expose a web server port unless you add an Express/FastAPI health-check route later.*

---

## Step 4: Add Environment Variables
Before deploying, you must inject your credentials!
1. Go to the **Environment Variables** tab in your Coolify project settings.
2. Copy every key-value pair from your `.env` file and paste them into Coolify. 
3. Required variables include:
    - `LIVEKIT_URL`
    - `LIVEKIT_API_KEY`
    - `LIVEKIT_API_SECRET`
    - `OPENAI_API_KEY`
    - `SARVAM_API_KEY`
    - `SIP_TRUNK_ID`
    - `CAL_API_KEY`
    - `CAL_EVENT_TYPE_ID`
    - `TELEGRAM_BOT_TOKEN`
    - `TELEGRAM_CHAT_ID`
    - `VOBIZ_SIP_DOMAIN`
    - `VOBIZ_USERNAME`
    - `VOBIZ_PASSWORD`
    - `VOBIZ_OUTBOUND_NUMBER`

---

## Step 5: Deploy
1. Click the **Deploy** button.
2. Coolify will build the Docker container using Python 3.11, install your `requirements.txt`, and start `agent.py`.
3. Watch the deployment logs. When successful, you should see the LiveKit agent registration message: 
   `INFO:livekit.agents:registered worker ...`

---

## How Many Calls Can It Handle Concurrently?

Python handles I/O operations (like waiting for network requests or WebSockets) exceptionally well using `asyncio`, which this LiveKit agent uses under the hood.

- **Soft Limit (Single Container):** A single container with 1 CPU core and 1GB of RAM can easily handle **20 to 50 concurrent active voice calls**. 
- **Why?** The heavy lifting (Speech to Text, LLM thinking, Text to Speech) is all outsourced to Sarvam and OpenAI APIs. Your server is merely a lightweight router passing text strings and audio buffers back and forth. 
- **Hard Limit:** The real bottleneck will be the LiveKit Cloud rate limits or OpenAI/Sarvam API concurrency limits on your specific tier before your actual Coolify server breaks.

---

## Deploying BOTH the Backend and UI on Coolify

To run both `agent.py` and `ui_server.py` at the same time on Coolify, we use a process manager called **Supervisor**. 
*Good news: The `Dockerfile` provided in this repository is already pre-configured to run Supervisor automatically!*

### Step 1: Push Your Code to Git
1. Make sure your local codebase (including `Dockerfile` and `supervisord.conf`) is pushed to your GitHub or GitLab repository.
2. Ensure you **do not commit your `.env` file**.

### Step 2: Create a New Project in Coolify
1. Log in to your Coolify dashboard.
2. Click **Create New Resource** -> **Application** -> **Public or Private Repository**.
3. Select your repository and the deployment branch (e.g., `main`).

### Step 3: Configure Build & Port Options
1. When prompted for the build pack, select **Docker** (Coolify will detect the `Dockerfile`).
2. **CRITICAL STEP:** You must expose the UI Server port so you can access the dashboard.
   - Look for the **Ports Exposes** setting in Coolify.
   - Set it to: `8000:8000` (This maps the container's 8000 port to the public internet).
3. Under the **Domains** section in Coolify, attach your custom domain (e.g., `https://ai-admin.yourdomain.com`). Coolify will automatically map this domain to port 8000.

### Step 4: Add Environment Variables
1. Go to the **Environment Variables** tab.
2. Copy every key-value pair from your `.env` file and paste them into Coolify. 
3. Required variables include: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `OPENAI_API_KEY`, `SARVAM_API_KEY`, `SIP_TRUNK_ID`, `CAL_API_KEY`, `TELEGRAM_BOT_TOKEN`, etc.

### Step 5: Deploy
1. Click the **Deploy** button.
2. Coolify will build the container. When it starts, **Supervisor** will boot up `agent.py` and `ui_server.py` simultaneously.
3. You can watch the deployment logs to see both the LiveKit registration and the Uvicorn web server startup.

Once deployed, you can visit your configured domain to access the Control Panel, while the agent silently hums along in the background answering calls!
