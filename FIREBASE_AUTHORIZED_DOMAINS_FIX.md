# 🔧 Firebase Authorized Domains Fix

## ❌ Error: "auth/unauthorized-domain"

**Problem:** Vercel domain Firebase authorized domains mein nahi hai.

**Solution:** Firebase Console mein domain add karo.

---

## 🎯 Step-by-Step Fix

### Step 1: Firebase Console Open Karo

1. **Go to Firebase Console**
   - https://console.firebase.google.com
   - Login karo
   - Aapka project select karo (`srilankan-project`)

### Step 2: Authentication Settings

1. **Left sidebar mein:**
   - "Authentication" click karo
   - "Settings" tab click karo (gear icon)
   - Scroll down to "Authorized domains" section

### Step 3: Add Vercel Domain

1. **"Add domain" button click karo**

2. **Domain add karo:**
   ```
   srilanka-learning-platform.vercel.app
   ```
   (Ya aapka actual Vercel domain)

3. **"Add" click karo**

### Step 4: Verify Domains

**Authorized domains list mein ye dikhna chahiye:**
- ✅ `localhost` (development)
- ✅ `srilanka-learning-platform.vercel.app` (production) ← **NEW**
- ✅ `srilankan-project.firebaseapp.com` (Firebase default)

---

## ✅ After Adding Domain

1. **Wait 1-2 minutes** (Firebase update hone ke liye)
2. **Browser refresh karo** (Vercel site)
3. **Google login try karo** - Should work now! ✅

---

## 🎯 Quick Checklist

- [ ] Firebase Console → Authentication → Settings
- [ ] Authorized domains section
- [ ] "Add domain" click
- [ ] `srilanka-learning-platform.vercel.app` add kiya
- [ ] "Add" click
- [ ] Wait 1-2 minutes
- [ ] Browser refresh
- [ ] Google login test

---

## 🆘 If Still Not Working

### Check:
1. **Domain exactly match karta hai?**
   - Vercel URL check karo
   - Firebase mein same domain add kiya?

2. **Wait kiya?**
   - Firebase update mein 1-2 minutes lagte hain
   - Browser cache clear karo (Ctrl+Shift+R)

3. **Multiple domains?**
   - Agar `www.` wala URL hai, dono add karo:
     - `srilanka-learning-platform.vercel.app`
     - `www.srilanka-learning-platform.vercel.app`

---

## 📝 Summary

**Error:** `auth/unauthorized-domain`  
**Fix:** Firebase Console → Authentication → Settings → Authorized domains → Add Vercel URL  
**Time:** 1-2 minutes wait karo after adding

**After this, Google login should work! 🎉**

