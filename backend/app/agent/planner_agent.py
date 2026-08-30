import json
import logging
from typing import Optional
from app.agent.prompts import PLANNER_SYSTEM_PROMPT
from app.models.schemas import ResearchDossier, StrategicPlan
from app.services.gemini_service import call_gemini

logger = logging.getLogger("omnicast.planner_agent")

class PlannerAgent:
    """
    Strategic Campaign Architecture Agent.
    Formulates narrative thesis, platform angle assignments, and tool needs.
    """
    def __init__(self):
        self.system_prompt = PLANNER_SYSTEM_PROMPT

    async def execute(self, prompt: str, research: ResearchDossier, tone: Optional[str] = "Auto-Detect") -> StrategicPlan:
        user_input = f"""Original User Request: {prompt}
User Tone Preference: {tone}

Research Dossier:
- Topic: {research.topic}
- Summary: {research.summary}
- Core Facts: {', '.join(research.core_facts)}
- Audience Sentiment: {research.audience_sentiment}
- Viral Angles: {', '.join(research.viral_angles)}
- Key Objections: {', '.join(research.key_objections)}

Develop the cohesive Strategic Campaign Plan."""

        raw_response = call_gemini(user_input, system_instruction=self.system_prompt, json_mode=True)
        
        try:
            cleaned = raw_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            data = json.loads(cleaned.strip())
            return StrategicPlan(**data)
        except Exception as e:
            logger.error(f"Error parsing planner json: {e}, raw: {raw_response[:200]}")
            return StrategicPlan(
                core_thesis=f"Mastering {research.topic} requires breaking conventional norms and deploying actionable frameworks.",
                primary_audience="Professionals, Creators, and Innovators",
                tone_profile=tone if tone != "Auto-Detect" else "Authoritative & Action-Oriented",
                platform_angles={
                    "linkedin": "Strategic and leadership perspective",
                    "twitter": "Fast-paced punchy thread with contrarian hook",
                    "whatsapp": "Urgent, direct value broadcast with bullet points",
                    "newsletter": "Deep-dive editorial essay with case studies",
                    "facebook": "Relatable community story with discussion prompt",
                    "instagram": "Visual 5-slide carousel breakdown"
                },
                media_tools_needed=[
                    "Google Imagen Thumbnails",
                    "Google Veo Video Scene Director",
                    "Google Cloud TTS Voiceover"
                ]
            )
