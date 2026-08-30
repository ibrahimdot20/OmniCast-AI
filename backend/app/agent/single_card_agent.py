import logging
from typing import Optional
from app.agent.prompts import (
    CARD_REGENERATE_PROMPT,
    LINKEDIN_PROMPT,
    TWITTER_PROMPT,
    WHATSAPP_PROMPT,
    NEWSLETTER_PROMPT,
    FACEBOOK_PROMPT,
    INSTAGRAM_PROMPT,
    VEO_VIDEO_PROMPT
)
from app.models.schemas import PlatformCard, RegenerateCardRequest
from app.services.gemini_service import call_gemini

logger = logging.getLogger("omnicast.single_card_agent")

PLATFORM_PROMPTS = {
    "linkedin": LINKEDIN_PROMPT,
    "twitter": TWITTER_PROMPT,
    "whatsapp": WHATSAPP_PROMPT,
    "newsletter": NEWSLETTER_PROMPT,
    "facebook": FACEBOOK_PROMPT,
    "instagram": INSTAGRAM_PROMPT,
    "video_script": VEO_VIDEO_PROMPT,
}

class SingleCardAgent:
    """
    Dedicated Isolated Single-Card Refinement Agent.
    Supports 1-Click Autonomous Regeneration (zero extra prompt needed),
    exploring alternative high-retention hooks and angles automatically.
    """
    async def execute(self, req: RegenerateCardRequest) -> PlatformCard:
        platform_key = req.platform.lower()
        base_platform_system = PLATFORM_PROMPTS.get(platform_key, "Create high quality platform content.")
        
        # If no user tweak provided, create an autonomous high-variance directive
        tweak = req.tweak_instruction.strip() if req.tweak_instruction else "Autonomously re-roll with a completely fresh, high-impact angle, more provocative hook, and sharper punchlines."
        
        system_instruction = f"{base_platform_system}\n\n{CARD_REGENERATE_PROMPT.format(platform=req.platform, current_content=req.current_content, tweak_instruction=tweak, research_summary=req.research_summary or req.original_prompt)}"
        
        user_prompt = f"""Regenerate this {req.platform} content.
Original User Intent: {req.original_prompt}
Directive: {tweak}
Previous Version (Create a distinct and improved alternative):
{req.current_content}

Return ONLY the new refined content for this platform."""

        new_content = call_gemini(user_prompt, system_instruction=system_instruction, json_mode=False)
        
        titles = {
            "linkedin": "LinkedIn Thought Leadership Post",
            "twitter": "X (Twitter) Viral Thread / Post",
            "whatsapp": "WhatsApp Broadcast & Community Update",
            "newsletter": "Email Newsletter Digest",
            "facebook": "Facebook Community Post",
            "instagram": "Instagram Caption & 5-Slide Carousel Storyboard",
            "video_script": "60s Video Script & Google Veo Scene Prompts",
            "video": "🎬 20-Second Playable MP4 Video Studio",
            "images": "🎨 AI Thumbnail Visuals (Imagen 3)",
            "voiceover": "🎙️ Studio Audio Voiceover (Playable .MP3)"
        }
        
        return PlatformCard(
            id=f"card_{platform_key}",
            platform=platform_key,
            title=titles.get(platform_key, f"{req.platform.capitalize()} Content"),
            content=new_content.strip()
        )
