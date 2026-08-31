import os
from pathlib import Path
from dotenv import load_dotenv

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent

# Load local environment variables (.env is ignored by Git)
load_dotenv(BASE_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")

STATIC_DIR = BASE_DIR / "static"
AUDIO_DIR = STATIC_DIR / "audio"
IMAGES_DIR = STATIC_DIR / "images"
VIDEO_DIR = STATIC_DIR / "video"

# Ensure directories exist
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
VIDEO_DIR.mkdir(parents=True, exist_ok=True)

# API Keys & Configurations
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
MODEL_NAME = os.getenv("GEMINI_MODEL") or os.getenv("MODEL_NAME") or "gemini-2.5-flash"
PORT = int(os.getenv("PORT", 8080))
HOST = os.getenv("HOST", "0.0.0.0")

# App Info
APP_NAME = "OmniCast AI"
APP_DESCRIPTION = "Autonomous Multi-Platform Studio Agent (n8n Workflow Edition)"
APP_VERSION = "2.0.0"
