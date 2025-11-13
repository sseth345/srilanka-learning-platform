# Book Upload Feature - Setup Guide

## Overview
This feature allows teachers to upload PDF books to Firebase Storage and students to view/download them. The system includes:

- **Backend**: Express API with multer for file uploads, Firebase Storage integration
- **Frontend**: React components for uploading, viewing, and managing books
- **Database**: Firestore for book metadata
- **Storage**: Firebase Storage for PDF files

## Backend Setup

### 1. Dependencies Installed
```bash
npm install multer @types/multer uuid @types/uuid
```

### 2. Firebase Configuration
Updated `/backend/src/config/firebase.ts` to include Firebase Storage:
- Added `storageBucket` to Firebase initialization
- Exported `bucket` for file operations

### 3. Books API Routes (`/backend/src/routes/books.ts`)

#### Endpoints:

**POST `/api/books/upload`** (Teachers only)
- Upload PDF file (max 50MB)
- Stores file in Firebase Storage
- Saves metadata to Firestore
- Makes file publicly accessible

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
- Deletes file from Storage
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
  storagePath: string,         // Firebase Storage path
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

#### BookViewer (`/frontend/src/components/BookViewer.tsx`)
- PDF viewer in modal dialog
- Embedded iframe for viewing PDFs
- Download button with tracking
- Full-screen mode option
- Tracks view count automatically

#### Library Page (`/frontend/src/pages/Library.tsx`)
- **For Teachers**:
  - Upload button
  - View/download/delete own books
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
  - Download/view statistics

### 2. UI Features
- Beautiful book cards with gradient backgrounds
- Real-time search and filtering
- Upload progress tracking
- Confirmation dialogs for delete actions
- Toast notifications for all actions
- Responsive design (mobile-friendly)
- Loading states and error handling

## Firebase Storage Rules

Add these rules to your Firebase Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Books folder
    match /books/{bookId} {
      // Teachers can upload
      allow create: if request.auth != null && 
                      request.resource.contentType == 'application/pdf' &&
                      request.resource.size <= 50 * 1024 * 1024; // 50MB
      
      // Anyone authenticated can read
      allow read: if request.auth != null;
      
      // Only uploader can delete
      allow delete: if request.auth != null && 
                      resource.metadata.uploadedBy == request.auth.uid;
    }
  }
}
```

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
- [x] Firebase Storage integration
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
- Ensure Firebase Storage is enabled in Firebase Console
- Check storage bucket name matches in config
- Verify CORS settings in Firebase Storage
- Check file size limits (50MB max)

### Permission Errors:
- Verify user role in Firestore
- Check Firebase Storage rules
- Ensure authentication token is valid

### PDF Not Displaying:
- Check file URL is publicly accessible
- Verify browser supports PDF viewing
- Try opening in new tab (full-screen mode)
- Check browser console for CORS errors

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs for API errors
3. Verify Firebase rules are correctly set
4. Ensure all environment variables are configured

