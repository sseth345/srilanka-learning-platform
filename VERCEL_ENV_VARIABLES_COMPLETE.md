# 🔑 Vercel Environment Variables - Complete List

## 📋 Step-by-Step: Add Each Variable

### Vercel Dashboard:
1. Project → Settings → Environment Variables
2. "Add New" click karo
3. Har variable ke liye separately add karo

---

## ✅ Variables to Add (Copy-Paste Ready)

### 1. Backend API URL (IMPORTANT!)
**Key:**
```
VITE_API_URL
```

**Value:**
```
https://srilanka-backend.onrender.com
```

**Environment:** Production, Preview, Development (sab select karo)

---

### 2. Firebase API Key
**Key:**
```
VITE_FIREBASE_API_KEY
```

**Value:**
```
AIzaSyBiSzmpdsaxdWI6v4mdIouQ-AdYOEgxZCo
```
(Ya aapka actual Firebase API key)

**Environment:** Production, Preview, Development

---

### 3. Firebase Auth Domain
**Key:**
```
VITE_FIREBASE_AUTH_DOMAIN
```

**Value:**
```
srilankan-project.firebaseapp.com
```
(Ya aapka actual Firebase auth domain)

**Environment:** Production, Preview, Development

---

### 4. Firebase Project ID
**Key:**
```
VITE_FIREBASE_PROJECT_ID
```

**Value:**
```
srilankan-project
```
(Ya aapka actual project ID)

**Environment:** Production, Preview, Development

---

### 5. Firebase Storage Bucket
**Key:**
```
VITE_FIREBASE_STORAGE_BUCKET
```

**Value:**
```
srilankan-project.firebasestorage.app
```
(Ya aapka actual storage bucket)

**Environment:** Production, Preview, Development

---

### 6. Firebase Messaging Sender ID
**Key:**
```
VITE_FIREBASE_MESSAGING_SENDER_ID
```

**Value:**
```
352587994835
```
(Ya aapka actual sender ID)

**Environment:** Production, Preview, Development

---

### 7. Firebase App ID
**Key:**
```
VITE_FIREBASE_APP_ID
```

**Value:**
```
1:352587994835:web:0d40171696245ee2eca626
```
(Ya aapka actual app ID)

**Environment:** Production, Preview, Development

---

## 📝 Quick Reference Table

| Key | Value | Required? |
|-----|-------|-----------|
| `VITE_API_URL` | `https://srilanka-backend.onrender.com` | ✅ **MUST** |
| `VITE_FIREBASE_API_KEY` | Your Firebase API key | ✅ **MUST** |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase auth domain | ✅ **MUST** |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID | ✅ **MUST** |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket | ✅ **MUST** |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase sender ID | ✅ **MUST** |
| `VITE_FIREBASE_APP_ID` | Your Firebase app ID | ✅ **MUST** |

---

## 🎯 How to Add in Vercel

### For Each Variable:

1. **"Add New" click karo**
2. **Key field mein:** Variable name paste karo (e.g., `VITE_API_URL`)
3. **Value field mein:** Value paste karo (e.g., `https://srilanka-backend.onrender.com`)
4. **Environment:** 
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
   - (Sab select karo)
5. **"Save" click karo**
6. **Repeat for next variable**

---

## ⚠️ Important Notes

1. **VITE_API_URL** = Backend URL (most important!)
2. **All Firebase values** = Aapke actual Firebase config se
3. **Environment selection** = Sab (Production, Preview, Development) select karo
4. **After adding all** = Redeploy karo

---

## ✅ After Adding All Variables

1. **Redeploy Vercel:**
   - Deployments → Latest → Redeploy
2. **Wait 2-3 minutes**
3. **Test frontend**

---

**Sab variables add karne ke baad redeploy karo! 🚀**

