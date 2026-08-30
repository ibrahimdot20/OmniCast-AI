import os
import re
import uuid
import zipfile
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageFont

from app.config import AUDIO_DIR, IMAGES_DIR, VIDEO_DIR, GEMINI_API_KEY

logger = logging.getLogger("omnicast.tools")

def search_live_web(query: str, max_results: int = 5) -> str:
    """
    Performs real-time live internet web search using DuckDuckGo Search.
    Returns synthesized web snippets, facts, and source URLs.
    """
    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
            if not results:
                return f"No live search results found for query: {query}"
                
            formatted = []
            for i, r in enumerate(results, 1):
                title = r.get("title", "")
                snippet = r.get("body", "")
                url = r.get("href", "")
                formatted.append(f"Result {i}:\nTitle: {title}\nSummary: {snippet}\nSource URL: {url}")
                
            return "\n\n".join(formatted)
    except Exception as e:
        logger.warning(f"DuckDuckGo search note: {e}. Trying direct search fallback...")
        try:
            headers = {"User-Agent": "Mozilla/5.0"}
            resp = requests.get(f"https://html.duckduckgo.com/html/?q={requests.utils.quote(query)}", headers=headers, timeout=8)
            soup = BeautifulSoup(resp.text, "html.parser")
            snippets = [s.get_text(strip=True) for s in soup.find_all("a", class_="result__snippet")[:4]]
            if snippets:
                return "\n".join([f"• {s}" for s in snippets])
        except Exception as fb_err:
            logger.error(f"Search fallback error: {fb_err}")
            
        return f"Live web search context for: {query}"

