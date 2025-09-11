# API Deployment Guide

## Current Deployment URLs

- **API**: `https://wd-ai-tool-api.fly.dev` (based on fly.toml app name)
- **Frontend**: `https://wd-ai-lib.fly.dev` (from .env ALLOWED_ORIGINS)

## Frontend Configuration Required

Your frontend needs to use the production API URL instead of localhost. Update your frontend's API base URL to:

```javascript
// Instead of: http://localhost:8080
// Use: https://wd-ai-tool-api.fly.dev
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://wd-ai-tool-api.fly.dev'
  : 'http://localhost:8080';
```

## CORS Configuration

The API now supports these origins:
- `https://wd-ai-lib.fly.dev` (your frontend)
- `https://wd-ai-tool-api.fly.dev` (API itself)
- `http://localhost:3000` (local development)
- `http://localhost:3001` (local development)

## Environment Variables for Fly.io

Set these environment variables in Fly.io:

```bash
# Set production environment
fly secrets set NODE_ENV=production

# Set CORS origins (if you need to override)
fly secrets set ALLOWED_ORIGINS="https://wd-ai-lib.fly.dev"

# Set your API keys
fly secrets set OPENAI_API_KEY="your_actual_openai_key"
fly secrets set GOOGLE_GENERATIVE_AI_API_KEY="your_actual_google_key"
```

## Debugging

You can check CORS configuration by visiting:
- `https://wd-ai-tool-api.fly.dev/debug/cors`
- `https://wd-ai-tool-api.fly.dev/health`

## Deploy Commands

```bash
# Deploy to Fly.io
fly deploy

# Check logs
fly logs

# Check status
fly status
```