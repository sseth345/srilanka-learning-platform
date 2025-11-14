# Book Upload Feature - Setup Guide

## Overview
This feature allows teachers to upload PDF books to Cloudinary (or, if Cloudinary credentials are skipped, the original Firebase Storage bucket) and students to view/download them. The system includes:

- **Backend**: Express API with multer for file uploads, Cloudinary integration (with seamless Firebase Storage fallback)
- **Frontend**: React components for uploading, viewing, and managing books
- **Database**: Firestore for book metadata
- **Storage**: Cloudinary for raw PDF assets (free tier) — easily swappable for Cloudflare R2 or other S3-compatible storage

## Backend Setup

### 1. Dependencies Installed
```bash
npm install multer @types/multer cloudinary
```

### 2. Cloudinary Configuration (Optional but recommended)
- Added `/backend/src/config/cloudinary.ts` to centralise Cloudinary credentials
- Reads `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` and optional `CLOUDINARY_BOOKS_FOLDER`
- If these are missing, the API automatically falls back to Firebase Storage so uploads still work

### 3. Books API Routes (`/backend/src/routes/books.ts`)

#### Endpoints:

**POST `/api/books/upload`** (Teachers only)
- Upload PDF file (max 50MB)
- If Cloudinary credentials are present: stream the file to Cloudinary (`resource_type: raw`)
- Otherwise: falls back to Firebase Storage upload
- Saves metadata to Firestore
- Returns the secure URL for the chosen storage backend

**GET `/api/books`**
- List all published books
- Supports filtering by category, subject, search
- Returns book metadata with stats

**GET `/api/books/:id`**
- Get single book details
- Increments view count

**PUT `/api/books/:id`** (Teachers only, own books)
- Update book metadata
- Cannot modify file, only metadata

**DELETE `/api/books/:id`** (Teachers only, own books)
- Deletes file from Cloudinary (falls back to Firebase Storage cleanup for legacy uploads)
- Removes metadata from Firestore

**POST `/api/books/:id/download`**
- Tracks download count
- Returns file URL

**GET `/api/books/meta/categories`**
- Returns all available categories

**GET `/api/books/meta/subjects`**
- Returns all available grade levels

### 4. Book Data Structure (Firestore)
```typescript
{
  title: string,
  description: string,
  category: string,           // e.g., "Mathematics", "Physics"
  subject: string,             // e.g., "Grade 10-11"
  fileName: string,            // Original filename
  fileSize: number,            // Size in bytes
  fileUrl: string,             // Public URL
  storagePath: string,         // Cloudinary public ID (or legacy Firebase path)
  storageProvider: 'cloudinary' | 'firebase',
  cloudinaryAssetId?: string,
  cloudinaryVersion?: number,
  uploadedBy: string,          // Teacher UID
  uploadedByEmail: string,
  uploadedByName: string,
  createdAt: Date,
  updatedAt: Date,
  published: boolean,
  downloads: number,
  views: number
}
```

## Frontend Setup

### 1. Components Created

#### BookUploadDialog (`/frontend/src/components/BookUploadDialog.tsx`)
- Modal dialog for teachers to upload books
- Drag-and-drop or click to upload PDF
- Form fields: title, description, category, grade level
- File size validation (50MB max)
- Upload progress indicator
- Auto-closes on success

#### Direct Downloads
- Library cards provide a single **Download PDF** button
- Clicking download triggers the backend to track the download and serves the Cloudinary file directly
- Browser saves the file using the original filename/extension (e.g., `.pdf`)

#### Library Page (`/frontend/src/pages/Library.tsx`)
- **For Teachers**:
  - Upload button
  - Download/delete own books
  - See upload statistics
  
- **For Students**:
  - Browse all published books
  - View and download books
  - Search functionality
  
- **Features**:
  - Search by title/description
  - Filter by category
  - Filter by grade level
  - Responsive grid layout
  - Book cards with metadata
  - Download statistics

