# 🔄 Multiple Backend Setup Guide

## ✅ Haan, Same Frontend Pe Dusra Backend Connect Ho Sakta Hai!

Frontend me backend URL **environment variables** se set hota hai. Aap easily dusra backend connect kar sakte hain.

---

## 🎯 Method 1: Environment Variables Se (Easiest)

### Vercel Me:

1. **Frontend Project** → **Settings** → **Environment Variables**
2. **`VITE_API_URL`** ko update karo:
   - Old: `https://backend1.vercel.app`
   - New: `https://backend2.vercel.app`
3. **Save** karo
4. **Redeploy** karo

**That's it!** Frontend ab naye backend se connect ho jayega.

---

## 🎯 Method 2: Different Environments Ke Liye Different Backends

### Example:
- **Production**: `https://production-backend.vercel.app`
- **Preview**: `https://staging-backend.vercel.app`
- **Development**: `http://localhost:3001`

### Vercel Me Setup:

1. **Environment Variables** me:
   - **Production** environment: `VITE_API_URL` = `https://production-backend.vercel.app`
   - **Preview** environment: `VITE_API_URL` = `https://staging-backend.vercel.app`
   - **Development** environment: `VITE_API_URL` = `http://localhost:3001`

2. Vercel automatically sahi backend use karega based on environment!

---

## 🎯 Method 3: Runtime Me Backend Switch Karna (Advanced)

Agar aap chahte hain ki user runtime me backend switch kar sake, to yeh setup karna padega:

### Step 1: API Config Update Karo

`frontend/src/config/api.ts` me:

```typescript
// Local storage se backend URL read karo
const getStoredBackendUrl = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('backend_url');
  }
  return null;
};

const getApiBaseUrl = (): string => {
  // Priority: localStorage > VITE_API_URL > VITE_API_BASE_URL > default
  const storedUrl = getStoredBackendUrl();
  if (storedUrl) {
    return storedUrl;
  }
  
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return 'http://localhost:3001';
};
```

### Step 2: Backend Switcher Component Banao

```typescript
// components/BackendSwitcher.tsx
const BackendSwitcher = () => {
  const [backendUrl, setBackendUrl] = useState(
    localStorage.getItem('backend_url') || import.meta.env.VITE_API_URL
  );

  const handleSwitch = (url: string) => {
    localStorage.setItem('backend_url', url);
    setBackendUrl(url);
    window.location.reload(); // Reload to apply changes
  };

  return (
    <Select value={backendUrl} onValueChange={handleSwitch}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="https://backend1.vercel.app">
          Backend 1 (Production)
        </SelectItem>
        <SelectItem value="https://backend2.vercel.app">
          Backend 2 (Staging)
        </SelectItem>
        <SelectItem value="http://localhost:3001">
          Local Backend
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
```

---

## 📋 Current Setup

Abhi frontend me yeh configuration hai:

**File:** `frontend/src/config/api.ts`

```typescript
const getApiBaseUrl = (): string => {
  // Priority: VITE_API_URL > VITE_API_BASE_URL > default
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return 'http://localhost:3001';
};
```

**Yeh means:**
1. Pehle `VITE_API_URL` check karega
2. Agar nahi mila to `VITE_API_BASE_URL` check karega
3. Agar dono nahi mile to `http://localhost:3001` use karega

---

## 🔧 Backend Switch Karne Ke Steps

### Option A: Vercel Environment Variables (Recommended)

1. **Vercel Dashboard** me jao
2. **Frontend Project** → **Settings** → **Environment Variables**
3. **`VITE_API_URL`** ko update karo:
   ```
   https://new-backend-url.vercel.app
   ```
4. **Save** karo
5. **Redeploy** karo

**Time:** 2-3 minutes

---

### Option B: Local Development Me

1. **`.env` file** banao `frontend/` folder me:
   ```env
   VITE_API_URL=http://localhost:3002
   ```
2. **Frontend restart** karo:
   ```bash
   npm run dev
   ```

---

## ✅ Verification

Backend switch karne ke baad verify karo:

1. **Browser Console** kholo (F12)
2. **Network** tab me jao
3. Koi API call karo
4. **Request URL** check karo - naya backend URL dikhna chahiye

---

## 🎯 Use Cases

### 1. Production vs Staging
- **Production Frontend** → **Production Backend**
- **Staging Frontend** → **Staging Backend**

### 2. Testing Different Backends
- Same frontend se multiple backends test karo
- Environment variables change karke easily switch karo

### 3. Backup Backend
- Agar ek backend down ho, dusra backend use karo
- Environment variable change karke quickly switch karo

---

## ⚠️ Important Notes

1. **CORS Settings**: Naya backend me frontend URL ko CORS me allow karna hoga
2. **Environment Variables**: Har environment (Production/Preview/Development) ke liye alag set kar sakte ho
3. **Build Time**: Environment variables build time pe inject hote hain, runtime me change nahi hote (unless localStorage use karo)

---

## 🚀 Quick Switch Example

**Scenario:** Aapko backend1 se backend2 pe switch karna hai

1. Vercel me `VITE_API_URL` = `https://backend2.vercel.app` set karo
2. Redeploy karo
3. Done! ✅

**Frontend code me koi change nahi karna padega!**

---

## 📝 Summary

✅ **Haan, same frontend pe dusra backend connect ho sakta hai!**

**Methods:**
1. ✅ Environment variables se (easiest)
2. ✅ Different environments ke liye different backends
3. ✅ Runtime switching (advanced, localStorage use karke)

**Current Setup:**
- Environment variables se backend URL set hota hai
- `VITE_API_URL` priority me hai
- Easily change kar sakte ho Vercel me

**No code changes needed!** Bas environment variable update karo aur redeploy karo.

---

**Koi aur help chahiye? Pucho! 🚀**

