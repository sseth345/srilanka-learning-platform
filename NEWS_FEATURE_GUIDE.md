# 📰 Tamil News Feature - Complete Guide

## Overview

The Tamil News feature allows teachers to create and share news articles (with optional audio) and students to read, listen, and engage with them. This is perfect for language learning and staying informed!

## ✨ Features

### For Teachers
- 📝 Create news articles with rich content
- 🎤 Upload audio versions (up to 20MB)
- 🏷️ Add categories, tags, and language
- 🔗 Include source URLs
- 📊 Track views and likes
- ✏️ Edit and delete their own articles
- 🌐 Publish/unpublish articles

### For Students
- 📖 Read news articles in multiple languages
- 🎧 Listen to audio versions
- ❤️ Like articles
- 🔍 Filter by category and language
- 👀 View article statistics
- 🌍 Access external news sources
- 📱 Share articles

## 🎯 How It Works

### Backend API

**Base URL:** `http://localhost:3001/api/news`

#### Endpoints

1. **GET /api/news** - Get all news articles
   - Query params: `category`, `language`, `limit`, `offset`
   - Returns: List of news articles

2. **GET /api/news/:id** - Get single news article
   - Increments view count automatically
   - Returns: Full article details

3. **POST /api/news** - Create news article (teachers only)
   - Requires: `title`, `content`
   - Optional: `audio` file, `summary`, `category`, `language`, `tags`, `sourceUrl`, `published`
   - Supports multipart/form-data for audio upload

4. **PUT /api/news/:id** - Update news article (teachers only, own articles)
   - Same fields as POST
   - Can remove or replace audio

5. **DELETE /api/news/:id** - Delete news article (teachers only, own articles)
   - Also deletes associated audio file

6. **POST /api/news/:id/like** - Like/unlike article
   - Toggles like status for current user

7. **GET /api/news/meta/categories** - Get all categories
   - Returns: Array of unique categories

### Frontend Components

#### 1. CreateNewsDialog
**Location:** `/frontend/src/components/CreateNewsDialog.tsx`

A comprehensive dialog for teachers to create news articles:
- Form fields for title, content, summary, category, language
- Tags input (comma-separated)
- Optional audio upload
- Source URL field
- Publish immediately toggle
- File size validation (20MB max for audio)

**Usage:**
```tsx
<CreateNewsDialog onSuccess={() => fetchNews()} />
```

#### 2. NewsCard
**Location:** `/frontend/src/components/NewsCard.tsx`

Displays a news article preview:
- Color-coded category badges
- Language indicators
- View and like counts
- Audio indicator
- Tags preview
- Source link button
- Responsive design

**Props:**
```typescript
interface NewsCardProps {
  news: {
    id: string;
    title: string;
    summary: string;
    category: string;
    language: string;
    authorName: string;
    publishedAt: Date;
    views: number;
    likes: number;
    audioUrl?: string;
    sourceUrl?: string;
    tags?: string[];
  };
  onClick: () => void;
}
```

#### 3. NewsDetailView
**Location:** `/frontend/src/components/NewsDetailView.tsx`

Full article view with rich features:
- **Audio Player** with controls:
  - Play/Pause
  - Seek bar
  - Volume control
  - Restart button
  - Time display
- Like button
- Share functionality
- Edit/Delete (for authors)
- Source link
- Tag display
- Author info and timestamp

**Props:**
```typescript
interface NewsDetailViewProps {
  newsId: string;
  onBack: () => void;
  onDelete?: () => void;
}
```

#### 4. TamilNews Page
**Location:** `/frontend/src/pages/TamilNews.tsx`

Main page with full functionality:
- List view with filters
- Detail view for reading
- External news sources sidebar
- Statistics display
- Responsive layout

## 🎨 Categories

Default categories:
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

Each category has a unique color scheme!

## 🌐 Languages

Supported languages:
- Tamil (தமிழ்)
- Sinhala (සිංහල)
- English

## 🔧 Setup & Testing

### 1. Backend Setup

The backend is already configured. Make sure:
- Firebase Storage is enabled
- The `news` route is registered in `/backend/src/index.ts`

### 2. Frontend Setup

Components are created. Just ensure:
- All imports are correct
- The TamilNews page is in your routes

### 3. Testing the Flow

#### As a Teacher:

