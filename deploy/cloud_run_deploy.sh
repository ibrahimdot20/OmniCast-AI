#!/bin/bash
# Google Cloud Run 1-Click Deployment Script

set -e

echo "=========================================================="
echo "  Deploying OmniCast AI to Google Cloud Run"
echo "=========================================================="

REGION="us-central1"
SERVICE_NAME="omnicast-ai"
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo "Error: Google Cloud Project ID is not set. Run 'gcloud config set project YOUR_PROJECT_ID' first."
    exit 1
fi

IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "Project ID: ${PROJECT_ID}"
echo "Service:    ${SERVICE_NAME}"
echo "Region:     ${REGION}"
echo ""

echo "1. Submitting build to Google Cloud Build..."
gcloud builds submit --tag "${IMAGE_NAME}" .

echo "2. Deploying to Google Cloud Run with Gemini 3.7 Flash..."
gcloud run deploy "${SERVICE_NAME}" \
    --image "${IMAGE_NAME}" \
    --platform managed \
    --region "${REGION}" \
    --allow-unauthenticated \
    --set-env-vars GEMINI_MODEL="gemini-3.7-flash" \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 80

echo "=========================================================="
echo "  OmniCast AI Deployed Successfully!"
echo "=========================================================="
