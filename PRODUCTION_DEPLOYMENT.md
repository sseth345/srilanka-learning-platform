# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### ✅ Current Status

**Security Features:**
- ✅ Helmet.js for security headers
- ✅ CORS configured
- ✅ Rate limiting (100 requests/15min)
- ✅ Firebase Authentication
- ✅ Role-based access control
- ✅ Input validation
- ✅ Error handling

**What Needs to be Fixed:**
- ⚠️ Hardcoded localhost URLs in some files
- ⚠️ Environment variables need to be set
- ⚠️ CORS needs production URL
- ⚠️ Build scripts ready

---

## 📋 Step-by-Step Deployment

### 1. Environment Variables Setup

#### Backend `.env` (Production)
```env
# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_VIDEOS_FOLDER=videos
CLOUDINARY_BOOKS_FOLDER=books
```

#### Frontend `.env` (Production)
```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com/api

# Firebase Client Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

### 2. Build Commands

#### Backend
```bash
cd backend
npm install
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run build
# Output will be in frontend/dist/
```

---

### 3. Deployment Options

#### Option A: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel):**
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

**Backend (Railway/Render):**
1. Connect GitHub repo
2. Set root directory to `backend`
3. Add environment variables
4. Set build command: `npm run build`
5. Set start command: `npm start`
6. Deploy

#### Option B: AWS EC2 / DigitalOcean Droplet

**Server Setup:**
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd srilanka

# Backend
cd backend
npm install
npm run build
pm2 start dist/index.js --name "srilanka-backend"

# Frontend
cd ../frontend
npm install
npm run build
# Serve with nginx or PM2
```

**Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/srilanka
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### Option C: Docker Deployment

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    env_file:
      - ./backend/.env
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### 4. SSL Certificate (HTTPS)

**Using Let's Encrypt (Certbot):**
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Auto-renewal:**
```bash
sudo certbot renew --dry-run
```

---

### 5. Database & Storage

**Firebase:**
- Already configured via environment variables
- No additional setup needed

**Cloudinary:**
- Already configured via environment variables
- Ensure production account has sufficient quota

---

### 6. Monitoring & Logging

**PM2 Monitoring:**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Health Check:**
- Backend: `https://api.yourdomain.com/health`
- Monitor this endpoint for uptime

---

### 7. Security Checklist

- [ ] All environment variables set
- [ ] CORS configured for production domain
- [ ] HTTPS enabled
- [ ] Rate limiting active
- [ ] Firebase security rules updated
- [ ] Cloudinary access restrictions set
- [ ] `.env` files not in git
- [ ] API keys rotated
- [ ] Error messages don't expose sensitive info

---

### 8. Post-Deployment

1. **Test all features:**
   - User authentication
   - File uploads (books/videos)
   - Video streaming
   - Exercises
   - Discussions

2. **Performance:**
   - Check page load times
   - Test video streaming
   - Monitor API response times

3. **Monitoring:**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor server resources
   - Set up alerts

---

## 🔧 Quick Fixes Needed

### Fix Hardcoded URLs

Some files have hardcoded `localhost:3001`. These should use environment variables:

- `frontend/src/pages/Index.tsx` - Lines 59, 63, 67, 71, 75
- `frontend/src/pages/TamilNews.tsx` - Lines 62, 92
- `frontend/src/pages/Progress.tsx` - Line 47
- `frontend/src/pages/NewsManagement.tsx` - Lines 58, 90, 121
- `frontend/src/pages/Analytics.tsx` - Lines 72, 79, 91
- `frontend/src/components/NewsDetailView.tsx` - Lines 98, 128, 165
- `frontend/src/components/CreateNewsDialog.tsx` - Line 103

**Solution:** Replace with:
```typescript
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
```

---

## 📊 Recommended Hosting Services

**Frontend:**
- Vercel (Recommended - Free tier available)
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

**Backend:**
- Railway (Recommended - Easy setup)
- Render
- AWS EC2
- DigitalOcean App Platform
- Heroku (Paid)

**Database:**
- Firebase (Already using)
- Cloudinary (Already using)

---

## 🚨 Important Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Set production environment variables** in hosting platform
3. **Update CORS** to allow only your production domain
4. **Enable HTTPS** for security
5. **Monitor logs** for errors
6. **Set up backups** for Firebase data
7. **Test thoroughly** before going live

---

## 📞 Support

If you encounter issues:
1. Check server logs
2. Verify environment variables
3. Test API endpoints directly
4. Check Firebase/Cloudinary console
5. Review browser console for frontend errors

---

## ✅ Production Ready Status

**Current Status:** ~85% Ready

**What's Good:**
- ✅ Security middleware configured
- ✅ Authentication system ready
- ✅ Error handling in place
- ✅ Build scripts ready
- ✅ Environment variable support

**What Needs Work:**
- ⚠️ Fix hardcoded URLs (Quick fix)
- ⚠️ Set production environment variables
- ⚠️ Configure CORS for production domain
- ⚠️ Set up monitoring/logging
- ⚠️ SSL certificate setup

**Estimated Time to Production:** 2-4 hours

