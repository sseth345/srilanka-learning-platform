# 🚀 Vercel Deployment - Step by Step (Fresh Start)

## 📋 Prerequisites Checklist

- [ ] GitHub repository me code push ho chuka hai
- [ ] Vercel account banaya hai (https://vercel.com)
- [ ] Firebase credentials ready hain
- [ ] Cloudinary credentials ready hain

---

## 🎯 PART 1: BACKEND DEPLOYMENT

### Step 1: Vercel me Backend Project Create Karein

1. **Vercel Dashboard** kholo
   - https://vercel.com pe jao
   - Login karo

2. **New Project** click karo
   - "Add New..." button → "Project" select karo

3. **GitHub Repository Import Karein**
   - Apna repository select karo: `sseth345/srilanka-learning-platform`
   - Click "Import"

4. **Project Configuration** (⚠️ IMPORTANT!)
   
   **Project Name:**
   - Kuch bhi naam de sakte ho (e.g., `srilanka-backend`)
   
   **Framework Preset:**
   - "Other" select karo ya blank chhod do
   
   **Root Directory:**
   - ⚠️ **`backend`** type karo (yeh bahut important hai!)
   - Folder path: `backend`
   
   **Build Command:**
   - ⚠️ **KHALI CHHOD DO** (empty rakho)
   - Ya remove karo agar kuch hai to
   
   **Output Directory:**
   - Khali chhod do
   
   **Install Command:**
   - `npm install` (default hai, theek hai)

5. **"Deploy" button click karo**
   - Pehle build fail hoga (normal hai, environment variables add karni hain)

---

### Step 2: Backend Environment Variables Add Karein

**Deployment fail hone ke baad:**

1. **Settings** tab pe jao
   - Project ke settings me jao
   - "Environment Variables" section me jao

2. **Har variable ko separately add karo:**

   **Variable 1:**
   - Key: `NODE_ENV`
   - Value: `production`
   - Environment: ✅ Production, ✅ Preview, ✅ Development (sab select karo)

   **Variable 2:**
   - Key: `PORT`
   - Value: `3001`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 3:**
   - Key: `FRONTEND_URL`
   - Value: `https://your-frontend-app.vercel.app` (abhi temporary, baad me update karenge)
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 4:**
   - Key: `FIREBASE_PROJECT_ID`
   - Value: `srilankan-project` (apna project ID)
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 5:**
   - Key: `FIREBASE_PRIVATE_KEY_ID`
   - Value: Apna private key ID
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 6:**
   - Key: `FIREBASE_PRIVATE_KEY`
   - Value: 
     ```
     -----BEGIN PRIVATE KEY-----
     MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCV3pPu4Tk9gcWe
     ... (apna full private key)
     -----END PRIVATE KEY-----
     ```
   - ⚠️ **IMPORTANT**: `\n` characters ko as-is rakho
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 7:**
   - Key: `FIREBASE_CLIENT_EMAIL`
   - Value: `firebase-adminsdk-fbsvc@srilankan-project.iam.gserviceaccount.com`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 8:**
   - Key: `FIREBASE_CLIENT_ID`
   - Value: `113675232994824571570`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 9:**
   - Key: `CLOUDINARY_CLOUD_NAME`
   - Value: `dz6bfwgry`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 10:**
   - Key: `CLOUDINARY_API_KEY`
   - Value: Apna API key
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 11:**
   - Key: `CLOUDINARY_API_SECRET`
   - Value: `hmnMp4SNpA95M-bO2R9dDkO2d4M`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

3. **Sab variables add karne ke baad:**
   - "Save" karo
   - "Deployments" tab pe jao
   - Latest deployment ke ... menu se "Redeploy" click karo

---

### Step 3: Backend Deployment Verify Karein

1. **Deployment Status Check Karo**
   - "Deployments" tab me jao
   - Build complete hone ka wait karo (2-3 minutes)

2. **Backend URL Copy Karo**
   - Deployment successful hone ke baad
   - URL mil jayega (e.g., `https://srilanka-backend.vercel.app`)
   - **Is URL ko copy karo** - frontend me use karenge

3. **Backend Test Karo**
   - Browser me backend URL kholo
   - Should show: `{"status":"OK","message":"Sri Lankan Learning Platform API",...}`
   - `/health` endpoint test karo: `https://your-backend.vercel.app/health`

---

## 🎯 PART 2: FRONTEND DEPLOYMENT

### Step 1: Vercel me Frontend Project Create Karein

1. **Vercel Dashboard** me jao
   - "Add New..." → "Project" click karo

2. **Same Repository Import Karo**
   - Same repository: `sseth345/srilanka-learning-platform`
   - Click "Import"

3. **Project Configuration** (⚠️ IMPORTANT!)
   
   **Project Name:**
   - Kuch bhi naam (e.g., `srilanka-frontend`)
   
   **Framework Preset:**
   - "Vite" auto-detect hoga (theek hai)
   
   **Root Directory:**
   - ⚠️ **`frontend`** type karo (yeh bahut important hai!)
   - Folder path: `frontend`
   
   **Build Command:**
   - `npm run build` (auto-fill hoga, theek hai)
   
   **Output Directory:**
   - `dist` (auto-fill hoga, theek hai)
   
   **Install Command:**
   - `npm install` (auto-fill hoga, theek hai)

4. **"Deploy" button click karo**

---

### Step 2: Frontend Environment Variables Add Karein

1. **Settings** tab pe jao
   - "Environment Variables" section me jao

2. **Har variable ko separately add karo:**

   **Variable 1:**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-app.vercel.app` (backend ka URL jo copy kiya tha)
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend-app.vercel.app/api`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 3:**
   - Key: `VITE_FIREBASE_API_KEY`
   - Value: `AIzaSyBiSzmpdsaxdWI6v4mdIouQ-AdYOEgxZCo` (apna key)
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 4:**
   - Key: `VITE_FIREBASE_AUTH_DOMAIN`
   - Value: `srilankan-project.firebaseapp.com` (apna domain)
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 5:**
   - Key: `VITE_FIREBASE_PROJECT_ID`
   - Value: `srilankan-project`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 6:**
   - Key: `VITE_FIREBASE_STORAGE_BUCKET`
   - Value: `srilankan-project.firebasestorage.app`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 7:**
   - Key: `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - Value: `967858191613995`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variable 8:**
   - Key: `VITE_FIREBASE_APP_ID`
   - Value: `1:967858191613995:web:...` (apna app ID)
   - Environment: ✅ Production, ✅ Preview, ✅ Development

3. **Sab variables add karne ke baad:**
   - "Save" karo
   - "Deployments" tab pe jao
   - "Redeploy" click karo

---

### Step 3: Frontend Deployment Verify Karein

1. **Deployment Status Check Karo**
   - Build complete hone ka wait karo

2. **Frontend URL Copy Karo**
   - Frontend URL mil jayega (e.g., `https://srilanka-frontend.vercel.app`)

3. **Frontend Test Karo**
   - Browser me frontend URL kholo
   - Site load hona chahiye
   - Login try karo

---

## 🔄 PART 3: FINAL UPDATES

### Step 1: Backend CORS Update Karo

1. **Backend Project** me jao
2. **Settings** → **Environment Variables**
3. **`FRONTEND_URL` update karo:**
   - Value: Apna frontend URL (e.g., `https://srilanka-frontend.vercel.app`)
4. **Save** karo
5. **Redeploy** backend

---

### Step 2: Firebase Authorized Domains

1. **Firebase Console** me jao
   - https://console.firebase.google.com
2. **Authentication** → **Settings** → **Authorized domains**
3. **Add domain** karo:
   - Frontend URL: `your-frontend-app.vercel.app`
   - Backend URL (agar zarurat ho): `your-backend-app.vercel.app`

---

## ✅ Final Verification Checklist

### Backend:
- [ ] Deployment successful
- [ ] `/health` endpoint kaam kar raha hai
- [ ] Environment variables sab set hain
- [ ] CORS properly configured hai

### Frontend:
- [ ] Deployment successful
- [ ] Site load ho raha hai
- [ ] Login/authentication kaam kar raha hai
- [ ] API calls backend se ho rahe hain
- [ ] Koi console errors nahi hain

---

## 🔧 Common Issues & Solutions

### Issue 1: Build Command Error
**Error:** `tsc: command not found`

**Solution:**
- Vercel UI me **Settings** → **General** → **Build & Development Settings**
- **Build Command** ko **KHALI** rakho (remove karo)
- Save karo aur redeploy karo

### Issue 2: CORS Error
**Error:** CORS policy blocked

**Solution:**
- Backend me `FRONTEND_URL` environment variable check karo
- Frontend URL correctly set hai ya nahi verify karo
- Backend redeploy karo

### Issue 3: API Calls Fail
**Error:** Network error ya 404

**Solution:**
- Frontend me `VITE_API_URL` check karo
- Backend URL correct hai ya nahi verify karo
- Backend deployment successful hai ya nahi check karo

### Issue 4: Firebase Auth Not Working
**Error:** Firebase authentication fails

**Solution:**
- Sab Firebase environment variables check karo
- Firebase Console me authorized domains add karo
- Frontend redeploy karo

---

## 📝 Quick Reference

### Backend URLs:
- Health Check: `https://your-backend.vercel.app/health`
- API Base: `https://your-backend.vercel.app/api`

### Frontend URLs:
- Main Site: `https://your-frontend.vercel.app`

### Important Settings:
- **Backend Root Directory:** `backend`
- **Frontend Root Directory:** `frontend`
- **Backend Build Command:** (empty/blank)
- **Frontend Build Command:** `npm run build`

---

## 🎉 Success!

Agar sab kuch theek hai:
- ✅ Backend live hai
- ✅ Frontend live hai
- ✅ Dono connected hain
- ✅ Authentication kaam kar raha hai
- ✅ API calls successful hain

**Congratulations! 🚀**

---

## 📞 Agar Problem Aaye

1. Vercel build logs check karo
2. Browser console check karo (F12)
3. Environment variables verify karo
4. Backend health endpoint test karo
5. Firebase Console check karo

**Good luck! 🍀**

