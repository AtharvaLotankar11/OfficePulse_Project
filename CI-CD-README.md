# CI/CD Pipeline Documentation

## Overview
This project uses GitHub Actions for Continuous Integration and Continuous Deployment (CI/CD) with Render hosting.

## Pipeline Workflow

### Triggers
- **Push to main branch**: Triggers full CI/CD pipeline
- **Pull Request to main**: Triggers testing only (no deployment)

### Pipeline Stages

#### 1. Testing Phase
- **Backend Tests**: Runs backend linting and tests
- **Frontend Tests**: Runs frontend linting, tests, and build verification
- **Parallel Execution**: Both frontend and backend tests run simultaneously

#### 2. Deployment Phase (main branch only)
- **Backend Deploy**: Automatically deploys to Render backend service
- **Frontend Deploy**: Automatically deploys to Render frontend service
- **Conditional**: Only runs if tests pass and on main branch

#### 3. Notification Phase
- **Success**: Logs deployment URLs
- **Failure**: Reports deployment failures

## Required Secrets

Add these secrets in GitHub repository settings:

```
RENDER_API_KEY - Your Render API key
RENDER_BACKEND_SERVICE_ID - Backend service ID (srv-xxxxxxxxx)
RENDER_FRONTEND_SERVICE_ID - Frontend service ID (srv-xxxxxxxxx)
```

## Getting Service IDs

1. Go to Render dashboard
2. Click on your service
3. Copy the service ID from URL: `https://dashboard.render.com/web/srv-XXXXXXXXX`

## Deployment URLs

- **Frontend**: https://officepulse-frontend.onrender.com
- **Backend**: https://officepulse-backend.onrender.com

## Workflow File Location

`.github/workflows/deploy.yml`

## Manual Deployment

If needed, you can still manually deploy from Render dashboard:
1. Go to service dashboard
2. Click "Manual Deploy"
3. Select "Deploy latest commit"

## Monitoring

- Check GitHub Actions tab for pipeline status
- Monitor Render dashboard for deployment logs
- View live application at deployment URLs

## Troubleshooting

### Common Issues:
1. **Tests failing**: Check linting errors in Actions logs
2. **Build failing**: Verify environment variables
3. **Deployment failing**: Check Render service status and API key validity

### Debug Steps:
1. Check GitHub Actions logs
2. Verify secrets are set correctly
3. Ensure Render services are active
4. Check service IDs match your actual services