### 2. UI Features
- Beautiful book cards with gradient backgrounds
- Real-time search and filtering
- Upload progress tracking
- Confirmation dialogs for delete actions
- Toast notifications for all actions
- Responsive design (mobile-friendly)
- Loading states and error handling

## Cloudinary Setup

1. Create a free Cloudinary account
2. Copy the Cloud Name, API Key, and API Secret from the dashboard
3. (Optional) Create a dedicated folder e.g. `books` for cleaner organisation
4. Add the credentials to your backend `.env`
5. Ensure the account has `raw` uploads enabled (default on free tier)

## Firestore Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Books collection
    match /books/{bookId} {
      // Teachers can create
      allow create: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
      
      // Everyone authenticated can read published books
      allow read: if request.auth != null && resource.data.published == true;
      
      // Teachers can read their own unpublished books
      allow read: if request.auth != null && 
                    request.auth.uid == resource.data.uploadedBy;
      
      // Teachers can update their own books
      allow update: if request.auth != null && 
                      request.auth.uid == resource.data.uploadedBy &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
      
      // Teachers can delete their own books
      allow delete: if request.auth != null && 
                      request.auth.uid == resource.data.uploadedBy &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
  }
}
```

## Environment Variables

Make sure your `.env` files are configured:

### Backend `.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
PORT=3001
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
# Optional: customise folder
CLOUDINARY_BOOKS_FOLDER=books
```

### Frontend `.env`:
```env
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Running the Application

### 1. Start Backend:
```bash
cd backend
npm run dev
```

### 2. Start Frontend:
```bash
cd frontend
npm run dev
```

## Usage

### For Teachers:
1. Login with teacher credentials
2. Navigate to Library page
3. Click "Upload Book" button
4. Select PDF file (max 50MB)
5. Fill in book details:
   - Title (required)
   - Description (optional)
   - Category (optional)
   - Grade Level (optional)
6. Click "Upload"
7. View/manage uploaded books
8. Delete books if needed

### For Students:
1. Login with student credentials
2. Navigate to Library page
3. Browse available books
4. Use search/filters to find books
5. Click "View" to read in browser
6. Click download icon to download PDF
7. Open in full-screen for better reading

## Features Implemented

### ✅ Backend:
- [x] Multer integration for file uploads
- [x] Cloudinary integration for raw PDF assets
- [x] Books API with CRUD operations
- [x] File upload with validation
- [x] Download tracking
- [x] View count tracking
- [x] Category and subject filtering
- [x] Search functionality
- [x] Role-based access control

### ✅ Frontend:
- [x] Book upload dialog with form validation
- [x] PDF viewer component
- [x] Library page with grid layout
- [x] Search and filter functionality
- [x] Download tracking
- [x] Delete confirmation
- [x] Responsive design
- [x] Loading states
- [x] Error handling
- [x] Toast notifications

## Next Steps

To further enhance the system, consider:

1. **Pagination**: Add pagination for large book collections
2. **Favorites**: Allow students to bookmark favorite books
3. **Comments**: Add commenting/rating system
4. **Collections**: Group books into collections/courses
5. **Progress Tracking**: Track reading progress per student
6. **Thumbnails**: Generate PDF thumbnails for book covers
7. **Advanced Search**: Full-text search with Algolia
8. **Notifications**: Notify students of new book uploads
9. **Bulk Upload**: Allow teachers to upload multiple books at once
10. **Analytics Dashboard**: Show teacher statistics on book usage

## Troubleshooting

### File Upload Issues:
- Verify Cloudinary credentials are correct (`cloud_name`, `api_key`, `api_secret`) if you intend to use Cloudinary
- Confirm the account allows `raw` uploads
- Check Cloudinary dashboard for usage limits or quota errors
- Check file size limits (50MB max)

### Permission Errors:
- Verify user role in Firestore
- Ensure authentication token is valid

### PDF Not Displaying:
- Check Cloudinary URL is publicly accessible (should be the `secure_url`)
- Verify browser supports PDF viewing
- Try opening in new tab (full-screen mode)
- Check browser console for CORS errors

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs for API errors
3. Verify Firebase rules are correctly set
4. Ensure all environment variables are configured

