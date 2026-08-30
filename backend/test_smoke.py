import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.models.schemas import CampaignRequest
from app.agent.tools import generate_ai_image, synthesize_audio_voiceover, generate_20s_video
from app.agent.orchestrator import MasterOrchestrator

async def smoke_test():
    print("1. Testing AI Image Generation Tool (Imagen / HD Studio)...")
    img_16x9 = generate_ai_image("High energy AI studio thumbnail", "Autonomous AI Agents 2026", "Why Multi-Agent Swarms Are Replacing Chatbots", aspect_ratio="16:9")
    img_9x16 = generate_ai_image("Vertical shorts thumbnail", "Autonomous AI Agents 2026", "Why Multi-Agent Swarms Are Replacing Chatbots", aspect_ratio="9:16")
    print(f"   Generated 16:9 image: {img_16x9}")
    print(f"   Generated 9:16 image: {img_9x16}")

    print("\n2. Testing Google TTS Audio Voiceover Tool...")
    voice = synthesize_audio_voiceover("Welcome to OmniCast AI, your autonomous multi-platform content studio.")
    print(f"   Generated Voiceover: {voice['audio_url']} (duration: {voice['duration_seconds']}s)")

    print("\n3. Testing 20-Second Playable MP4 Video Synthesizer...")
    video = generate_20s_video(
        topic="Autonomous AI Agents in 2026",
        core_thesis="Multi-Agent Swarms are replacing chatbots for 10x execution speed",
        bullet_points=["Zero context switching", "Multi-platform broadcasting", "Google Veo & Imagen integration"]
    )
    print(f"   Generated 20s MP4 Video: {video['video_url']} ({video['resolution']})")

    print("\n4. Testing n8n Swarm Orchestrator Pipeline Stream...")
    orchestrator = MasterOrchestrator()
    req = CampaignRequest(
        prompt="Autonomous AI developer agents that fix GitHub bugs and deploy PRs",
        tone="🚀 Viral Growth & High-Energy",
        include_media=True
    )
    
    events_count = 0
    async for event in orchestrator.stream_campaign(req):
        events_count += 1
        if events_count <= 4:
            first_line = event.split('\n')[0]
            print(f"   [Stream Event {events_count}] {first_line}")
            
    print(f"   Total streaming events received: {events_count}")
    print("\n[SUCCESS] All n8n workflow smoke tests passed cleanly!")

if __name__ == "__main__":
    asyncio.run(smoke_test())
