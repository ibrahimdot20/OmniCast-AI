@echo off
REM Google Cloud Run 1-Click Deployment Batch Script for Windows

echo ==========================================================
echo   Deploying OmniCast AI to Google Cloud Run (Windows)
echo ==========================================================

set REGION=us-central1
set SERVICE_NAME=omnicast-ai

for /f "tokens=*" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i

if "%PROJECT_ID%"=="" (
    echo Error: Google Cloud Project ID is not set. Run 'gcloud config set project YOUR_PROJECT_ID' first.
    pause
    exit /b 1
)

set IMAGE_NAME=gcr.io/%PROJECT_ID%/%SERVICE_NAME%:latest

echo Project ID: %PROJECT_ID%
echo Service:    %SERVICE_NAME%
echo Region:     %REGION%
echo.

echo 1. Submitting build to Google Cloud Build...
call gcloud builds submit --tag %IMAGE_NAME% .
if %ERRORLEVEL% NEQ 0 (
    echo Build failed.
    pause
    exit /b %ERRORLEVEL%
)

echo 2. Deploying to Google Cloud Run with Gemini 3.7 Flash...
call gcloud run deploy %SERVICE_NAME% --image %IMAGE_NAME% --platform managed --region %REGION% --allow-unauthenticated --set-env-vars GEMINI_MODEL=gemini-3.7-flash --memory 1Gi --cpu 1 --timeout 300 --concurrency 80

if %ERRORLEVEL% NEQ 0 (
    echo Deployment failed.
    pause
    exit /b %ERRORLEVEL%
)

echo ==========================================================
echo   OmniCast AI Deployed Successfully!
echo ==========================================================
pause
