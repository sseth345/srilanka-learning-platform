# 🚀 Complete Step-by-Step Deployment Guide

## 📋 Overview

1. GitHub pe code push karo
2. Vercel pe deploy karo
3. Environment variables set karo
4. Test karo

---

## 🎯 STEP 1: GitHub Pe Code Push Karna

### Option A: Agar GitHub repo already hai

```bash
# Terminal mein ye commands run karo
cd C:\Users\seths\Downloads\video_add\srilanka

# Check status
git status

# Sab changes add karo
git add .

# Commit karo
git commit -m "Ready for Vercel deployment"

# Push karo
git push origin main
```

### Option B: Agar GitHub repo nahi hai (Naya repo banana)

1. **GitHub.com pe jao**
   - Login karo
   - "New repository" click karo

2. **Repository create karo**
   - Name: `srilanka-learning-platform` (ya kuch bhi)
   - Public ya Private (aapki choice)
   - "Create repository" click karo

3. **Local repository initialize karo**
   ```bash
   # Terminal mein project folder mein jao
   cd C:\Users\seths\Downloads\video_add\srilanka
   
   # Git initialize (agar nahi hai)
   git init
   
   # Remote add karo
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   
   # Sab files add karo
   git add .
   
   # Commit karo
   git commit -m "Initial commit"
   
   # Push karo
   git branch -M main
   git push -u origin main
   ```

**✅ Step 1 Complete!** Code GitHub pe hai.

---

## 🎯 STEP 2: Vercel Account Banana

1. **Vercel.com pe jao**
   - https://vercel.com

2. **Sign Up**
   - "Sign Up" click karo
   - "Continue with GitHub" select karo (recommended)
   - GitHub se authorize karo

3. **Email Verify**
   - Email check karo
   - Verification link click karo

**✅ Step 2 Complete!** Vercel account ready.

---

## 🎯 STEP 3: Vercel Pe Project Import Karna

1. **Vercel Dashboard**
   - Login ke baad dashboard dikhega
   - "Add New..." button click karo
   - "Project" select karo

2. **Repository Select**
   - GitHub repositories list dikhegi
   - Aapka repository select karo
   - "Import" click karo

3. **Project Configure** (IMPORTANT!)

   **Root Directory:**
   - "Root Directory" field mein `frontend` type karo
   - Ya "Edit" button click karke `frontend` select karo

   **Framework Preset:**
   - Auto-detect hoga: "Vite"
   - Agar nahi, manually "Vite" select karo

   **Build Settings:**
   - Build Command: `npm run build` (auto-fill hoga)
   - Output Directory: `dist` (auto-fill hoga)
   - Install Command: `npm install` (auto-fill hoga)

4. **Environment Variables** (Abhi skip karo, baad mein add karenge)
   - "Skip" ya "Add" button (abhi skip karo)

5. **Deploy Click Karo**
   - "Deploy" button click karo
   - Build start hoga (2-3 minutes)

**⚠️ NOTE**: First build fail ho sakta hai (environment variables nahi hain), but chalega.

**✅ Step 3 Complete!** Project import ho gaya.

---

## 🎯 STEP 4: Environment Variables Add Karna

### Pehle Backend Deploy Karna (Render pe)

**Agar backend abhi deploy nahi hai:**

1. **Render.com pe jao**
   - https://render.com
   - Sign up karo (GitHub se)

2. **New Web Service**
   - "New" → "Web Service"
   - Repository select karo

3. **Configure:**
   - Name: `srilanka-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Root Directory: `backend`

4. **Environment Variables Add:**
   ```
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://your-app.vercel.app (Vercel URL baad mein add karna)
   FIREBASE_PROJECT_ID=...
   FIREBASE_PRIVATE_KEY_ID=...
   FIREBASE_PRIVATE_KEY=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_CLIENT_ID=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

5. **Deploy**
   - "Create Web Service" click karo
   - Backend URL note karo (e.g., `https://srilanka-backend.onrender.com`)

**✅ Backend URL mil gaya!**

---

### Ab Vercel Pe Environment Variables Add Karo

1. **Vercel Dashboard**
   - Aapka project select karo
   - "Settings" tab click karo
   - "Environment Variables" section mein jao

