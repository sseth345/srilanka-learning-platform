# Quick Fixes for Production Deployment

## ⚡ Critical Fixes Needed

### 1. Fix Hardcoded API URLs

**Files that need updating:**

1. `frontend/src/pages/TamilNews.tsx` - Lines 62, 92
2. `frontend/src/pages/Progress.tsx` - Line 47
3. `frontend/src/pages/NewsManagement.tsx` - Lines 58, 90, 121
4. `frontend/src/pages/Analytics.tsx` - Lines 72, 79, 91
5. `frontend/src/components/NewsDetailView.tsx` - Lines 98, 128, 165
6. `frontend/src/components/CreateNewsDialog.tsx` - Line 103

**Solution:** Replace all instances of:
```typescript
'http://localhost:3001/api/...'
```

With:
```typescript
import { getApiEndpoint } from '@/config/api';
// Then use:
getApiEndpoint('/endpoint-name')
```

**Example:**
```typescript
// Before
const response = await fetch('http://localhost:3001/api/news', { headers });

// After
import { getApiEndpoint } from '@/config/api';
const response = await fetch(getApiEndpoint('/news'), { headers });
```

---

### 2. Update CORS in Backend

**File:** `backend/src/index.ts`

**Current:**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

**For Production, update to:**
```typescript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:8080', process.env.FRONTEND_URL].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

### 3. Create Environment Variable Examples

**Create `backend/.env.example`:**
```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_VIDEOS_FOLDER=videos
CLOUDINARY_BOOKS_FOLDER=books
```

**Create `frontend/.env.example`:**
```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001/api

# Firebase Client
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

### 4. Update Helmet Configuration for Production

**File:** `backend/src/index.ts`

**Add:**
```typescript
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));
```

---

## ✅ Already Fixed

- ✅ `frontend/src/pages/Index.tsx` - Now uses `getApiEndpoint()`
- ✅ `frontend/src/config/api.ts` - Created API config utility
- ✅ Most files already use `import.meta.env.VITE_API_URL`

---

## 🚀 Deployment Checklist

Before deploying:

- [ ] Fix all hardcoded URLs (use search & replace)
- [ ] Set production environment variables
- [ ] Update CORS configuration
- [ ] Test build commands (`npm run build`)
- [ ] Test API endpoints
- [ ] Set up SSL/HTTPS
- [ ] Configure domain DNS
- [ ] Set up monitoring
- [ ] Test file uploads
- [ ] Test video streaming

---

## 📝 Quick Search & Replace

Use your IDE's search & replace (Ctrl+Shift+H) to fix URLs:

**Find:**
```
'http://localhost:3001/api/
```

**Replace:**
```
getApiEndpoint('/
```

**Then add import at top:**
```typescript
import { getApiEndpoint } from '@/config/api';
```

---

## ⏱️ Estimated Time

- Fixing URLs: 15-20 minutes
- Setting up environment: 10 minutes
- Testing: 20-30 minutes
- **Total: ~1 hour**

---

## 🎯 Production Ready Status

**After these fixes: 95% Ready**

The application is mostly production-ready. Just need to:
1. Fix remaining hardcoded URLs
2. Set production environment variables
3. Deploy!

