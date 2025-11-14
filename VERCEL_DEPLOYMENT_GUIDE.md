# 🚀 Vercel Deployment Guide - Step by Step

## 📋 Prerequisites

1. ✅ Code GitHub pe push ho chuka hai
2. ✅ Vercel account (free) banaya hai
3. ✅ Environment variables ready hain

---

## 🎯 Step 1: Vercel Account Setup

1. **Go to Vercel**
   - https://vercel.com
   - Click "Sign Up" (GitHub se sign up karein - recommended)

2. **Verify Email**
   - Email verify karein

3. **Connect GitHub**
   - GitHub account connect karein
   - Repository access allow karein

---

## 🎯 Step 2: Import Project

1. **Vercel Dashboard**
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Aapka repository select karein
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite (auto-detect hoga)
   - **Root Directory**: `frontend` (IMPORTANT!)
   - **Build Command**: `npm run build` (auto-fill hoga)
   - **Output Directory**: `dist` (auto-fill hoga)
   - **Install Command**: `npm install` (auto-fill hoga)

4. **Click "Deploy"**

---

## 🎯 Step 3: Environment Variables

**IMPORTANT**: Deploy se pehle environment variables add karein!

### Vercel Dashboard se:

1. **Project Settings**
   - Project select karein
   - "Settings" tab click karein
   - "Environment Variables" section

2. **Add Variables** (Ye sab add karein):

```
VITE_API_URL=https://your-backend-url.onrender.com
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api

VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

3. **Environment Selection**
   - Sab variables ke liye: Production, Preview, Development (sab select karein)

4. **Save**

---

## 🎯 Step 4: Deploy

1. **Redeploy**
   - Environment variables add karne ke baad
   - "Deployments" tab
   - Latest deployment ke ... menu se "Redeploy" click karein

2. **Wait for Build**
   - Build process dekhte rahein
   - Usually 2-3 minutes lagta hai

3. **Success!**
   - "Ready" status dikhega
   - URL mil jayega (e.g., `your-app.vercel.app`)

---

## 🎯 Step 5: Custom Domain (Optional)

1. **Settings → Domains**
   - "Add Domain" click karein
   - Domain name enter karein
   - DNS instructions follow karein

---

## ✅ Verification Checklist

After Deployment:

- [ ] Site load ho raha hai
- [ ] Login working hai
- [ ] API calls working hain (backend URL check karein)
- [ ] Firebase authentication working hai
- [ ] All pages accessible hain

---

## 🔧 Troubleshooting

### Problem: Build Fail
**Solution:**
- Check build logs
- Verify `package.json` scripts
- Check Node.js version (Vercel auto-detects)

### Problem: 404 on Routes
**Solution:**
- `vercel.json` file check karein (already created)
- Rewrites properly configured hain

### Problem: API Not Working
**Solution:**
- `VITE_API_URL` environment variable check karein
- Backend URL correct hai ya nahi
- CORS settings check karein (backend mein)

### Problem: Firebase Not Working
**Solution:**
- All Firebase environment variables check karein
- Firebase Console mein authorized domains add karein (Vercel URL)

---

## 📝 Important Notes

### 1. Root Directory
- **IMPORTANT**: Root Directory = `frontend`
- Vercel ko batana padega ki frontend folder mein code hai

### 2. Environment Variables
- **Production** environment mein add karein
- Preview aur Development mein bhi add kar sakte hain

### 3. Build Settings
- Vercel automatically detect kar leta hai
- But manually verify karein

### 4. Firebase Authorized Domains
- Firebase Console → Authentication → Settings
- Authorized domains mein Vercel URL add karein

---

## 🚀 Quick Deploy Commands (Alternative)

Agar CLI se deploy karna ho:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Production deploy
vercel --prod
```

---

## 📊 Post-Deployment

### 1. Test Everything
- Login/Logout
- File uploads
- Video streaming
- All features

### 2. Monitor
- Vercel Dashboard → Analytics
- Check performance
- Monitor errors

### 3. Update Backend CORS
- Backend mein `FRONTEND_URL` update karein
- Vercel URL add karein

---

## 🎉 Success!

Agar sab kuch theek hai, aapka frontend ab live hai!

**Next Steps:**
1. Backend deploy karein (Render/Railway)
2. Backend URL update karein (Vercel environment variables)
3. Test karein
4. Teacher ko access dein

---

## 📞 Support

Agar koi problem aaye:
1. Vercel build logs check karein
2. Browser console check karein
3. Environment variables verify karein
4. Backend connectivity test karein

**Good luck! 🚀**