1. **Login as teacher**
2. **Navigate to Tamil News**
3. **Click "Add News" button**
4. **Fill in the form:**
   - Title: "Sri Lankan Cultural Festival 2025"
   - Content: "The annual cultural festival will be held..."
   - Category: Culture
   - Language: Tamil
   - Tags: "festival, culture, sri lanka"
   - Upload an audio file (optional)
   - Toggle "Publish Immediately"
5. **Click "Create News"**
6. **View your article** in the list
7. **Click on the article** to see full view with audio player

#### As a Student:

1. **Login as student**
2. **Navigate to Tamil News**
3. **Browse articles** with filters
4. **Click on an article** to read
5. **Listen to audio** if available
6. **Like the article**
7. **Share the article**
8. **Check external news sources** in sidebar

## 🎧 Audio Player Features

The custom audio player includes:

### Controls
- ▶️ **Play/Pause** - Start or stop playback
- 🔁 **Restart** - Go back to beginning
- 🔊 **Volume** - Adjust sound level (0-100%)
- 🔇 **Mute/Unmute** - Toggle sound

### Display
- Current time / Total duration
- Seekable progress bar
- Visual feedback for playing state

### Supported Formats
- MP3
- WAV
- OGG
- AAC
- M4A

## 🔒 Permissions

### Teachers Can:
- ✅ Create news articles
- ✅ Edit their own articles
- ✅ Delete their own articles
- ✅ Upload audio files
- ✅ Publish/unpublish articles
- ✅ View all articles

### Students Can:
- ✅ View published articles
- ✅ Listen to audio
- ✅ Like articles
- ✅ Share articles
- ✅ Filter and search
- ❌ Cannot create/edit/delete

## 📊 Database Structure

### Firestore Collection: `news`

```javascript
{
  id: "auto-generated",
  title: "News title",
  content: "Full article content",
  summary: "Brief summary or auto-generated",
  category: "Category name",
  language: "Tamil/Sinhala/English",
  tags: ["tag1", "tag2"],
  sourceUrl: "https://example.com/source",
  audioUrl: "https://storage.googleapis.com/.../audio.mp3",
  audioFileName: "original_filename.mp3",
  authorId: "teacher_uid",
  authorName: "Teacher Name",
  published: true,
  publishedAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  views: 0,
  likes: 0,
  likedBy: ["uid1", "uid2"]
}
```

### Firebase Storage Structure

```
news/
  audio/
    {uuid}_{filename}.mp3
    {uuid}_{filename}.wav
```

## 🎯 Best Practices

### For Teachers

1. **Write Clear Titles** - Make them descriptive and engaging
2. **Add Summaries** - Help students preview content
3. **Use Audio** - Great for language learning!
4. **Tag Appropriately** - Makes articles easier to find
5. **Cite Sources** - Include original source URLs
6. **Choose Right Category** - Helps with organization

### For Content

1. **Keep It Relevant** - Focus on educational content
2. **Use Simple Language** - Remember students are learning
3. **Include Context** - Explain cultural references
4. **Regular Updates** - Post new content consistently

## 🚀 Advanced Features

### Audio Recording Tips
- Use clear pronunciation
- Record in quiet environment
- Keep volume consistent
- Use good quality microphone
- Save as MP3 for smaller file size

### SEO & Sharing
- Articles can be shared via Web Share API
- Fallback copies link to clipboard
- Great for social media sharing

## 🐛 Troubleshooting

### Audio Not Playing
- Check file format is supported
- Verify file size is under 20MB
- Ensure audio URL is accessible
- Check browser console for errors

### Upload Failing
- Verify Firebase Storage is configured
- Check file size limits
- Ensure proper authentication
- Verify network connection

### Categories Not Loading
- Check backend is running
- Verify API endpoint is accessible
- Check browser console for errors

## 📱 Responsive Design

The News feature is fully responsive:
- **Desktop** - 3-column layout with sidebar
- **Tablet** - 2-column layout
- **Mobile** - Single column, stacked layout

## 🌟 UI Highlights

- **Color-coded categories** for easy recognition
- **Language badges** with distinct colors
- **Audio indicator** shows which articles have audio
- **View/like counters** for engagement tracking
- **Smooth transitions** and hover effects
- **Loading states** for better UX
- **Empty states** with helpful messages

## 🎉 Success!

You now have a complete, beautiful News feature! Teachers can share news articles with audio, and students can read, listen, and engage with content to improve their Tamil language skills! 📰🎧

---

**Need Help?** Check the console logs for debugging information or review the component source code for implementation details.

