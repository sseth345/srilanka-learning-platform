# Backend Setup Guide

## 1. Firebase Admin SDK Setup

### Get Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon) > Service Accounts tab
4. Click "Generate new private key"
5. Download the JSON file (keep it secure!)

### Environment Variables

Create a `.env` file in the backend directory with:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

## 2. Install Dependencies

```bash
cd backend
npm install
```

## 3. Build and Run

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 4. API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Firebase ID token
- `POST /api/auth/custom-token` - Create custom token
- `GET /api/auth/user/:uid` - Get user by UID
- `PATCH /api/auth/user/:uid/status` - Enable/disable user

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (teachers only)
- `PUT /api/users/:userId/role` - Update user role (teachers only)
- `DELETE /api/users/:userId` - Delete user (teachers only)

### Content
- `GET /api/content` - Get all content
- `GET /api/content/:id` - Get content by ID
- `POST /api/content` - Create content (teachers only)
- `PUT /api/content/:id` - Update content (teachers only)
- `DELETE /api/content/:id` - Delete content (teachers only)
- `PATCH /api/content/:id/publish` - Publish/unpublish content (teachers only)

## 5. Authentication Flow

### Frontend to Backend
1. User signs in with Firebase Auth (frontend)
2. Frontend gets Firebase ID token
3. Frontend sends requests with `Authorization: Bearer <token>` header
4. Backend verifies token using Firebase Admin SDK
5. Backend extracts user info and role from token/Firestore

### Example Request
```javascript
const token = await user.getIdToken();
const response = await fetch('/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 6. Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Request body validation
- **Role-based Access**: Teacher/Student permissions
- **Token Verification**: Firebase ID token validation

## 7. Database Structure

### Users Collection (`users`)
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  role: 'student' | 'teacher',
  createdAt: Date,
  lastLoginAt: Date,
  avatar?: string,
  bio?: string,
  preferences?: {
    language: string,
    notifications: boolean,
    theme: 'light' | 'dark'
  }
}
```

### Content Collection (`content`)
```javascript
{
  id: string,
  title: string,
  description: string,
  type: 'book' | 'video' | 'exercise' | 'news',
  content: string | object,
  createdBy: string, // User UID
  createdAt: Date,
  updatedAt: Date,
  published: boolean,
  tags: string[],
  metadata?: object
}
```

## 8. Error Handling

All API endpoints return consistent error responses:

```javascript
{
  error: string,
  message?: string // Only in development
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 9. Testing the API

### Using curl
```bash
# Verify token
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"your-firebase-id-token"}'

# Get user profile
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer your-firebase-id-token"
```

### Using Postman
1. Set base URL: `http://localhost:3001`
2. Add Authorization header: `Bearer <firebase-id-token>`
3. Test endpoints as needed

## 10. Production Deployment

1. Set `NODE_ENV=production`
2. Update `FRONTEND_URL` to production domain
3. Use environment variables for sensitive data
4. Set up proper logging and monitoring
5. Configure reverse proxy (nginx/Apache)
6. Set up SSL certificates
7. Configure firewall rules
8. Set up database backups
9. Monitor API performance and errors
10. Set up automated deployments
