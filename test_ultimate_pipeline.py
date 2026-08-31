import asyncio
import os
import sys

# Force UTF-8 stdout for Windows consoles
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath("backend"))

from app.agent.orchestrator import MasterOrchestrator
from app.models.schemas import CampaignRequest

async def main():
    print("==================================================")
    print("TESTING ULTIMATE OMNICAST MULTI-AGENT SWARM")
    print("==================================================")
    
    orchestrator = MasterOrchestrator()
    req = CampaignRequest(
        prompt="India vs Pakistan Cricket World Cup 2026 Strategy",
        tone="🚀 Viral Growth & High-Energy",
        include_media=False
    )
    
    cards_generated = {}
    async for event in orchestrator.stream_campaign(req):
        if "event: status" in event:
            lines = event.strip().split("\n")
            for l in lines:
                if "data:" in l:
                    print("STATUS:", l)
        elif "event: card" in event:
            import json
            for l in event.strip().split("\n"):
                if l.startswith("data:"):
                    card_data = json.loads(l[5:].strip())
                    cards_generated[card_data["platform"]] = card_data
                    print(f"\n[RECEIVED CARD] -> {card_data['platform'].upper()}: {card_data['title']}")
                    print(f"Content Length: {len(card_data['content'])} characters")
                    print("Content Preview:\n" + card_data['content'][:300] + "\n---")
        elif "event: complete" in event:
            print("\n[PIPELINE COMPLETE SUCCESS]")

    print(f"\nTotal Nodes Generated: {len(cards_generated)} / 9")
    for k, v in cards_generated.items():
        print(f"  ✓ {k.upper()}: {len(v['content'])} chars")
    assert len(cards_generated) >= 9, f"Expected 9 cards, got {len(cards_generated)}"
    print("\nALL 9 NODES VERIFIED AND PASSED!")

if __name__ == "__main__":
    asyncio.run(main())
