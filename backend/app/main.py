import os
import uuid
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import (
    APP_NAME,
    APP_VERSION,
    APP_DESCRIPTION,
    STATIC_DIR,
    AUDIO_DIR,
    IMAGES_DIR,
    VIDEO_DIR,
    BASE_DIR
)
from app.models.schemas import CampaignRequest, RegenerateCardRequest, PlatformCard
from app.agent.orchestrator import MasterOrchestrator
from app.agent.single_card_agent import SingleCardAgent
from app.agent.tools import create_campaign_zip
from app.sample_campaigns import SAMPLE_CAMPAIGNS

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=APP_DESCRIPTION
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static asset directories
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

orchestrator = MasterOrchestrator()
single_card_agent = SingleCardAgent()

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "app": APP_NAME,
        "version": APP_VERSION,
        "static_audio_ready": AUDIO_DIR.exists(),
        "static_images_ready": IMAGES_DIR.exists(),
        "static_video_ready": VIDEO_DIR.exists(),
        "engine": "Antigravity Swarm (n8n Workflow Edition)"
    }

@app.get("/api/samples")
async def get_sample_presets():
    return {"samples": SAMPLE_CAMPAIGNS}

@app.post("/api/forge-stream")
async def forge_campaign_stream(request: CampaignRequest):
    """
    Server-Sent Events (SSE) streaming endpoint.
    Sequentially yields n8n workflow nodes one by one.
    """
    return StreamingResponse(
        orchestrator.stream_campaign(request),
        media_type="text/event-stream"
    )

@app.post("/api/forge")
async def forge_campaign_direct(request: CampaignRequest):
    """
    Direct synchronous endpoint collecting all cards into a single response.
    """
    cards = []
    campaign_id = f"cmp_{uuid.uuid4().hex[:10]}"
    async for event in orchestrator.stream_campaign(request):
        if "event: card" in event:
            for line in event.split("\n"):
                if line.startswith("data: "):
                    import json
                    card_data = json.loads(line.replace("data: ", "").strip())
                    cards.append(card_data)
    return {
        "campaign_id": campaign_id,
        "prompt": request.prompt,
        "cards": cards,
        "status": "completed"
    }

@app.post("/api/regenerate-card", response_model=PlatformCard)
async def regenerate_single_card(req: RegenerateCardRequest):
    try:
        updated_card = await single_card_agent.execute(req)
        return updated_card
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Card regeneration failed: {str(e)}")

@app.post("/api/export-bundle")
async def export_campaign_bundle(campaign_data: Dict[str, Any] = Body(...)):
    try:
        bundle_id = f"omnicast_bundle_{uuid.uuid4().hex[:8]}.zip"
        zip_path = STATIC_DIR / bundle_id
        create_campaign_zip(campaign_data, zip_path)
        return {
            "success": True,
            "download_url": f"/static/{bundle_id}",
            "filename": bundle_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create ZIP bundle: {str(e)}")

# Mount frontend directory
frontend_dir = BASE_DIR.parent / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    from app.config import HOST, PORT
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
