# Environment Variables Configuration Guide

This document explains all environment variables used in ShopNest and how to configure them for different environments.

## Frontend Environment Variables

### Location
`frontend/.env`

### Variables

| Variable | Description | Local Development | Production Example |
|----------|-------------|-------------------|-------------------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5001` | `https://shopnest-api.onrender.com` |

### Usage in Code
```typescript
import API_URL from './config'

// Use in fetch calls
fetch(`${API_URL}/api/products`)
```

## Backend Environment Variables

### Location
`backend/.env`

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `DB_HOST` | MySQL host | `localhost` or cloud DB host |
| `DB_PORT` | MySQL port | `3306` |
| `DB_NAME` | Database name | `shopnest` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `JWT_secret` | JWT signing secret | `your_random_secret_key` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:5173` (dev)<br>`https://your-app.onrender.com` (prod) |
| `BACKEND_URL` | Backend URL | `http://localhost:5001` (dev)<br>`https://your-api.onrender.com` (prod) |

### Optional Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `EMAIL_USER` | Gmail address | Email verification, password reset |
| `EMAIL_PASS` | Gmail app password | Email verification, password reset |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | SMS verification |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | SMS verification |
| `TWILIO_MESSAGING_SERVICE_SID` | Twilio messaging service | SMS verification |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google login |
| `GOOGLE_SECRET` | Google OAuth secret | Google login |
| `STRIPE_SECRET_KEY` | Stripe secret key | Payment processing |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | Payment processing |
| `FINDWORK_API` | Findwork api key| Job listings |
| `COHERE_API_KEY` | Cohere API key | AI features |
| `CLAUDE_API` | Claude API key | AI features |

## Environment-Specific Configuration

### Local Development

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5001
```

**Backend (.env)**
```env
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shopnest
DB_USER=root
DB_PASSWORD=your_local_password
JWT_secret=dev_secret_key_change_in_production
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5001
```

### Production (Render)

**Frontend Environment Variables (in Render dashboard)**
```env
VITE_API_URL=https://shopnest-backend.onrender.com
```

**Backend Environment Variables (in Render dashboard)**
```env
PORT=5001
DB_HOST=your_production_db_host
DB_PORT=3306
DB_NAME=shopnest_prod
DB_USER=prod_user
DB_PASSWORD=secure_production_password
JWT_secret=secure_random_production_secret
FRONTEND_URL=https://shopnest-frontend.onrender.com
BACKEND_URL=https://shopnest-backend.onrender.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_SECRET=your_google_secret
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
```

## How to Get API Keys

### Gmail App Password
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an app password for "Mail"
4. Use this password in `EMAIL_PASS`

### Twilio
1. Sign up at https://www.twilio.com
2. Get credentials from console dashboard
3. Create a Messaging Service for `TWILIO_MESSAGING_SERVICE_SID`

### Google OAuth
1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5001/api/google-auth/callback` (dev)
   - `https://your-backend.onrender.com/api/google-auth/callback` (prod)

### Stripe
1. Sign up at https://stripe.com
2. Get test keys from dashboard for development
3. Get live keys for production
4. Use test keys (sk_test_...) for development
5. Use live keys (sk_live_...) for production



### Cohere AI
1. Sign up at https://cohere.ai
2. Get API key from dashboard

### Claude AI (Anthropic)
1. Sign up at https://www.anthropic.com
2. Get API key from console

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different secrets** for development and production
3. **Rotate secrets regularly** especially after team member changes
4. **Use strong random strings** for JWT_secret (at least 32 characters)
5. **Limit API key permissions** to only what's needed
6. **Use environment-specific keys** (test keys for dev, live keys for prod)
7. **Store production secrets securely** in Render dashboard or similar

## Troubleshooting

### "Cannot read environment variable"
- Ensure `.env` file exists in correct directory
- Restart development server after adding new variables
- For Vite, variables must start with `VITE_`

### "CORS error"
- Verify `FRONTEND_URL` matches your actual frontend URL
- Check CORS configuration in backend server.js

### "Google OAuth not working"
- Verify redirect URIs in Google Console match `BACKEND_URL`
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_SECRET` are correct
- Check that OAuth consent screen is configured

### "Database connection failed"
- Verify all DB_* variables are correct
- Ensure database exists and is accessible
- Check firewall rules for production databases

## Quick Setup Commands

### Copy example files
```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

### Edit with your values
```bash
# Frontend
nano frontend/.env

# Backend
nano backend/.env
```

## References

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Node.js dotenv](https://github.com/motdotla/dotenv)