2. **Variables Add Karo** (Ye sab):

   ```
   Name: VITE_API_URL
   Value: https://your-backend.onrender.com
   Environment: Production, Preview, Development (sab select karo)
   ```

   ```
   Name: VITE_FIREBASE_API_KEY
   Value: your-firebase-api-key
   Environment: Production, Preview, Development
   ```

   ```
   Name: VITE_FIREBASE_AUTH_DOMAIN
   Value: your-project.firebaseapp.com
   Environment: Production, Preview, Development
   ```

   ```
   Name: VITE_FIREBASE_PROJECT_ID
   Value: your-project-id
   Environment: Production, Preview, Development
   ```

   ```
   Name: VITE_FIREBASE_STORAGE_BUCKET
   Value: your-project.firebasestorage.app
   Environment: Production, Preview, Development
   ```

   ```
   Name: VITE_FIREBASE_MESSAGING_SENDER_ID
   Value: your-sender-id
   Environment: Production, Preview, Development
   ```

   ```
   Name: VITE_FIREBASE_APP_ID
   Value: your-app-id
   Environment: Production, Preview, Development
   ```

3. **Save Karke Redeploy**
   - Sab variables add karne ke baad
   - "Deployments" tab pe jao
   - Latest deployment ke ... menu se "Redeploy" click karo

**✅ Step 4 Complete!** Environment variables set ho gaye.

---

## 🎯 STEP 5: Firebase Authorized Domains

1. **Firebase Console**
   - https://console.firebase.google.com
   - Aapka project select karo

2. **Authentication Settings**
   - "Authentication" → "Settings" tab
   - "Authorized domains" section

3. **Vercel URL Add Karo**
   - "Add domain" click karo
   - Vercel URL enter karo (e.g., `your-app.vercel.app`)
   - "Add" click karo

**✅ Step 5 Complete!** Firebase configured.

---

## 🎯 STEP 6: Backend CORS Update

1. **Backend Environment Variables (Render)**
   - Render dashboard → Your backend service
   - "Environment" tab
   - `FRONTEND_URL` update karo:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     ```

2. **Redeploy Backend**
   - "Manual Deploy" → "Deploy latest commit"

**✅ Step 6 Complete!** CORS updated.

---

## 🎯 STEP 7: Test Karna

1. **Vercel URL Open Karo**
   - Aapka site open karo
   - Check karo ki load ho raha hai

2. **Test Features:**
   - ✅ Login/Logout
   - ✅ Pages load ho rahe hain
   - ✅ API calls working
   - ✅ File uploads (agar backend ready hai)

**✅ Step 7 Complete!** Sab kuch working hai!

---

## 📝 Quick Checklist

**Before Starting:**
- [ ] GitHub account hai
- [ ] Code GitHub pe push ho chuka hai
- [ ] Firebase project ready hai
- [ ] Cloudinary account ready hai
- [ ] Environment variables note kiye hain

**During Deployment:**
- [ ] Vercel account banaya
- [ ] Project import kiya
- [ ] Root Directory = `frontend` set kiya
- [ ] Environment variables add kiye
- [ ] Backend deploy kiya (Render pe)
- [ ] Firebase authorized domains add kiye
- [ ] Backend CORS update kiya

**After Deployment:**
- [ ] Site load ho raha hai
- [ ] Login working hai
- [ ] All features test kiye

---

## 🆘 Troubleshooting

### Problem: Build Fail
**Solution:**
- Build logs check karo
- Environment variables verify karo
- Root Directory = `frontend` check karo

### Problem: 404 on Routes
**Solution:**
- `vercel.json` file check karo (already created)
- Rewrites properly configured hain

### Problem: API Not Working
**Solution:**
- `VITE_API_URL` check karo
- Backend URL correct hai ya nahi
- Backend running hai ya nahi

### Problem: Firebase Error
**Solution:**
- All Firebase variables check karo
- Authorized domains check karo
- Firebase project settings verify karo

---

## 🎉 Success!

Agar sab steps follow kiye, aapka site ab live hai!

**Next:**
- Teacher ko URL share karo
- Regular monitoring karo
- Usage check karte raho

**Good luck! 🚀**

