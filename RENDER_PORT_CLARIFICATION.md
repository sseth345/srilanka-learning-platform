# 🔧 Render PORT Configuration

## ✅ Important: PORT for Render

### Render Automatic PORT:
- **Render automatically sets `PORT` environment variable**
- Free tier uses port **10000** by default
- **You DON'T need to set PORT manually** - Render does it automatically

### Your Backend Code:
```typescript
const BASE_PORT = Number(process.env.PORT) || 3001;
```
- Code uses `process.env.PORT` if set
- Falls back to 3001 if not set
- **Render automatically provides PORT=10000**, so it will use that

---

## 📋 Correct Environment Variables for Render

### ✅ DO Set These:
```
NODE_ENV=production
FRONTEND_URL=https://srilanka-learning-platform.vercel.app
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_VIDEOS_FOLDER=videos
CLOUDINARY_BOOKS_FOLDER=books
```

### ❌ DON'T Set PORT:
- **Remove PORT from environment variables**
- Render automatically provides it
- Setting it manually might cause issues

### ✅ DO Update FRONTEND_URL:
- Change from `http://localhost:8080`
- To: `https://srilanka-learning-platform.vercel.app`

---

## 🎯 Summary

**For Render:**
- ❌ **Don't set PORT** - Render does it automatically (10000)
- ✅ **Set FRONTEND_URL** = Your Vercel URL
- ✅ **Set NODE_ENV** = production
- ✅ **Set all Firebase & Cloudinary variables**

**Your backend code will automatically use Render's PORT (10000)**

---

## ✅ Final Environment Variables List (12 variables)

1. `NODE_ENV=production`
2. `FRONTEND_URL=https://srilanka-learning-platform.vercel.app`
3. `FIREBASE_PROJECT_ID=...`
4. `FIREBASE_PRIVATE_KEY_ID=...`
5. `FIREBASE_PRIVATE_KEY=...`
6. `FIREBASE_CLIENT_EMAIL=...`
7. `FIREBASE_CLIENT_ID=...`
8. `CLOUDINARY_CLOUD_NAME=...`
9. `CLOUDINARY_API_KEY=...`
10. `CLOUDINARY_API_SECRET=...`
11. `CLOUDINARY_VIDEOS_FOLDER=videos`
12. `CLOUDINARY_BOOKS_FOLDER=books`

**Note: PORT is NOT in this list - Render provides it automatically!**

