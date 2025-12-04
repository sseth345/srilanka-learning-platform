# 🚀 Vercel Backend Deployment - Step by Step

## ✅ Steps Summary

1. **Vercel me naya project banao**
2. **Root Directory**: `backend` select karo
3. **Build Command**: **KHALI** rakho (remove karo)
4. **Environment Variables** add karo (niche list hai)
5. **Deploy** karo

---

## 📋 Step 1: Vercel Project Create Karo

1. **Vercel Dashboard** me jao
   - https://vercel.com
   - Login karo

2. **"Add New..."** → **"Project"** click karo

3. **GitHub Repository Import Karo**
   - Repository: `sseth345/srilanka-learning-platform`
   - Click **"Import"**

4. **Project Configuration:**
   
   **Project Name:**
   - Kuch bhi naam (e.g., `srilanka-backend`)
   
   **Framework Preset:**
   - **"Other"** select karo ya blank chhod do
   
   **Root Directory:**
   - ⚠️ **`backend`** type karo (yeh bahut important hai!)
   
   **Build Command:**
   - ⚠️ **KHALI CHHOD DO** (empty rakho)
   - Agar kuch auto-fill hua to **DELETE** karo
   
   **Output Directory:**
   - Khali chhod do
   
   **Install Command:**
   - `npm install` (default hai, theek hai)

5. **"Deploy"** button click karo
   - Pehle build fail hoga (normal hai, environment variables add karni hain)

---

## 📋 Step 2: Environment Variables Add Karo

**Deployment fail hone ke baad:**

1. **Settings** tab pe jao
   - Project ke settings me jao
   - **"Environment Variables"** section me jao

2. **Har variable ko separately add karo:**

### Variable 1: NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development (sab select karo)

### Variable 2: PORT (Optional but recommended)
- **Key:** `PORT`
- **Value:** `3001`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

### Variable 3: FRONTEND_URL
- **Key:** `FRONTEND_URL`
- **Value:** `https://srilanka-learning-platform.vercel.app`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

### Variable 4: FIREBASE_PROJECT_ID
- **Key:** `FIREBASE_PROJECT_ID`
- **Value:** `srilankan-project`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

### Variable 5: FIREBASE_PRIVATE_KEY_ID
- **Key:** `FIREBASE_PRIVATE_KEY_ID`
- **Value:** `ead838fcfcc9f7ef6f029a30fb6b985563c73cfb`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

