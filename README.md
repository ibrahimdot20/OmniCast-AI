# ⚡ OmniCast AI — Autonomous Multi-Platform Content Studio Agent

> **Autonomous Multi-Agent Content Studio built with Google Antigravity & Gemini 3.7 Flash, deployed on Google Cloud Run.**

---

## 🌟 Executive Summary

Creating high-performing digital content today requires hours of fragmented effort across multiple platforms. Creators and marketing teams must research trending topics, formulate platform-specific strategies, calibrate tone, write custom video scripts, format LinkedIn posts, craft Twitter threads, draft WhatsApp announcements, format newsletters, and design visual carousels.

**OmniCast AI** automates this entire production pipeline. With a **single prompt, target guideline, or URL**, an autonomous multi-agent swarm performs live internet research, constructs a unified campaign narrative, calibrates platform-fitting rules, and progressively generates tailored, publication-ready assets for every major distribution channel.

---

## 🏛️ System Architecture

```mermaid
graph TD
    UserTrigger["User Trigger<br/>(Prompt, Guidelines, or Web URL)"] --> WebStudio["OmniCast AI Web Studio (n8n Visual Canvas)"]
    WebStudio --> API["FastAPI Agent Gateway"]
    API --> MasterOrchestrator["Antigravity Swarm Orchestrator (Gemini 3.7 Flash)"]
    
    subgraph Autonomous Multi-Stage Pipeline
        MasterOrchestrator --> Stage1["1. Autonomous Deep Research Agent<br/>• Live Internet Web Search & Fact Extraction<br/>• Audience Sentiment & Viral Angles<br/>• Outputs Structured Research Dossier"]
        
        Stage1 --> Stage2["2. Strategic Campaign Planner<br/>• Maps thesis to cross-platform angles<br/>• Dynamic tone & voice profiling"]
        
        Stage2 --> Stage3["3. Platform Adaptation Engine<br/>• Native formatting matrix & hook rules<br/>• White-space pacing & character constraints"]
        
        Stage3 --> SequentialPipeline["4. Sequential Distribution Dispatcher"]
        
        SequentialPipeline --> A_LinkedIn["Agent: LinkedIn Thought Leader"]
        SequentialPipeline --> A_Twitter["Agent: X / Twitter Thread Master"]
        SequentialPipeline --> A_WhatsApp["Agent: WhatsApp Broadcast Specialist"]
        SequentialPipeline --> A_Newsletter["Agent: Editorial Newsletter Writer"]
        SequentialPipeline --> A_Facebook["Agent: Facebook Community Engine"]
        SequentialPipeline --> A_Instagram["Agent: Instagram Carousel Visualist"]
    end
    
    A_LinkedIn & A_Twitter & A_WhatsApp & A_Newsletter & A_Facebook & A_Instagram --> EventStream["SSE Live Stream (Sequential Port-Connected Nodes)"]
    EventStream --> WebStudio
    
    subgraph Isolated 1-Click Refinement Loop
        WebStudio -- "1-Click Re-roll Card" --> CardRegenAgent["Dedicated Single-Card Refinement Agent<br/>(Autonomously re-writes card with fresh hooks)"]
        CardRegenAgent --> WebStudio
    end
```

---

## 🎯 Key Capabilities

### 1. 🔍 Autonomous Deep Research & Live Web Intelligence
* Ingests topics or crawls web URLs directly.
* Queries live internet search engines to extract verifiable facts, statistics, audience sentiment, and 3 distinct viral angles.
* Generates a dedicated **Deep Research Dossier** on the visual canvas.

### 2. 🧠 Strategic Campaign Architecture
* Formulates the overarching thesis, target audience demographics, and platform-specific narrative angles.

### 3. 📐 Platform Adaptation & Fitting Engine
* Calibrates the core thesis into native platform mechanics, character limits, hook architecture (e.g. 3 lines before LinkedIn *"…see more"*), mobile scanability, and engagement loops.

### 4. ✍️ Native Channel Distribution
* 💼 **LinkedIn:** Executive takeaways, clean spacing, bulleted structure, 3-5 targeted hashtags.
* 🐦 **X (Twitter):** 280-char strict constraints, curiosity hook, 5-tweet thread.
* 💬 **WhatsApp:** Native WhatsApp Markdown (`*bold*`, `_italics_`, bullet points, emojis).
* 📧 **Email Newsletter:** 3 Subject line variations, preview snippet, structured body with H2 headings, and sign-off.
* 👥 **Facebook:** Community-centric conversational narrative.
* 📸 **Instagram:** Hook opening line, 5-slide carousel outline, 15 hashtags.

### 5. 🎛️ Interactive Canvas & Node Controls
* 📋 **1-Click Copy:** Instant clipboard copy with visual confirmation.
* 💾 **Direct Download:** Download individual posts as `.txt` or `.md`.
* ✏️ **Inline Editing:** Edit text directly in the modal dialog and save.
* 🔄 **1-Click Autonomous Re-Roll:** Spins up an isolated sub-agent to explore alternative high-retention angles.

### 6. 📦 1-Click Production Bundle (ZIP)
* Packages all generated content, scripts, and markdown files into a single downloadable ZIP archive.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
* Python 3.10+
* (Optional) `GEMINI_API_KEY`

### 2. Local Setup
```bash
# Clone repository
git clone https://github.com/ibrahimdot20/OmniCast-AI.git
cd OmniCast-AI

# Install dependencies
pip install -r requirements.txt

# (Optional) Set your API key
export GEMINI_API_KEY="your_api_key_here"

# Start the application
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8080
```

Open your browser at: **`http://localhost:8080`**

---

## ☁️ Production Deployment on Google Cloud Run

OmniCast AI is fully containerized and optimized for Google Cloud Run:

```bash
# Deploy directly from source to Cloud Run
gcloud run deploy omnicast-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL="gemini-3.7-flash" \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300
```

---

## 🛡️ Security & Environment Configuration

* **Zero Secret Exposure:** Real API keys are never tracked or committed to Git (`.gitignore` excludes all `.env` and secret files).
* **Safe Configuration Template:** Use `.env.example` to configure local variables.
* **Non-Root Container:** Production Dockerfile built on lightweight `python:3.12-slim`.

---

## 📄 License
MIT License. Open source and ready for production deployment.
