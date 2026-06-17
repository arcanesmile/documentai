# realAI Deployment Guide

## Deploying Frontend to Vercel

### Prerequisites
- Vercel account
- Git repository with your code

### Steps

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/realai.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" > "Project"
   - Import your GitHub repository
   - Set Framework Preset: `Next.js`
   - Set Root Directory: `frontend`
   - Add environment variables from `.env.local`

3. **Configure Environment Variables**
   In Vercel dashboard:
   - `NEXTAUTH_URL` = `https://your-app.vercel.app`
   - `NEXTAUTH_SECRET` = Generate with: openssl rand -base64 32
   - `GOOGLE_CLIENT_ID` = From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` = From Google Cloud Console
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `BACKEND_URL` = Your Render backend URL
   - `NEXT_PUBLIC_BACKEND_URL` = Your Render backend URL
   - `STRIPE_SECRET_KEY` = From Stripe Dashboard
   - `STRIPE_PUBLISHABLE_KEY` = From Stripe Dashboard
   - `STRIPE_WEBHOOK_SECRET` = From Stripe Dashboard
   - `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` = Your Stripe price ID

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy

5. **Post-Deployment**
   - Update Google OAuth redirect URIs to include your Vercel domain
   - Update Stripe webhook endpoint to point to your Render backend

## Deploying Backend to Render

### Steps

1. **Prepare Backend**
   Ensure your code is in the same GitHub repository

2. **Create Web Service on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" > "Web Service"
   - Connect your GitHub repository
   - Set Name: `realai-backend`
   - Set Root Directory: `backend`
   - Set Runtime: `Python 3`
   - Set Build Command: `pip install -r requirements.txt`
   - Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

3. **Add Environment Variables**
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `DATABASE_NAME` = `realai`
   - `SECRET_KEY` = Generate a strong secret key
   - `ALGORITHM` = `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` = `1440`
   - `STRIPE_SECRET_KEY` = From Stripe Dashboard
   - `STRIPE_WEBHOOK_SECRET` = From Stripe Dashboard
   - `STRIPE_PRO_PRICE_ID` = Your Stripe price ID
   - `GROQ_API_KEY` = From Groq Console
   - `EMBEDDING_MODEL` = `all-MiniLM-L6-v2`
   - `LLM_MODEL` = `llama3-70b-8192`
   - `CORS_ORIGINS` = `https://your-frontend.vercel.app,http://localhost:3000`
   - `UPLOAD_DIR` = `./uploads`
   - `FAISS_INDEX_PATH` = `./faiss_index`

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

5. **Post-Deployment**
   - Update Stripe webhook to point to `https://your-backend.onrender.com/api/stripe/webhook`
   - Update your frontend's `NEXT_PUBLIC_BACKEND_URL` to your Render URL

## Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to "APIs & Services" > "Credentials"
4. Create OAuth 2.0 Client ID
5. Set Application Type: "Web application"
6. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-app.vercel.app/api/auth/callback/google`
7. Copy Client ID and Client Secret to your environment variables

## Setting Up Stripe

1. Create Stripe account at [stripe.com](https://stripe.com)
2. Get API keys from Stripe Dashboard
3. Create a Pro subscription product:
   - Go to Products > Add Product
   - Set price: $19.99/month
   - Copy the Price ID
4. Set up webhook:
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-backend.onrender.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the webhook signing secret

## Setting Up MongoDB Atlas

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create new cluster (free tier works)
3. Set up database access (username/password)
4. Set up network access (allow all IPs for development)
5. Get connection string and add to environment variables

## Setting Up Groq API

1. Sign up at [groq.com](https://groq.com)
2. Get API key from console
3. Add to backend environment variables

## Production Checklist

- [ ] Set up custom domain for frontend
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Implement error tracking (Sentry)
- [ ] Add CDN for static assets
- [ ] Optimize images and assets
- [ ] Set up CI/CD pipeline
- [ ] Run security audit
- [ ] Set up automated testing
- [ ] Configure proper CORS for production
- [ ] Set up environment-specific configurations
- [ ] Implement proper error pages
- [ ] Add analytics (PostHog, Plausible)
- [ ] Set up email service (SendGrid, Resend)