### Variable 6: FIREBASE_PRIVATE_KEY ⚠️ IMPORTANT!
- **Key:** `FIREBASE_PRIVATE_KEY`
- **Value:** (Yeh multiline hai, carefully copy karo)
  ```
  -----BEGIN PRIVATE KEY-----
  MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCV3pPu4Tk9gcWe
  ITdebvQtrbHqooXKpz2aUc1Xe+uforNSfQhmLVliLszkNcLNp398shovsyEQox30
  JGteHGWA2aLy7+wyfs9uqRDlAOjWR5x6+crI67cg0eBPR7FtvqI2OheU0ACP4TVo
  jptt2+vj3Jg7Av7+zyKg1uXXji7aSK2IuN9jRStE8ozPYL41SOMuisDgq1w/n1TA
  TUfxAAXrDl+Fx9wyin/Cr9RoYCHFSgkcRPBJaBUo6naMMoqbW5d8T/msGa0zJBmP
  khVYDx4uBH3l1yo1csePe6XEhZr7GasTABlC50BaJZCZAGj2hozBq8GF76FKNmvG
  e/Q/y199AgMBAAECggEAAVzDW//MoShBl2Ema3OXQSYL0L32+ONhzjoRo4qzFuGn
  /yc3URR29EtIHgf2FCACauwEjGv0sD3HWy2Mk0+vRYdU8Z/oNgJMmO0tA+Po+e+v
  Nrf4FbD82m3F+/qDHKQHvfXzumzUoHoz3dY0CADgiVL7SEgL8N2Jq0wgzT+T4fSV
  HJ7miJeWdKrYbkyRHWQnLGgWerdygw4Bgo3sKxj9LiUQz9lfUKAIwXohsKGCXhuq
  aoJfMGr9Re8HMBVdUfVQ/e4Hl4s04Y6KaXg76KaHkh9CPtQa6qyFgzqrICs/sAoA
  2+IX7HpUDVHD1DfjrbVU5do0Cf8kvCQg2odJ3a9SgQKBgQDNLLo3+cVBroEk0h0p
  8VGpi0ZT4qtOB5Ds3BxDiUgZlTrM6E7bCQ3nvmx+wluampR8zgEYZS4yV7tKlDHJ
  4kXQY4dR4dMIVXxfmNtosiiKGFOmLEVXCf5TGacXYSBVrMte+BbOasJun1p/tMaT
  k20le10cmsYnAlgZBUJUDr1O/QKBgQC6/qKFrtiFCIJWaqBTgTEZ0EZNEBReW+3v
  VOl7bSEwtYvUZb76EqtgQcKQg3KkVjP64YgwgJBj+moY5/lGOWcDsAhZxCG4oHR/
  MkXtef1CDWJ6ObADm2vH0uRpEsV65V/aENVkz6f5vJc43Jy2FWy4u66frRkMlQ9r
  gNCbXmp6gQKBgQCKbcgCZkGhbBRz/FNy7f9T7cT4afF8RvyP4n4rTt9Xa2jtwTsa
  60P3fHIFICrf57WRcwgoJnQBwVF7Ivtoo4LI863kIAHbGJo+gYpfW/ygF4OwlSP/
  cp2mAaPL0VsYkunv3GC+yib+rgNIMHbeMNSuOkp7Ny3EOf+oefTjc8JkHQKBgQCk
  BG1xbKemKIyKWARAunTi+3huZ8g169SLtKMHC/Wsz9DSgFw+5NlFGOkb8PBBjQsS
  53eZc2szBpbBOde/7OGarnDkq9AYLUWBvArx/apSoYLbSnZE87JaF3UZZMmqvj6Q
  +2rxfeMMfor16Svb2nb+okDM9fueubBIzzgqz2n+AQKBgQCiCvYz7T3w8ZV518j5
  zBwxBvNw985fj6Gw9K6gRDN5wEL6DKzq0v9HZzrdkdZFFgznlJh8Zz8+GPToTIUU
  1KFeZR2O4yg1W/vjda1pmU2jEO3ovwY3J4P0h6/BdQinsAI/scv1XKkhCGyyb4kM
  l0kkczcFt1gx6KGLLA1DrkM26Q==
  -----END PRIVATE KEY-----
  ```
- ⚠️ **IMPORTANT**: 
  - Multiline text ko as-is paste karo
  - `\n` characters ko manually add nahi karna
  - Vercel multiline text handle karta hai
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

### Variable 7: FIREBASE_CLIENT_EMAIL
- **Key:** `FIREBASE_CLIENT_EMAIL`
- **Value:** `firebase-adminsdk-fbsvc@srilankan-project.iam.gserviceaccount.com`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

### Variable 8: FIREBASE_CLIENT_ID
- **Key:** `FIREBASE_CLIENT_ID`
- **Value:** `113675232994824571570`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

### Variable 9: CLOUDINARY_CLOUD_NAME
- **Key:** `CLOUDINARY_CLOUD_NAME`
- **Value:** `dz6bfwgry`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

### Variable 10: CLOUDINARY_API_KEY
- **Key:** `CLOUDINARY_API_KEY`
- **Value:** `967858191613995`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

### Variable 11: CLOUDINARY_API_SECRET
- **Key:** `CLOUDINARY_API_SECRET`
- **Value:** `hmnMp4SNpA95M-bO2R9dDkO2d4M`
- **Environment:** ✅ Production, ✅ Preview, ✅ Development

---

## 📋 Step 3: Deploy Karo

