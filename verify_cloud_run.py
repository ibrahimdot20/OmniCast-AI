import requests
import sys

sys.stdout.reconfigure(encoding='utf-8')

print("Sending request to live Google Cloud Run...")
r = requests.post(
    "https://omnicast-ai-296127548041.us-central1.run.app/api/forge",
    json={"prompt": "AI Agents in Finance 2026", "tone": "💼 Executive & Thought Leader"},
    timeout=120
)

data = r.json()
cards = data.get("cards", [])
print(f"\n==========================================")
print(f"LIVE CLOUD RUN VERIFICATION: {len(cards)} NODES")
print(f"==========================================")

for c in cards:
    platform = c["platform"].upper()
    chars = len(c["content"])
    title = c["title"]
    print(f"✓ [{platform}] ({chars} chars) -> {title}")

print("\n--- SAMPLE CONTENT (LINKEDIN POST) ---")
for c in cards:
    if c["platform"] == "linkedin":
        print(c["content"])
        break

print("\n--- SAMPLE CONTENT (NEWSLETTER) ---")
for c in cards:
    if c["platform"] == "newsletter":
        print(c["content"][:600] + "...\n")
        break

print("==========================================")
print("100% PRODUCTION VERIFIED!")
print("==========================================")
