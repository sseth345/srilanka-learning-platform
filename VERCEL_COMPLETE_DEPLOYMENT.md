# 🚀 Complete Vercel Deployment Guide

This guide covers deploying both **Frontend** and **Backend** to Vercel.

---

## 📋 Prerequisites

1. ✅ GitHub account with code pushed
2. ✅ Vercel account (free tier works)
3. ✅ Environment variables ready (Firebase, Cloudinary, etc.)

---

## 🎯 Part 1: Backend Deployment on Vercel

### Step 1: Import Backend Project

1. **Go to Vercel Dashboard**
   - https://vercel.com
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Select your repository
   - Click "Import"

3. **Configure Backend Project**
   - **Root Directory**: `backend` ⚠️ **IMPORTANT!**
   - **Framework Preset**: Other (or leave blank)
   - **Build Command**: `npm run build` (optional, Vercel handles TypeScript)
   - **Output Directory**: Leave blank (not needed for serverless)
   - **Install Command**: `npm install`

4. **Click "Deploy"**

### Step 2: Backend Environment Variables

**Go to**: Project Settings → Environment Variables

Add these variables (for Production, Preview, and Development):

```bash
# Server Configuration
NODE_ENV=production
PORT=3001

# Frontend URL (will be updated after frontend deployment)
FRONTEND_URL=https://your-frontend-app.vercel.app

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`, keep the `\n` characters as they are
- Select **Production**, **Preview**, and **Development** for all variables
- After adding variables, **Redeploy** the project

### Step 3: Backend Deployment Settings

**Go to**: Project Settings → General

- **Node.js Version**: 18.x or 20.x (Vercel auto-detects)
- **Build & Development Settings**: 
  - Root Directory: `backend`
  - Build Command: `npm run build` (optional)
  - Output Directory: (leave blank)

### Step 4: Verify Backend Deployment

1. **Check Deployment Status**
   - Go to "Deployments" tab
   - Wait for build to complete (usually 2-3 minutes)

2. **Test Backend**
   - Visit: `https://your-backend-app.vercel.app`
   - Should see: `{"status":"OK","message":"Sri Lankan Learning Platform API",...}`
   - Visit: `https://your-backend-app.vercel.app/health`
   - Should see: `{"status":"OK","timestamp":"...","service":"Sri Lankan Learning Platform API"}`

3. **Copy Backend URL**
   - Copy the backend URL (e.g., `https://srilanka-backend.vercel.app`)
   - You'll need this for frontend configuration

---

## 🎯 Part 2: Frontend Deployment on Vercel

### Step 1: Import Frontend Project

1. **Go to Vercel Dashboard**
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Select the **same repository** (or create separate repo for frontend)
   - Click "Import"

3. **Configure Frontend Project**
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT!**
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Click "Deploy"**

### Step 2: Frontend Environment Variables

**Go to**: Project Settings → Environment Variables

Add these variables (for Production, Preview, and Development):

```bash
# Backend API URL (use your backend Vercel URL)
VITE_API_URL=https://your-backend-app.vercel.app
VITE_API_BASE_URL=https://your-backend-app.vercel.app/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Important Notes:**
- Replace `your-backend-app.vercel.app` with your actual backend Vercel URL
- Select **Production**, **Preview**, and **Development** for all variables
- After adding variables, **Redeploy** the project

### Step 3: Verify Frontend Deployment

1. **Check Deployment Status**
   - Go to "Deployments" tab
   - Wait for build to complete

2. **Test Frontend**
   - Visit your frontend URL (e.g., `https://srilanka-frontend.vercel.app`)
   - Test login functionality
   - Test API calls
   - Check browser console for errors

---

## 🔄 Part 3: Update Backend CORS

After frontend is deployed, update backend CORS settings:

1. **Go to Backend Project** → Settings → Environment Variables
2. **Update `FRONTEND_URL`**:
   ```
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```
3. **Redeploy Backend**

The backend code already includes Vercel domain patterns in CORS, but updating `FRONTEND_URL` ensures proper configuration.

