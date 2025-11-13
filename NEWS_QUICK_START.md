# 📰 News Feature - Quick Start Guide

## 🚀 Get Started in 5 Minutes!

### Step 1: Start the Backend (if not running)

```bash
cd /Users/shreyashgautam/fullstack_srilankan/backend
npm run dev
```

The backend should be running on `http://localhost:3001`

### Step 2: Start the Frontend (if not running)

```bash
cd /Users/shreyashgautam/fullstack_srilankan/frontend
npm run dev
```

The frontend should be running on `http://localhost:8080`

### Step 3: Test as Teacher

1. **Login as a teacher**
   - Email: (your teacher account)
   - Password: (your password)

2. **Navigate to "Tamil News"** from the sidebar

3. **Click "Add News"** button (top right)

4. **Fill the form:**
   ```
   Title: "Welcome to Tamil News!"
   Content: "This is the first news article. Students can read and listen to news in Tamil to improve their language skills."
   Category: Education
   Language: Tamil
   Tags: welcome, education, tamil
   Toggle: Publish Immediately ✓
   ```

5. **Optionally upload audio:**
   - Click "Upload Audio"
   - Select an audio file (MP3, WAV, etc.)
   - Max size: 20MB

6. **Click "Create News"** ✨

### Step 4: Test as Student

1. **Login as a student** (or switch accounts)

2. **Navigate to "Tamil News"**

3. **You should see the article!** 🎉

4. **Click on the article** to read full content

5. **If audio was uploaded:**
   - Click the "Play" button in the audio player
   - Use the seek bar to navigate
   - Adjust volume
   - Click restart to play from beginning

6. **Like the article** ❤️

7. **Try filters:**
   - Filter by Category: "Education"
   - Filter by Language: "Tamil"
   - Clear filters to see all

### Step 5: Explore External News Sources

Check out the sidebar for links to real Tamil news websites:
- தினமலர் (Dinamalar)
- BBC Tamil
- The Hindu Tamil
- And more!

## 🎯 Key Features to Test

### Teacher Features
- ✅ Create news with/without audio
- ✅ Edit your own articles
- ✅ Delete your own articles
- ✅ View statistics

### Student Features
- ✅ Read articles
- ✅ Listen to audio
- ✅ Like articles
- ✅ Filter by category/language
- ✅ Share articles
- ✅ Access external sources

## 🎨 Categories Available

- General
- Politics
- Sports
- Entertainment
- Technology
- Education
- Health
- Business
- Culture
- International

## 🌐 Languages Supported

- Tamil (தமிழ்)
- Sinhala (සිංහල)
- English

## 📊 Sample Data

Create a few more articles to see the full experience:

### Article 2 (Sports)
```
Title: "Cricket World Cup Updates"
Content: "Latest updates from the cricket world cup..."
Category: Sports
Language: Tamil
```

### Article 3 (Technology)
```
Title: "AI in Education"
Content: "How artificial intelligence is transforming education..."
Category: Technology
Language: English
```

### Article 4 (Culture)
```
Title: "Tamil Cultural Festival"
Content: "Annual cultural festival celebrates Tamil heritage..."
Category: Culture
Language: Tamil
Tags: festival, culture, heritage
```

## 🎧 Audio Recording Tips

If you want to add audio:

1. **Record on your phone or computer**
2. **Keep it under 20MB**
3. **Save as MP3 for best compatibility**
4. **Speak clearly and at a moderate pace**
5. **Include pauses between sentences**

## 🐛 Quick Troubleshooting

### Backend not running?
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill the process if needed
kill -9 <PID>

# Restart backend
cd backend && npm run dev
```

### Frontend issues?
```bash
# Clear TypeScript cache
cd frontend
rm -rf node_modules/.cache
npx tsc --noEmit
npm run dev
```

### Audio not uploading?
- Check file size (max 20MB)
- Ensure Firebase Storage is configured
- Verify file format is audio/*

## ✅ Success Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 8080
- [ ] Teacher can create news articles
- [ ] Audio upload works (if testing)
- [ ] Student can view articles
- [ ] Audio player works (if audio uploaded)
- [ ] Filters work correctly
- [ ] Like button works
- [ ] External links accessible

## 🎉 You're All Set!

Enjoy the beautiful Tamil News feature! Teachers can share engaging content with audio, and students can improve their language skills by reading and listening! 📰🎧

---

**Full Documentation:** See `NEWS_FEATURE_GUIDE.md` for complete details.

