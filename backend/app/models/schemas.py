from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class CampaignRequest(BaseModel):
    prompt: str = Field(..., description="User prompt, guidelines, or instruction")
    url: Optional[str] = Field(None, description="Optional URL to scrape for context")
    tone: Optional[str] = Field("Auto-Detect", description="Preferred brand tone or style")
    include_media: Optional[bool] = Field(True, description="Whether to generate images, video prompts, and voiceover")

class ResearchDossier(BaseModel):
    topic: str
    summary: str
    core_facts: List[str] = Field(default_factory=list)
    audience_sentiment: str
    viral_angles: List[str] = Field(default_factory=list)
    key_objections: List[str] = Field(default_factory=list)

class StrategicPlan(BaseModel):
    core_thesis: str
    primary_audience: str
    tone_profile: str
    platform_angles: Dict[str, str] = Field(default_factory=dict)
    media_tools_needed: List[str] = Field(default_factory=list)

class VeoScene(BaseModel):
    scene_number: int
    timestamp: str
    visual_cue: str
    spoken_dialogue: str
    veo_prompt: str

class VideoScriptData(BaseModel):
    hook: str
    scenes: List[VeoScene] = Field(default_factory=list)
    cta: str
    word_count: int
    estimated_duration: str

class ImageCardData(BaseModel):
    thumbnail_16x9_url: str
    thumbnail_9x16_url: str
    prompt_used: str

class AudioVoiceoverData(BaseModel):
    audio_url: str
    duration_seconds: float
    transcript: str

class PlatformCard(BaseModel):
    id: str
    platform: str  # research, plan, linkedin, twitter, whatsapp, newsletter, facebook, instagram, video_script, images, voiceover
    title: str
    content: str
    metadata: Optional[Dict[str, Any]] = None

class RegenerateCardRequest(BaseModel):
    campaign_id: str
    platform: str
    current_content: str
    tweak_instruction: Optional[str] = None
    original_prompt: str
    research_summary: Optional[str] = None

class ViralityScorecard(BaseModel):
    overall_score: float = 9.2
    hook_strength: float = 9.5
    retention_estimate: str = "High (>78% 60s completion)"
    clarity_score: float = 9.4
    recommendation: str

class FullCampaignResponse(BaseModel):
    campaign_id: str
    prompt: str
    research: ResearchDossier
    plan: StrategicPlan
    cards: List[PlatformCard]
    virality: Optional[ViralityScorecard] = None
    created_at: str
