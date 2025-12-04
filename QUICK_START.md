# 🚀 Quick Start Guide

## Running Locally

### Backend:
```bash
cd backend
npm install
npm run dev
```
Backend runs on: `http://localhost:3001`

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:8080` (or check terminal output)

---

## Deploying to Vercel

### Backend Deployment:
1. Go to Vercel → Add Project
2. Import repository
3. **Root Directory**: `backend`
4. Add environment variables (see `VERCEL_COMPLETE_DEPLOYMENT.md`)
5. Deploy

### Frontend Deployment:
1. Go to Vercel → Add Project
2. Import repository
3. **Root Directory**: `frontend`
4. Add environment variables (see `VERCEL_COMPLETE_DEPLOYMENT.md`)
5. Deploy

**Full details**: See `VERCEL_COMPLETE_DEPLOYMENT.md`

---

## Environment Variables Needed

### Backend (.env or Vercel):
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FRONTEND_URL` (after frontend deployment)

### Frontend (.env or Vercel):
- `VITE_API_URL` (backend URL)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

## Project Structure

```
srilanka/
├── backend/           # Express.js API
│   ├── api/          # Vercel serverless function
│   ├── src/          # Source code
│   └── vercel.json   # Vercel config
├── frontend/         # React + Vite
│   ├── src/          # Source code
│   └── vercel.json   # Vercel config
└── VERCEL_COMPLETE_DEPLOYMENT.md  # Full deployment guide
```

---

## Key Files

- `backend/vercel.json` - Backend Vercel configuration
- `backend/api/index.ts` - Serverless function entry point
- `frontend/vercel.json` - Frontend Vercel configuration
- `VERCEL_COMPLETE_DEPLOYMENT.md` - Complete deployment guide

---

## Troubleshooting

**Backend won't start?**
- Check environment variables
- Verify Firebase credentials
- Check port availability

**Frontend won't connect to backend?**
- Verify `VITE_API_URL` is set correctly
- Check backend is running
- Check CORS settings

**Deployment fails?**
- Verify Root Directory is set correctly (`backend` or `frontend`)
- Check environment variables are added
- Review build logs in Vercel dashboard

---

For detailed information, see `VERCEL_COMPLETE_DEPLOYMENT.md`

