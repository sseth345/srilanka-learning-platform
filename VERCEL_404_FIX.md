# 🔧 Vercel 404 Fix - Complete Guide

## ✅ Backend Status: LIVE! 
- URL: `https://srilanka-backend.onrender.com`
- Health check working ✅

## ❌ Frontend Issue: 404 Error

### Possible Causes:
1. Vercel pe `VITE_API_URL` set nahi hai
2. Firebase authorized domains mein Vercel URL add nahi hai
3. Backend CORS mein Vercel URL add nahi hai
4. Build issue on Vercel

---

## 🎯 Step 1: Vercel Environment Variables

### Vercel Dashboard:
1. Project select karo
2. **Settings** → **Environment Variables**

### Add/Update These:

```
VITE_API_URL
https://srilanka-backend.onrender.com
```
(Production, Preview, Development - sab select karo)

```
VITE_FIREBASE_API_KEY
your-firebase-api-key
```

```
VITE_FIREBASE_AUTH_DOMAIN
your-project.firebaseapp.com
```

```
VITE_FIREBASE_PROJECT_ID
your-project-id
```

```
VITE_FIREBASE_STORAGE_BUCKET
your-project.firebasestorage.app
```

```
VITE_FIREBASE_MESSAGING_SENDER_ID
your-sender-id
```

```
VITE_FIREBASE_APP_ID
your-app-id
```

### After Adding Variables:
- **Redeploy** karo (Deployments → Latest → Redeploy)

---

## 🎯 Step 2: Firebase Authorized Domains

1. **Firebase Console**
   - https://console.firebase.google.com
   - Project select karo
   - **Authentication** → **Settings** → **Authorized domains**

2. **Add Domains:**
   - `srilanka-learning-platform.vercel.app` (Vercel URL)
   - `srilanka-backend.onrender.com` (Backend URL - optional but good)

3. **Save**

---

## 🎯 Step 3: Backend CORS Update

1. **Render Dashboard**
   - Backend service → **Environment** tab
   - `FRONTEND_URL` check karo

2. **Update if needed:**
   ```
   FRONTEND_URL=https://srilanka-learning-platform.vercel.app
   ```

3. **Redeploy Backend** (if updated)

---

## 🎯 Step 4: Check Vercel Build

1. **Vercel Dashboard**
   - Project → **Deployments** tab
   - Latest deployment check karo

2. **Build Logs Check:**
   - Build successful hai ya nahi?
   - Koi errors hain?

3. **If Build Failed:**
   - Logs check karo
   - Error share karo

---

## 🎯 Step 5: Test

1. **Vercel URL open karo**
   - https://srilanka-learning-platform.vercel.app

2. **Check:**
   - ✅ Page load ho raha hai?
   - ✅ Login page dikh raha hai?
   - ✅ Google login button hai?

---

## 🆘 Troubleshooting

### Problem: Still 404
**Check:**
- Vercel build successful hai?
- `vercel.json` file properly configured hai?
- Root Directory = `frontend` set hai?

### Problem: Blank Page
**Check:**
- Browser console mein errors?
- Network tab mein API calls fail ho rahe?
- `VITE_API_URL` correctly set hai?

### Problem: CORS Error
**Check:**
- Backend `FRONTEND_URL` = Vercel URL?
- Firebase authorized domains updated?

---

## ✅ Quick Checklist

- [ ] Vercel `VITE_API_URL` = `https://srilanka-backend.onrender.com`
- [ ] All Firebase variables set in Vercel
- [ ] Firebase authorized domains = Vercel URL
- [ ] Backend `FRONTEND_URL` = Vercel URL
- [ ] Vercel redeployed after env vars
- [ ] Backend redeployed (if CORS updated)

---

**After these steps, 404 should be fixed! 🚀**

