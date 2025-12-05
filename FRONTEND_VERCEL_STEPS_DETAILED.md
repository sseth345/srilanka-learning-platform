# 🎯 Frontend Project Me Kya Karna Hai - Detailed Steps

## 📋 Vercel Dashboard Me Steps

### Step 1: Frontend Project Kholo

1. **Vercel Dashboard** me jao
   - https://vercel.com
   - Login karo

2. **Projects List** me se **Frontend Project** select karo
   - Jo project pehle se deployed hai (frontend wala)
   - Project name dekho (e.g., `srilanka-frontend` ya `srilanka-learning-platform`)

---

### Step 2: Settings Tab Me Jao

1. Project open karne ke baad, **top menu** me **"Settings"** tab click karo
   - Settings tab project ke left side ya top me hoga

---

### Step 3: Environment Variables Section

1. **Settings** page me scroll karo
2. **"Environment Variables"** section dhundho
   - Left sidebar me ya page ke middle me hoga
   - Section heading: "Environment Variables"

---

### Step 4: VITE_API_URL Variable Find/Add Karo

**Agar Variable Already Hai:**

1. **`VITE_API_URL`** variable list me dhundho
2. **Right side** me **"Edit"** ya **"..."** (three dots) button click karo
3. **Value** field me jao
4. **Old value** delete karo
5. **New value** paste karo:
   ```
   http://srilanka-learning-platform-j2jjht.vercel.app
   ```
6. **Environment** checkboxes verify karo:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
7. **"Save"** ya **"Update"** button click karo

**Agar Variable Nahi Hai:**

1. **"Add New"** ya **"Add Variable"** button click karo
2. **Key** field me type karo:
   ```
   VITE_API_URL
   ```
3. **Value** field me paste karo:
   ```
   http://srilanka-learning-platform-j2jjht.vercel.app
   ```
4. **Environment** checkboxes select karo:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. **"Save"** button click karo

---

### Step 5: Optional - VITE_API_BASE_URL (Agar Chahiye)

Agar `VITE_API_BASE_URL` variable bhi hai to:

1. **`VITE_API_BASE_URL`** variable find karo
2. **Edit** karo
3. **Value** update karo:
   ```
   http://srilanka-learning-platform-j2jjht.vercel.app/api
   ```
4. **Save** karo

---

### Step 6: Redeploy Frontend

1. **Top menu** me **"Deployments"** tab click karo
   - Ya left sidebar se "Deployments" select karo

2. **Latest Deployment** dhundho
   - Top pe sabse latest deployment dikhega

3. **Three dots (...)** button click karo
   - Latest deployment ke right side me
   - Ya **"Redeploy"** button directly dikh sakta hai

4. **"Redeploy"** option select karo
   - Confirmation dialog aayega

5. **"Redeploy"** confirm karo
   - Build start ho jayega

6. **Wait** karo (2-3 minutes)
   - Build logs dekh sakte ho
   - "Ready" status dikhega jab complete ho jayega

---

## ✅ Verification Steps

### 1. Deployment Status Check

1. **Deployments** tab me jao
2. Latest deployment check karo:
   - Status: **"Ready"** hona chahiye
   - Build successful hona chahiye

### 2. Frontend Test Karo

1. **Frontend URL** kholo
   - Deployment page pe URL dikhega
   - Ya **"Visit"** button click karo

2. **Browser Console** kholo (F12)
   - **Network** tab select karo

3. **Koi Action** karo:
   - Login try karo
   - Ya koi page load karo jo API call kare

4. **Network Tab** me API calls check karo:
   - Request URL me backend URL dikhna chahiye:
     ```
     http://srilanka-learning-platform-j2jjht.vercel.app/api/...
     ```

### 3. API Calls Test

1. **Login** try karo
2. **Data fetch** karo (videos, books, etc.)
3. **Sab kaam** karna chahiye

---

## 📸 Visual Guide (Text Based)

```
Vercel Dashboard
├── Projects List
│   └── [Your Frontend Project] ← Click here
│
└── Project Page
    ├── Overview (default tab)
    ├── Deployments ← Redeploy ke liye
    ├── Settings ← Environment Variables ke liye
    │   └── Environment Variables Section
    │       ├── VITE_API_URL ← Edit/Add here
    │       └── [Add New] button
    └── ...
```

---

## 🎯 Quick Checklist

- [ ] Vercel dashboard me login kiya
- [ ] Frontend project select kiya
- [ ] Settings tab me gaya
- [ ] Environment Variables section me gaya
- [ ] VITE_API_URL variable find/edit kiya
- [ ] Value: `http://srilanka-learning-platform-j2jjht.vercel.app` set kiya
- [ ] Production, Preview, Development sab select kiye
- [ ] Save button click kiya
- [ ] Deployments tab me gaya
- [ ] Latest deployment pe Redeploy click kiya
- [ ] Build complete hone ka wait kiya
- [ ] Frontend URL test kiya
- [ ] API calls working hain

---

## ⚠️ Common Mistakes to Avoid

1. ❌ **Trailing Slash**: URL me `/` mat lagao end me
   - ✅ Correct: `http://srilanka-learning-platform-j2jjht.vercel.app`
   - ❌ Wrong: `http://srilanka-learning-platform-j2jjht.vercel.app/`

2. ❌ **Environment Selection**: Har environment select karo
   - ✅ Production, Preview, Development sab

3. ❌ **Redeploy Na Karna**: Environment variables update ke baad redeploy zaroori hai

4. ❌ **Wrong Variable Name**: 
   - ✅ Correct: `VITE_API_URL`
   - ❌ Wrong: `API_URL` ya `VITE_API_BASE_URL` (agar pehle se nahi hai)

---

## 🔧 Troubleshooting

### Problem: Variable Save Nahi Ho Raha
**Solution:**
- Check karo ki sab fields fill hain
- Environment checkboxes select kiye hain
- Internet connection theek hai

### Problem: Redeploy Nahi Ho Raha
**Solution:**
- Latest deployment pe jao
- Three dots menu check karo
- Ya manually "Redeploy" button dhundho

### Problem: API Calls Fail Ho Rahe Hain
**Solution:**
- Browser console check karo (F12)
- Network tab me request URL verify karo
- Backend URL correct hai ya nahi check karo
- CORS errors check karo

---

## 📝 Summary

**Frontend Project Me:**
1. ✅ Settings → Environment Variables
2. ✅ `VITE_API_URL` = `http://srilanka-learning-platform-j2jjht.vercel.app`
3. ✅ Save
4. ✅ Deployments → Redeploy
5. ✅ Test

**That's it! 🚀**

---

**Koi problem aaye to batao!**

