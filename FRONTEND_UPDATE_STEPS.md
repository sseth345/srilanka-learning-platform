# 🎯 Frontend Update Steps - Backend URL

## ✅ Backend Deployed Successfully!

**Backend URL:** `http://srilanka-learning-platform-j2jjht.vercel.app/`

Ab frontend me yeh URL set karna hai.

---

## 📋 Step 1: Vercel Frontend Project Me Jao

1. **Vercel Dashboard** me jao
   - https://vercel.com
   - Login karo

2. **Frontend Project** select karo
   - Jo project pehle se deployed hai (frontend wala)

---

## 📋 Step 2: Environment Variable Update Karo

1. **Settings** tab pe jao
   - Project ke settings me jao

2. **Environment Variables** section me jao

3. **`VITE_API_URL`** variable find karo:
   - Agar already hai to **Edit** karo
   - Agar nahi hai to **Add New** click karo

4. **Value Update Karo:**
   ```
   http://srilanka-learning-platform-j2jjht.vercel.app
   ```
   - ⚠️ **IMPORTANT**: 
     - `http://` ya `https://` dono chalega
     - Trailing slash (`/`) mat lagao
     - Backend URL exactly copy karo

5. **Environment Selection:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   - (Sab select karo)

6. **Save** karo

---

## 📋 Step 3: Optional - VITE_API_BASE_URL (Agar Chahiye)

Agar `VITE_API_BASE_URL` bhi set hai to:

1. **`VITE_API_BASE_URL`** variable find karo
2. **Value Update Karo:**
   ```
   http://srilanka-learning-platform-j2jjht.vercel.app/api
   ```
3. **Save** karo

---

## 📋 Step 4: Redeploy Frontend

1. **Deployments** tab pe jao
2. Latest deployment ke ... menu se **"Redeploy"** click karo
   - Ya **"Redeploy"** button click karo
3. **Wait** karo (2-3 minutes)
4. Deployment successful ho jayega

---

## ✅ Verification

### 1. Frontend Test Karo
- Frontend URL kholo
- Browser console kholo (F12)
- Network tab me jao
- Koi API call karo (login, etc.)
- Request URL check karo - backend URL dikhna chahiye:
  ```
  http://srilanka-learning-platform-j2jjht.vercel.app/api/...
  ```

### 2. API Calls Test Karo
- Login try karo
- Koi data fetch karo
- Sab kaam karna chahiye

---

## 🔧 Alternative: Local Development

Agar local development me test karna ho:

1. **Frontend folder** me `.env` file banao:
   ```env
   VITE_API_URL=http://srilanka-learning-platform-j2jjht.vercel.app
   ```

2. **Frontend restart** karo:
   ```bash
   npm run dev
   ```

---

## ⚠️ Important Notes

### 1. HTTP vs HTTPS
- Backend URL `http://` hai (Vercel free tier me sometimes HTTP hota hai)
- Agar `https://` chahiye to backend me custom domain setup karo
- Frontend me dono chalega

### 2. CORS Settings
- Backend me `FRONTEND_URL` environment variable set karo
- Frontend URL ko backend CORS me allow karna hoga
- Backend me already configured hai, bas verify karo

### 3. Environment Variables
- Environment variables **build time** pe inject hote hain
- Redeploy zaroori hai after updating variables
- Preview deployments me bhi same variables use honge

---

## 🎯 Quick Checklist

- [ ] Vercel me frontend project khola
- [ ] Settings → Environment Variables me gaya
- [ ] `VITE_API_URL` variable update kiya
- [ ] Value: `http://srilanka-learning-platform-j2jjht.vercel.app` set kiya
- [ ] Production, Preview, Development sab select kiye
- [ ] Save kiya
- [ ] Redeploy kiya
- [ ] Frontend test kiya
- [ ] API calls working hain

---

## 🚀 Summary

**Steps:**
1. ✅ Frontend project me jao
2. ✅ `VITE_API_URL` = `http://srilanka-learning-platform-j2jjht.vercel.app` set karo
3. ✅ Redeploy karo
4. ✅ Test karo

**That's it! Frontend ab backend se connect ho jayega! 🎉**

---

## 📝 Backend CORS Check (Optional)

Agar CORS errors aaye to:

1. **Backend Project** me jao
2. **Settings** → **Environment Variables**
3. **`FRONTEND_URL`** check karo:
   ```
   https://your-frontend.vercel.app
   ```
4. Agar galat hai to update karo
5. Backend redeploy karo

---

**Koi problem aaye to batao! 🚀**

