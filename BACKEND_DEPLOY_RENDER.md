# 🚀 Backend Deploy on Render - Step by Step

## 🎯 Problem: Google Login Not Working

**Reason**: Backend deployed nahi hai, isliye Firebase token verify nahi ho raha.

**Solution**: Backend Render pe deploy karo.

---

## 📋 Step 1: Render Account Setup

1. **Render.com pe jao**
   - https://render.com
   - "Get Started for Free" click karo
   - "Continue with GitHub" select karo
   - GitHub se authorize karo

2. **Email Verify**
   - Email check karo
   - Verification link click karo

---

## 📋 Step 2: Create Web Service

1. **Render Dashboard**
   - "New +" button click karo
   - "Web Service" select karo

2. **Connect Repository**
   - "Connect account" (agar pehle se connect nahi hai)
   - Repository select: `sseth345/srilanka-learning-platform`
   - "Connect" click karo

---

## 📋 Step 3: Configure Service

### Basic Settings:

**Name:**
```
srilanka-backend
```

**Region:**
```
Singapore (or closest to you)
```

**Branch:**
```
main
```

**Root Directory:**
```
backend
```

**Runtime:**
```
Node
```

**Build Command:**
```
cd backend && npm install && npm run build
```

**Start Command:**
```
cd backend && npm start
```

---

## 📋 Step 4: Environment Variables

**IMPORTANT**: Ye sab add karo (Settings → Environment):

### Server Config:
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Firebase Admin SDK:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

### Cloudinary:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_VIDEOS_FOLDER=videos
CLOUDINARY_BOOKS_FOLDER=books
```

**⚠️ NOTE**: 
- `FRONTEND_URL` = Aapka Vercel URL (e.g., `https://srilanka-learning-platform.vercel.app`)
- Private key mein `\n` properly escape karna hai

---

## 📋 Step 5: Deploy

1. **"Create Web Service" click karo**
2. **Build start hoga** (5-10 minutes lag sakta hai)
3. **Wait for "Live" status**

---

## 📋 Step 6: Get Backend URL

1. **Service dashboard pe jao**
2. **URL copy karo** (e.g., `https://srilanka-backend.onrender.com`)
3. **Note karo** - ye URL Vercel pe add karna hai

---

## 📋 Step 7: Update Vercel Environment Variables

1. **Vercel Dashboard**
   - Project select karo
   - Settings → Environment Variables

2. **Update/Add:**
   ```
   VITE_API_URL=https://srilanka-backend.onrender.com
   ```

3. **Redeploy Vercel**
   - Deployments → Latest → Redeploy

---

## 📋 Step 8: Firebase Authorized Domains

1. **Firebase Console**
   - https://console.firebase.google.com
   - Project select karo
   - Authentication → Settings → Authorized domains

2. **Add Domains:**
   - Vercel URL add karo (e.g., `srilanka-learning-platform.vercel.app`)
   - Render URL add karo (e.g., `srilanka-backend.onrender.com`)

---

## ✅ Verification

After all steps:

1. **Vercel site open karo**
2. **Google login try karo**
3. **Should work now!** ✅

---

## 🆘 Troubleshooting

### Problem: Build Fail
**Check:**
- Environment variables properly set hain
- Private key format correct hai
- Build logs check karo

### Problem: Service Crashes
**Check:**
- Port = 10000 (Render default)
- All environment variables set hain
- Logs check karo

### Problem: CORS Error
**Solution:**
- Backend `FRONTEND_URL` = Vercel URL check karo
- Redeploy backend

### Problem: Firebase Error
**Solution:**
- Firebase authorized domains check karo
- Service account credentials verify karo

---

## 🎯 Quick Checklist

- [ ] Render account created
- [ ] Web service created
- [ ] Root Directory = `backend` set
- [ ] All environment variables added
- [ ] Service deployed and "Live"
- [ ] Backend URL copied
- [ ] Vercel `VITE_API_URL` updated
- [ ] Firebase authorized domains updated
- [ ] Vercel redeployed
- [ ] Google login tested

---

**After this, Google login should work! 🎉**