---

## ✅ Verification Checklist

### Backend:
- [ ] Backend deploys successfully
- [ ] `/health` endpoint returns OK
- [ ] `/` endpoint returns API info
- [ ] Environment variables are set
- [ ] CORS allows frontend domain

### Frontend:
- [ ] Frontend deploys successfully
- [ ] Site loads without errors
- [ ] Login/authentication works
- [ ] API calls to backend work
- [ ] All pages are accessible
- [ ] No console errors

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: Build fails**
- **Solution**: Check build logs, ensure TypeScript compiles
- Verify `backend/vercel.json` exists
- Check `backend/api/index.ts` exists

**Problem: Function timeout**
- **Solution**: Large file uploads may timeout
- Current timeout: 300 seconds (5 minutes)
- Can be increased in `vercel.json` if needed

**Problem: CORS errors**
- **Solution**: Verify `FRONTEND_URL` environment variable
- Check backend CORS configuration in `src/index.ts`
- Ensure frontend URL is in allowed origins

**Problem: Firebase errors**
- **Solution**: Verify all Firebase environment variables
- Check `FIREBASE_PRIVATE_KEY` format (keep `\n` characters)
- Ensure Firebase project is active

### Frontend Issues

**Problem: Build fails**
- **Solution**: Check build logs
- Verify all dependencies are installed
- Check for TypeScript errors

**Problem: API calls fail**
- **Solution**: Verify `VITE_API_URL` environment variable
- Check backend is deployed and accessible
- Check browser console for CORS errors
- Verify backend CORS allows frontend domain

**Problem: 404 on routes**
- **Solution**: Verify `frontend/vercel.json` exists
- Check rewrites configuration
- Ensure SPA routing is configured

**Problem: Firebase not working**
- **Solution**: Verify all Firebase environment variables
- Check Firebase Console → Authorized Domains
- Add Vercel domain to authorized domains

---

## 📝 Important Notes

### 1. Root Directories
- **Backend**: Root Directory = `backend`
- **Frontend**: Root Directory = `frontend`
- ⚠️ **CRITICAL**: Set this correctly or deployment will fail!

### 2. Environment Variables
- Variables starting with `VITE_` are exposed to frontend
- Backend variables should NOT start with `VITE_`
- Always redeploy after adding/updating environment variables

### 3. Firebase Authorized Domains
After deployment, add your Vercel domains to Firebase:
1. Go to Firebase Console → Authentication → Settings
2. Add authorized domains:
   - `your-frontend-app.vercel.app`
   - `your-backend-app.vercel.app` (if needed)

### 4. File Upload Limits
- Vercel serverless functions have limits
- Current max duration: 300 seconds
- For larger uploads, consider using direct Cloudinary upload from frontend

### 5. Cold Starts
- Vercel serverless functions may have cold starts
- First request after inactivity may be slower
- This is normal for serverless functions

---

## 🚀 Quick Deploy Commands (CLI Alternative)

### Backend:
```bash
cd backend
vercel login
vercel
vercel --prod
```

### Frontend:
```bash
cd frontend
vercel login
vercel
vercel --prod
```

---

## 📊 Post-Deployment

### 1. Monitor Performance
- Vercel Dashboard → Analytics
- Check function execution times
- Monitor error rates

### 2. Set Up Custom Domains (Optional)
- Backend: Settings → Domains
- Frontend: Settings → Domains
- Follow DNS instructions

### 3. Update Documentation
- Update API documentation with new URLs
- Update any hardcoded URLs in code
- Update README files

---

## 🎉 Success!

If everything is working:
- ✅ Backend is live on Vercel
- ✅ Frontend is live on Vercel
- ✅ Both are connected and working
- ✅ Authentication works
- ✅ API calls work

**Next Steps:**
1. Test all features thoroughly
2. Set up monitoring/alerts
3. Configure custom domains (if needed)
4. Share URLs with users

---

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console (frontend)
3. Check function logs (backend)
4. Verify environment variables
5. Test endpoints directly

**Good luck! 🚀**

