# Deployment Guide - Render

This guide will help you deploy ShopNest to Render with proper environment variable configuration.

## Prerequisites

- GitHub account with your ShopNest repository
- Render account (free tier available at https://render.com)
- MySQL database (can use Render's managed MySQL or external service)

## Backend Deployment

### 1. Create Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `shopnest-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free (or paid for production)

### 2. Configure Backend Environment Variables

In the Render dashboard, go to your backend service → Environment tab and add:

```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
DB_PORT=3306
PORT=5001
JWT_secret=your_secure_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_MESSAGING_SERVICE_SID=your_messaging_sid
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_API_KEY=your_adzuna_key
COHERE_API_KEY=your_cohere_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_SECRET=your_google_secret
CLAUDE_API=your_claude_api_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
FRONTEND_URL=https://your-frontend-name.onrender.com
BACKEND_URL=https://your-backend-name.onrender.com
```

**Important**: 
- Replace `your-frontend-name` and `your-backend-name` with your actual Render service names
- You'll get the actual URLs after creating the services
- Update `FRONTEND_URL` and `BACKEND_URL` after both services are deployed

### 3. Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID
5. Add to "Authorized redirect URIs":
   ```
   https://your-backend-name.onrender.com/api/google-auth/callback
   ```
6. Add to "Authorized JavaScript origins":
   ```
   https://your-frontend-name.onrender.com
   https://your-backend-name.onrender.com
   ```

## Frontend Deployment

### 1. Create Static Site on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `shopnest-frontend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 2. Configure Frontend Environment Variables

In the Render dashboard, go to your frontend service → Environment tab and add:

```
VITE_API_URL=https://your-backend-name.onrender.com
```

**Important**: Replace `your-backend-name` with your actual backend service name from step 1.

## Post-Deployment Steps

### 1. Update Backend Environment Variables

After both services are deployed, update your backend environment variables with the actual URLs:

```
FRONTEND_URL=https://your-actual-frontend-url.onrender.com
BACKEND_URL=https://your-actual-backend-url.onrender.com
```

### 2. Verify Deployment

1. Visit your frontend URL
2. Test user registration and login
3. Test Google OAuth login
4. Verify API calls are working

## Database Setup

### Option 1: Render Managed MySQL (Recommended)

1. In Render dashboard, click "New +" → "MySQL"
2. Configure and create the database
3. Copy the connection details to your backend environment variables

### Option 2: External MySQL Database

Use services like:
- PlanetScale (free tier available)
- AWS RDS
- DigitalOcean Managed Databases

Copy the connection details to your backend environment variables.

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure your backend has proper CORS configuration:

```javascript
// In server.js
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Environment Variables Not Loading

1. Verify all environment variables are set in Render dashboard
2. Redeploy the service after adding/updating variables
3. Check the deployment logs for any errors

### Google OAuth Not Working

1. Verify redirect URIs are correctly configured in Google Cloud Console
2. Ensure `FRONTEND_URL` and `BACKEND_URL` match your actual deployed URLs
3. Check that `GOOGLE_CLIENT_ID` and `GOOGLE_SECRET` are correct

## Local Development vs Production

### Local Development
```
VITE_API_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5001
```

### Production
```
VITE_API_URL=https://your-backend-name.onrender.com
FRONTEND_URL=https://your-frontend-name.onrender.com
BACKEND_URL=https://your-backend-name.onrender.com
```

## Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use strong secrets** - Generate secure random strings for JWT_secret
3. **Rotate credentials** - Regularly update API keys and secrets
4. **Use HTTPS only** - Render provides free SSL certificates
5. **Limit CORS origins** - Only allow your frontend domain

## Cost Optimization

### Free Tier Limitations
- Render free tier services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to paid tier for production use

### Recommendations
- Use paid tier for backend ($7/month) for always-on service
- Frontend can stay on free tier (static sites don't spin down)
- Use managed database for better performance

## Support

For issues or questions:
- Check Render documentation: https://render.com/docs
- Review deployment logs in Render dashboard
- Verify all environment variables are correctly set

---

**Note**: After deployment, update the README.md with your actual deployed URLs for reference.
