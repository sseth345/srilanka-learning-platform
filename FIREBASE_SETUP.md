# Firebase Authentication Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `srilankan-learning-platform`
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click "Email/Password" and enable both "Email/Password" and "Email link (passwordless sign-in)"
   - **Google**: Click "Google" and enable it, add your project support email

## 3. Configure Authentication Settings

1. In Authentication > Settings > Authorized domains
2. Add your domain (for development: `localhost`)
3. For production, add your actual domain

## 4. Get Firebase Configuration

1. Go to Project Settings (gear icon) > General tab
2. Scroll down to "Your apps" section
3. Click "Web" icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

## 5. Set Up Environment Variables

Create a `.env` file in the frontend directory with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## 6. Set Up Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## 7. Configure Firestore Security Rules

In Firestore > Rules tab, update the rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add more rules for your collections as needed
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 8. Set Up Storage (Optional)

1. Go to "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode"
4. Select a location for your storage bucket

## 9. Test Authentication

1. Start your development server: `npm run dev`
2. Navigate to `/auth`
3. Try registering a new account
4. Try signing in with Google
5. Check Firebase Console > Authentication to see registered users

## 10. Production Deployment

For production deployment:

1. Update Firestore rules for production security
2. Add your production domain to authorized domains
3. Configure Firebase Hosting (optional)
4. Set up proper environment variables in your hosting platform

## Features Implemented

✅ **Email/Password Authentication**
- User registration with role selection (student/teacher)
- User login with email and password
- Password reset functionality

✅ **Google OAuth Authentication**
- One-click Google sign-in
- Automatic user profile creation

✅ **User Profile Management**
- User profiles stored in Firestore
- Role-based access control
- Profile information display

✅ **Protected Routes**
- Authentication required for all main pages
- Role-based route protection
- Automatic redirect to login page

✅ **User Interface**
- Modern, responsive authentication forms
- Loading states and error handling
- User profile display in sidebar
- Logout functionality

## Next Steps

1. Set up your Firebase project using this guide
2. Add your Firebase configuration to `.env` file
3. Test the authentication flow
4. Customize user roles and permissions as needed
5. Add additional features like profile editing, user management, etc.