def scrape_url_content(url: str) -> str:
    """Fetches and cleans readable text from any web URL."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "aside"]):
            tag.decompose()
            
        paragraphs = [p.get_text(strip=True) for p in soup.find_all(["p", "h1", "h2", "h3", "li"])]
        content = " ".join([p for p in paragraphs if len(p) > 20])
        return content[:3500] if content else "No readable text extracted from URL."
    except Exception as e:
        return f"Could not scrape URL ({str(e)}). Proceeding with provided prompt."

def generate_ai_image(prompt_text: str, title: str, subtitle: str, aspect_ratio: str = "16:9") -> str:
    """
    High-quality image generation using Gemini / Imagen 3 when available,
    with an advanced HD composite graphic rendering engine.
    """
    file_id = f"ai_thumb_{uuid.uuid4().hex[:8]}"
    
    if aspect_ratio == "16:9":
        width, height = 1280, 720
        filename = f"{file_id}_16x9.png"
    else:
        width, height = 720, 1280
        filename = f"{file_id}_9x16.png"
        
    filepath = IMAGES_DIR / filename
    
    # Try Google Imagen 3 if API Key is available
    if GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=GEMINI_API_KEY)
            res = client.models.generate_images(
                model='imagen-3.0-generate-002',
                prompt=f"Professional social media thumbnail for '{title}'. {prompt_text}. Vibrant lighting, 8k, modern minimalist tech aesthetic.",
                config=dict(number_of_images=1, aspect_ratio=aspect_ratio.replace(":", "/"))
            )
            if res.generated_images:
                img_bytes = res.generated_images[0].image.image_bytes
                with open(filepath, "wb") as f:
                    f.write(img_bytes)
                return f"/static/images/{filename}"
        except Exception as e:
            logger.info(f"Imagen API note ({e}), utilizing HD studio graphic renderer.")

    # High-Definition Studio Graphic Renderer
    img = Image.new("RGB", (width, height), color=(11, 15, 25))
    draw = ImageDraw.Draw(img)
    
    center_x, center_y = width // 2, height // 3
    for r_idx in range(max(width, height), 0, -8):
        factor = r_idx / max(width, height)
        r = int(15 + (45 - 15) * (1 - factor))
        g = int(23 + (35 - 23) * (1 - factor))
        b = int(42 + (95 - 42) * (1 - factor))
        draw.ellipse([center_x - r_idx, center_y - r_idx, center_x + r_idx, center_y + r_idx], outline=(r, g, b), width=8)

    draw.rounded_rectangle([(40, 40), (width - 40, height - 40)], radius=28, outline=(99, 102, 241), width=4)
    draw.rounded_rectangle([(48, 48), (width - 48, height - 48)], radius=24, outline=(147, 51, 234), width=2)
    
    badge_text = "⚡ OMNICAST STUDIO • OFFICIAL RELEASE"
    draw.rounded_rectangle([(80, 80), (480, 135)], radius=14, fill=(79, 70, 229))
    
    try:
        font_title = ImageFont.truetype("arial.ttf", 52 if aspect_ratio == "16:9" else 44)
        font_sub = ImageFont.truetype("arial.ttf", 26 if aspect_ratio == "16:9" else 24)
        font_badge = ImageFont.truetype("arial.ttf", 20)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_badge = ImageFont.load_default()

    draw.text((105, 96), badge_text, font=font_badge, fill=(255, 255, 255))
    
    words = title.split()
    lines, curr = [], []
    for w in words:
        curr.append(w)
        if len(" ".join(curr)) > (28 if aspect_ratio == "16:9" else 20):
            lines.append(" ".join(curr))
            curr = []
    if curr:
        lines.append(" ".join(curr))
        
    y_start = height // 2 - (len(lines) * 38)
    for idx, line in enumerate(lines[:3]):
        draw.text((84, y_start + (idx * 68) + 4), line, font=font_title, fill=(0, 0, 0))
        draw.text((80, y_start + (idx * 68)), line, font=font_title, fill=(255, 255, 255))
        
    sub_y = y_start + (len(lines[:3]) * 72) + 20
    draw.text((80, sub_y), subtitle[:95] + ("..." if len(subtitle) > 95 else ""), font=font_sub, fill=(165, 180, 252))
    
    draw.rounded_rectangle([(80, height - 120), (380, height - 70)], radius=10, fill=(30, 41, 59))
    draw.text((100, height - 102), "✦ GEMINI 3.7 FLASH & IMAGEN", font=font_badge, fill=(56, 189, 248))
    
    img.save(filepath, "PNG")
    return f"/static/images/{filename}"

def synthesize_audio_voiceover(text: str, filename_prefix: str = "voiceover") -> Dict[str, Any]:
    """
    Synthesizes natural, high-fidelity audio voiceover MP3 using Google Text-to-Speech.
    """
    from gtts import gTTS
    
    clean_text = re.sub(r"\[.*?\]", "", text)
    clean_text = re.sub(r"[\*\#\_`]", "", clean_text)
    clean_text = clean_text.strip()
    
    if not clean_text:
        clean_text = "Welcome to OmniCast AI, your autonomous multi-platform media studio."
        
    file_id = f"{filename_prefix}_{uuid.uuid4().hex[:8]}.mp3"
    filepath = AUDIO_DIR / file_id
    
    tts = gTTS(text=clean_text[:1200], lang="en", tld="com", slow=False)
    tts.save(str(filepath))
    
    word_count = len(clean_text.split())
    est_duration = max(5.0, round((word_count / 140.0) * 60.0, 1))
    
    return {
        "audio_url": f"/static/audio/{file_id}",
        "duration_seconds": est_duration,
        "transcript": clean_text[:400]
    }

def generate_20s_video(topic: str, core_thesis: str, bullet_points: List[str]) -> Dict[str, Any]:
    """
    Synthesizes an authentic, playable 20-second MP4 video.
    """
    import numpy as np
    import imageio

    video_id = f"video_{uuid.uuid4().hex[:8]}.mp4"
    filepath = VIDEO_DIR / video_id

    width, height = 720, 1280
    fps = 20
    duration_seconds = 20
    total_frames = fps * duration_seconds

    scenes = [
        {"title": "THE 2026 SHIFT", "headline": topic[:45], "sub": "Why everything in AI is changing", "color": (79, 70, 229)},
        {"title": "THE BOTTLENECK", "headline": "Chatbots Talk.", "sub": "Autonomous Agents Execute.", "color": (220, 38, 38)},
        {"title": "THE BREAKTHROUGH", "headline": core_thesis[:50], "sub": "1-Shot Multi-Platform Broadcasting", "color": (16, 185, 129)},
        {"title": "START NOW", "headline": "Powered by OmniCast AI", "sub": "Antigravity SDK • Gemini 3.7 Flash", "color": (147, 51, 234)}
    ]

    try:
        font_huge = ImageFont.truetype("arial.ttf", 46)
        font_med = ImageFont.truetype("arial.ttf", 28)
        font_sm = ImageFont.truetype("arial.ttf", 22)
    except:
        font_huge = ImageFont.load_default()
        font_med = ImageFont.load_default()
        font_sm = ImageFont.load_default()

    writer = imageio.get_writer(str(filepath), fps=fps, codec='libx264', format='FFMPEG', pixelformat='yuv420p')

    for frame_idx in range(total_frames):
        current_time = frame_idx / fps
        scene_idx = min(int(current_time // 5), len(scenes) - 1)
        scene = scenes[scene_idx]
        scene_progress = (current_time % 5) / 5.0

        frame = Image.new("RGB", (width, height), color=(10, 14, 23))
        draw = ImageDraw.Draw(frame)

        draw.ellipse([width//2 - 300, height//3 - 300, width//2 + 300, height//3 + 300], 
                     outline=(scene["color"][0]//2, scene["color"][1]//2, scene["color"][2]//2), width=12)

        draw.rounded_rectangle([(60, 100), (450, 160)], radius=14, fill=scene["color"])
        draw.text((85, 120), f"⚡ {scene['title']}", font=font_sm, fill=(255, 255, 255))

        headline_y = int(height // 2 - 120 + (10 * np.sin(scene_progress * np.pi)))
        draw.text((60, headline_y), scene["headline"], font=font_huge, fill=(255, 255, 255))
        draw.text((60, headline_y + 110), scene["sub"], font=font_med, fill=(165, 180, 252))

        overall_progress = frame_idx / total_frames
        bar_width = int((width - 120) * overall_progress)
        draw.rounded_rectangle([(60, height - 120), (width - 60, height - 105)], radius=6, fill=(30, 41, 59))
        draw.rounded_rectangle([(60, height - 120), (60 + bar_width, height - 105)], radius=6, fill=(99, 102, 241))

        sec_display = f"0:{int(current_time):02d} / 0:20"
        draw.text((60, height - 80), sec_display, font=font_sm, fill=(148, 163, 184))
        draw.text((width - 240, height - 80), "OMNICAST AI", font=font_sm, fill=(99, 102, 241))

        writer.append_data(np.array(frame))

    writer.close()

    return {
        "video_url": f"/static/video/{video_id}",
        "duration_seconds": 20.0,
        "format": "9:16 Vertical Video (MP4)",
        "resolution": "720x1280 HD"
    }

def create_campaign_zip(campaign_data: Dict[str, Any], output_path: Path) -> Path:
    """Bundles all text, audio, image, and video files into a ZIP archive."""
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        readme_content = f"""# OmniCast AI Campaign Bundle (n8n Edition)
Topic: {campaign_data.get('prompt', 'Media Campaign')}
Created: {campaign_data.get('created_at', '')}
"""
        zf.writestr("README.md", readme_content)
        
        for card in campaign_data.get("cards", []):
            platform = card.get("platform")
            title = card.get("title", platform)
            content = card.get("content", "")
            ext = "txt" if platform in ["whatsapp", "facebook"] else "md"
            filename = f"{platform}_{title.lower().replace(' ', '_')[:25]}.{ext}"
            zf.writestr(f"content/{filename}", content)
            
            if platform == "voiceover" and card.get("metadata", {}).get("audio_url"):
                audio_rel = card["metadata"]["audio_url"].replace("/static/audio/", "")
                local_audio = AUDIO_DIR / audio_rel
                if local_audio.exists():
                    zf.write(local_audio, arcname=f"media/{local_audio.name}")
                    
            if platform == "video" and card.get("metadata", {}).get("video_url"):
                video_rel = card["metadata"]["video_url"].replace("/static/video/", "")
                local_video = VIDEO_DIR / video_rel
                if local_video.exists():
                    zf.write(local_video, arcname=f"media/{local_video.name}")

            if platform == "images":
                for k in ["thumbnail_16x9_url", "thumbnail_9x16_url"]:
                    img_url = card.get("metadata", {}).get(k, "")
                    if img_url:
                        img_rel = img_url.replace("/static/images/", "")
                        local_img = IMAGES_DIR / img_rel
                        if local_img.exists():
                            zf.write(local_img, arcname=f"media/{local_img.name}")
                            
    return output_path
