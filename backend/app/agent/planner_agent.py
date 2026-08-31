import json
import asyncio
import logging
from typing import Optional, Dict, Any, List
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

Return a valid JSON object with the following keys:
- "core_thesis": (string) The central thesis and core value proposition of the campaign
- "primary_audience": (string) Target demographic and user persona
- "tone_profile": (string) Calibrated brand voice and tone profile
- "platform_angles": (object mapping platform names 'linkedin', 'twitter', 'whatsapp', 'newsletter', 'facebook', 'instagram' to specific angle descriptions)
- "media_tools_needed": (array of strings) Required tool descriptors"""

        raw_response = await asyncio.to_thread(call_gemini, user_input, self.system_prompt, True)
        
        return self._parse_planner_response(raw_response, prompt, research, tone)

    def _parse_planner_response(self, raw: str, prompt: str, research: ResearchDossier, tone: Optional[str]) -> StrategicPlan:
        data: Dict[str, Any] = {}
        
        try:
            cleaned = raw.strip()
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0]
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0]
                
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1:
                cleaned = cleaned[start:end+1]
                
            data = json.loads(cleaned)
        except Exception as e:
            logger.warning(f"Planner JSON parse note ({e}), adaptively structuring plan.")

        # Adaptive Field Extraction
        core_thesis = data.get("core_thesis") or data.get("thesis") or data.get("campaign_title") or data.get("summary")
        if not core_thesis or not isinstance(core_thesis, str):
            core_thesis = f"Unlocking the full potential of {research.topic} through actionable insights and strategic multi-platform distribution."

        primary_audience = data.get("primary_audience") or data.get("target_audience") or data.get("audience")
        if not primary_audience or not isinstance(primary_audience, str):
            primary_audience = "Founders, Creators, Operators, and Forward-Thinking Professionals"

        raw_tone = data.get("tone_profile") or data.get("tone") or tone
        if isinstance(raw_tone, dict):
            tone_profile = f"{raw_tone.get('style', 'High-Energy')} • {raw_tone.get('voice_calibration', 'Authoritative & Actionable')}"
        elif isinstance(raw_tone, str) and raw_tone.strip():
            tone_profile = raw_tone.strip()
        else:
            tone_profile = tone if tone and tone != "Auto-Detect" else "Authoritative, Punchy & Action-Oriented"

        platform_angles = data.get("platform_angles") or data.get("platforms")
        if not isinstance(platform_angles, dict):
            platform_angles = {
                "linkedin": f"Executive thought leadership and strategic takeaways on {research.topic}",
                "twitter": f"Viral curiosity hook and 5-tweet thread exploring {research.topic}",
                "whatsapp": f"Direct, urgent community broadcast announcing actionable steps for {research.topic}",
                "newsletter": f"Deep-dive editorial essay with clear frameworks on {research.topic}",
                "facebook": f"Relatable community story and discussion starter on {research.topic}",
                "instagram": f"Visual 5-slide carousel breakdown of key takeaways on {research.topic}"
            }

        media_tools = data.get("media_tools_needed") or data.get("tools")
        if not isinstance(media_tools, list):
            media_tools = [
                "Google Imagen Thumbnails",
                "Google Veo Video Scene Director",
                "Google Cloud TTS Voiceover"
            ]

        return StrategicPlan(
            core_thesis=str(core_thesis).strip(),
            primary_audience=str(primary_audience).strip(),
            tone_profile=str(tone_profile).strip(),
            platform_angles=platform_angles,
            media_tools_needed=[str(t) for t in media_tools]
        )
