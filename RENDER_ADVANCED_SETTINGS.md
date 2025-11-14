# ⚙️ Render Advanced Settings Configuration

## 🎯 Advanced Section Settings

### 1. **Auto-Deploy**
- ✅ **Enable Auto-Deploy**: ON (default)
- This automatically deploys when you push to GitHub
- **Keep it ON** - helpful for updates

### 2. **Health Check Path** (Optional but Recommended)
- **Path**: `/health`
- Your backend already has this endpoint
- This helps Render know if service is running

### 3. **Pull Request Previews**
- ✅ **Enable**: ON (optional)
- Creates preview deployments for PRs
- **Can keep OFF** if not needed

### 4. **Docker Settings**
- ❌ **Don't enable** - You're using Node.js, not Docker

### 5. **Environment**
- **Environment**: `production` (already set via NODE_ENV)
- **Keep default**

### 6. **Build Cache**
- ✅ **Enable Build Cache**: ON (recommended)
- Speeds up builds by caching node_modules
- **Keep it ON**

### 7. **Native Environment Variables**
- ✅ **Use Native Environment Variables**: ON
- This is default and correct
- **Keep it ON**

### 8. **Headers** (Optional)
- Usually not needed
- **Can skip**

### 9. **Redirects/Rewrites** (Not needed for backend)
- Backend doesn't need this
- **Skip**

### 10. **Custom Domains** (Optional)
- You can add custom domain later
- **Skip for now**

---

## ✅ Recommended Advanced Settings

### Must Configure:

1. **Health Check Path**: `/health`
   - This helps Render monitor your service
   - Your backend already has this endpoint

2. **Build Cache**: Enable
   - Speeds up future builds

### Optional (Can Skip):

- Pull Request Previews
- Custom Headers
- Custom Domains

---

## 🎯 Quick Checklist for Advanced Section

- [ ] Health Check Path: `/health` ✅
- [ ] Build Cache: Enable ✅
- [ ] Auto-Deploy: Enable ✅
- [ ] Everything else: Default/Skip

---

## 📝 Summary

**Advanced Section mein:**
1. **Health Check Path** = `/health` (set karo)
2. **Build Cache** = Enable (recommended)
3. **Auto-Deploy** = Enable (default, keep it)
4. **Baaki sab** = Default/Skip

**That's it! Simple! 🚀**

