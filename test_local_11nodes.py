import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = "http://127.0.0.1:8080/api/forge-stream"
payload = {
    "prompt": "The 2026 Autonomous AI Agent Revolution: Create 3 images showing agent workflows, and break down why multi-agent orchestration beats single LLMs.",
    "tone": "🚀 Viral Growth & High-Energy",
    "include_media": True
}

print("="*60)
print("TESTING LOCAL 11-NODE PIPELINE (http://127.0.0.1:8080)")
print("="*60)

r = requests.post(url, json=payload, stream=True, timeout=120)
print(f"Connection Status: {r.status_code}\n")

cards = []
current_event = None

for line in r.iter_lines():
    if not line:
        continue
    line_str = line.decode('utf-8')
    if line_str.startswith("event: "):
        current_event = line_str[7:].strip()
        continue
    if line_str.startswith("data: "):
        data_str = line_str[6:].strip()
        if current_event == "status":
            try:
                st = json.loads(data_str)
                print(f"⚡ [STATUS] {st.get('message')}")
            except:
                pass
        elif current_event == "card":
            try:
                card = json.loads(data_str)
                cards.append(card)
                print(f"✓ [{card.get('platform', '').upper()}] ({len(card.get('content', ''))} chars) -> {card.get('title')}")
                if card.get("platform") == "images":
                    meta = card.get("metadata", {})
                    print(f"   🖼️ Images Generated: {meta.get('count', 0)} assets")
                elif card.get("platform") == "video":
                    meta = card.get("metadata", {})
                    print(f"   🎬 Video URL: {meta.get('video_url')} ({meta.get('duration_seconds')}s)")
            except:
                pass
        elif current_event == "complete":
            print("\n✨ [SWARM RUN COMPLETE]")
            break

print("\n" + "="*60)
print(f"TOTAL NODES GENERATED & PASSED: {len(cards)} / 11")
print("="*60)
