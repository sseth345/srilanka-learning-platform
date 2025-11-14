# Video Lecture Upload – Setup Guide

## Overview
Teachers can upload lecture videos that stream to students through Cloudinary. The implementation consists of:

- **Backend**: Express API (`/api/videos`) with Multer + Cloudinary video uploads, Firestore metadata
- **Frontend**: Video library page with teacher upload dialog, student playback modal, deletion controls
- **Storage**: Cloudinary (resource type `video`, access mode `public`)

## Backend

### Dependencies
Already installed within `backend/`:
```bash
npm install cloudinary multer @types/multer
```

### Environment Variables (`backend/.env`)
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
# Optional: customise folders
CLOUDINARY_BOOKS_FOLDER=books
CLOUDINARY_VIDEOS_FOLDER=videos
```

Ensure the Cloudinary account has the **Video** and **Raw** upload features enabled (default on free tier).

### API Routes (`backend/src/routes/videos.ts`)

| Endpoint | Method | Description | Auth |
| --- | --- | --- | --- |
| `/api/videos/upload` | POST | Upload video (MP4/MOV/MKV/AVI/WEBM, ≤ 500 MB). Saves to Cloudinary + Firestore. | Teacher |
| `/api/videos` | GET | List videos (search & category filter). Returns signed streaming URL + thumbnail. | Authenticated |
| `/api/videos/:id` | GET | Fetch metadata and increment view count once. | Authenticated |
| `/api/videos/:id` | PUT | Update title/description/category. | Teacher (uploader) |
| `/api/videos/:id` | DELETE | Delete video + Cloudinary asset. | Teacher (uploader) |
| `/api/videos/:id/view` | POST | Increment views and return fresh streaming URL. | Authenticated |

### Firestore Document Structure (`videos` collection)
```ts
{
  title: string;
  description: string;
  category: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storagePath: string;          // Cloudinary public_id
  storageProvider: 'cloudinary';
  streamingUrl: string;
  thumbnailUrl: string;
  duration: number;             // seconds
  bitrate: number;
  width: number;
  height: number;
  uploadedBy: string;
  uploadedByEmail: string;
  uploadedByName: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
  cloudinaryAssetId: string;
  cloudinaryVersion: number;
}
```

## Frontend

### Components
- `VideoUploadDialog`: Teacher-only upload, validation (extensions, 500 MB), progress state
- `VideoPlayerDialog`: Streams via HTML5 `<video>` from Cloudinary signed URL
- `Videos` page: Replaces mock data with live API, search/filter, role-based actions

### Usage Flow
1. **Teacher** clicks *Upload Video* → selects file → submits form
2. Backend stores in Cloudinary & Firestore; UI refreshes grid automatically
3. **Student/Teacher** clicks *Watch* → backend logs view + returns signed streaming URL
4. Playback modal shows inline player; views counter updates after closing
5. **Teacher** can delete own videos (removes Cloudinary asset & metadata)

### File Requirements
- Formats: `.mp4`, `.mov`, `.mkv`, `.avi`, `.webm`
- Maximum size: **500 MB**
- Large uploads stream to Cloudinary in 6 MB chunks; ensure API host has adequate memory

## Testing Checklist
1. Set Cloudinary env vars; restart backend (`npm run dev`)
2. Teacher login:
   - Upload a sample MP4
   - Confirm success toast + video appears in list
3. Student login:
   - Open video, confirm streaming works
   - Refresh list to ensure view count increases
4. Teacher:
   - Delete video; verify it disappears and Cloudinary asset removed

## Troubleshooting
- **Large file fails immediately**: check API memory/timeout limits; ensure Cloudinary plan allows video uploads
- **401 streaming error**: confirm Cloudinary credentials; the backend now generates signed URLs on every request
- **Unsupported format**: restrict to allowed extensions/MIME types
- **Upload stuck**: verify network bandwidth; Cloudinary free tier slower for large files