1. **Sab variables add karne ke baad:**
   - "Save" karo
   - "Deployments" tab pe jao
   - Latest deployment ke ... menu se **"Redeploy"** click karo
   - Ya **"Redeploy"** button click karo

2. **Build Process:**
   - Build logs dekho
   - Usually 2-3 minutes lagta hai
   - Success message dikhega

3. **Backend URL Copy Karo:**
   - Deployment successful hone ke baad
   - URL mil jayega (e.g., `https://srilanka-backend.vercel.app`)
   - **Is URL ko copy karo** - frontend me use karenge

---

## ✅ Verification

### 1. Health Check
- Browser me backend URL kholo:
  ```
  https://your-backend.vercel.app
  ```
- Should show: `{"status":"OK","message":"Sri Lankan Learning Platform API",...}`

### 2. Health Endpoint
- Test karo:
  ```
  https://your-backend.vercel.app/health
  ```
- Should show: `{"status":"OK","timestamp":"...","service":"Sri Lankan Learning Platform API"}`

### 3. API Endpoint
- Test karo:
  ```
  https://your-backend.vercel.app/api/auth/test
  ```
- Should respond (may need auth token)

---

## 🔧 Important Notes

### 1. Build Command
- ⚠️ **KHALI** rakho (empty)
- Vercel automatically TypeScript compile karta hai
- Agar build command set hai to error aayega

### 2. Root Directory
- ⚠️ **`backend`** hona chahiye
- Agar galat hai to deployment fail hoga

### 3. FIREBASE_PRIVATE_KEY
- Multiline text ko properly paste karo
- Vercel multiline support karta hai
- `\n` manually add nahi karna

### 4. Environment Selection
- Har variable ke liye **Production, Preview, Development** sab select karo
- Yeh ensure karega ki sab environments me kaam kare

---

## 🎯 Quick Checklist

- [ ] Vercel me naya project create kiya
- [ ] Root Directory: `backend` set kiya
- [ ] Build Command: **KHALI** rakha
- [ ] NODE_ENV variable add kiya
- [ ] PORT variable add kiya (optional)
- [ ] FRONTEND_URL variable add kiya
- [ ] FIREBASE_PROJECT_ID variable add kiya
- [ ] FIREBASE_PRIVATE_KEY_ID variable add kiya
- [ ] FIREBASE_PRIVATE_KEY variable add kiya (multiline)
- [ ] FIREBASE_CLIENT_EMAIL variable add kiya
- [ ] FIREBASE_CLIENT_ID variable add kiya
- [ ] CLOUDINARY_CLOUD_NAME variable add kiya
- [ ] CLOUDINARY_API_KEY variable add kiya
- [ ] CLOUDINARY_API_SECRET variable add kiya
- [ ] Sab variables ke liye Production/Preview/Development select kiya
- [ ] Redeploy kiya
- [ ] Health check test kiya

---

## 🚀 After Deployment

### Frontend Update Karna

1. **Frontend Project** me jao
2. **Settings** → **Environment Variables**
3. **`VITE_API_URL`** update karo:
   ```
   https://your-backend.vercel.app
   ```
4. **Redeploy** frontend

---

## ❌ Common Errors & Solutions

### Error: `tsc: command not found`
**Solution:** Build Command ko **KHALI** rakho

### Error: `Cannot find module`
**Solution:** Root Directory `backend` hai ya nahi check karo

### Error: Firebase initialization failed
**Solution:** FIREBASE_PRIVATE_KEY properly paste kiya hai ya nahi check karo

### Error: CORS error
**Solution:** FRONTEND_URL correctly set hai ya nahi check karo

---

## ✅ Summary

**Steps:**
1. ✅ Vercel me naya project banao
2. ✅ Root Directory: `backend` select karo
3. ✅ Build Command: **KHALI** rakho
4. ✅ 11 environment variables add karo (list upar hai)
5. ✅ Redeploy karo
6. ✅ Health check test karo

**That's it! Backend deploy ho jayega! 🚀**

---

**Koi problem aaye to batao!**

