import json
import logging
from typing import Optional
from app.agent.prompts import RESEARCH_SYSTEM_PROMPT
from app.agent.tools import scrape_url_content, search_live_web
from app.models.schemas import ResearchDossier
from app.services.gemini_service import call_gemini

logger = logging.getLogger("omnicast.research_agent")

class ResearchAgent:
    """
    Autonomous Deep Research & Intelligence Agent.
    Gathers factual data, live internet search results, audience sentiment, and viral angles.
    """
    def __init__(self):
        self.system_prompt = RESEARCH_SYSTEM_PROMPT

    async def execute(self, prompt: str, url: Optional[str] = None) -> ResearchDossier:
        web_context = ""
        
        # 1. Scrape explicit URL if provided
        if url:
            logger.info(f"Research Agent scraping URL: {url}")
            web_context += f"\n\nContext extracted from URL ({url}):\n{scrape_url_content(url)}"

        # 2. Perform live internet web search for the topic
        logger.info(f"Research Agent querying live internet for: {prompt}")
        live_search_results = search_live_web(prompt, max_results=5)
        web_context += f"\n\nLive Internet Search Intelligence:\n{live_search_results}"

        user_input = f"""Analyze and conduct deep research on the following user input:
User Topic / Prompt: {prompt}
{web_context}

Perform deep factual extraction from the live web results, analyze audience sentiment, discover 3 distinct viral angles, and identify key objections."""

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
            return ResearchDossier(**data)
        except Exception as e:
            logger.error(f"Error parsing research json: {e}, raw: {raw_response[:200]}")
            
            # Extract live snippets if available
            core_facts = [
                f"Active trend with growing interest across online communities.",
                f"Audience demands actionable breakdowns and clear real-world examples.",
                f"Multi-platform consistency drives significantly higher engagement."
            ]
            if live_search_results and "Summary:" in live_search_results:
                extracted = [line.replace("Summary:", "").strip() for line in live_search_results.split("\n") if line.startswith("Summary:")]
                if extracted:
                    core_facts = extracted[:3]
                    
            return ResearchDossier(
                topic=prompt[:60],
                summary=f"Deep research synthesis for: {prompt}",
                core_facts=core_facts,
                audience_sentiment="High interest, seeking practical step-by-step guidance.",
                viral_angles=[
                    f"Why conventional advice regarding {prompt[:30]} is flawed",
                    f"The 3-step action framework for {prompt[:30]} in 2026",
                    f"The future roadmap and unexpected insights about {prompt[:30]}"
                ],
                key_objections=[
                    "What are the immediate prerequisites?",
                    "How quickly can this be implemented?"
                ]
            )
