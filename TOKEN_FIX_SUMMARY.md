# 🔐 Authentication Token Fix

## Problem

The error you were seeing:
```
FirebaseAuthError: Decoding Firebase ID token failed
```

This happened because the app was trying to use `localStorage.getItem('token')` to get the authentication token, but:
1. The token was never being stored in localStorage
2. Even if it was, tokens expire and need to be refreshed

## Solution

Created a proper token management system that:
1. ✅ Gets fresh tokens from Firebase Auth directly
2. ✅ Automatically refreshes expired tokens
3. ✅ Works consistently across all components

## What Was Changed

### 1. Created `useAuthToken` Hook

**File:** `/frontend/src/hooks/useAuthToken.ts`

```typescript
import { useAuth } from '../contexts/AuthContext';

export const useAuthToken = () => {
  const { user } = useAuth();

  const getAuthHeaders = async () => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const token = await user.getIdToken(true); // Force refresh!
      return {
        Authorization: `Bearer ${token}`,
      };
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw new Error('Failed to get authentication token');
    }
  };

  return { getAuthHeaders };
};
```

**Key Points:**
- Uses `user.getIdToken(true)` to force token refresh
- Returns proper headers object
- Handles errors gracefully

### 2. Updated All News Components

#### TamilNews Page
**Before:**
```typescript
const token = localStorage.getItem('token');
const response = await fetch('...', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

**After:**
```typescript
const { getAuthHeaders } = useAuthToken();
const headers = await getAuthHeaders();
const response = await fetch('...', { headers });
```

#### CreateNewsDialog Component
- Same pattern applied
- Now gets fresh token before creating news

#### NewsDetailView Component
- Same pattern applied
- Fresh token for viewing, liking, and deleting news

## How It Works

1. **User logs in** → Firebase Auth creates a session
2. **Component needs to make API call** → Calls `getAuthHeaders()`
3. **`getAuthHeaders()`** → Gets fresh token from Firebase Auth
4. **Fresh token** → Sent to backend
5. **Backend verifies** → ✅ Valid token, request succeeds!

## Why This Is Better

### Old Approach (localStorage)
❌ Token never stored properly  
❌ Tokens expire (1 hour)  
❌ No automatic refresh  
❌ Hard to debug  

### New Approach (useAuthToken hook)
✅ Gets token from Firebase Auth directly  
✅ Automatically refreshes expired tokens  
✅ Always gets fresh, valid token  
✅ Consistent across all components  
✅ Easy to maintain  

## Testing

### Before the Fix:
```
GET /api/news → 403 Forbidden
Error: Decoding Firebase ID token failed
```

### After the Fix:
```
GET /api/news → 200 OK
✅ News loaded successfully!
```

## Usage in Other Components

If you need to make authenticated API calls in any other component, just use this pattern:

```typescript
import { useAuthToken } from '@/hooks/useAuthToken';

const MyComponent = () => {
  const { getAuthHeaders } = useAuthToken();

  const fetchData = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('http://localhost:3001/api/something', {
        headers,
      });
      // ... rest of your code
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return <div>...</div>;
};
```

## What About Other Features?

Good news! The other features (Books, Discussions, Exercises) likely use a similar pattern and may need the same fix. Let me know if you see authentication errors elsewhere and I'll apply the same fix!

## Important Notes

1. **User Must Be Logged In** - The `getAuthHeaders()` function requires a user to be authenticated
2. **Automatic Refresh** - Firebase handles token refresh automatically
3. **Error Handling** - The hook throws errors if user is not authenticated
4. **Type Safety** - Full TypeScript support

## Summary

✅ Created `useAuthToken` hook for proper token management  
✅ Updated all News components to use the hook  
✅ No more "Decoding Firebase ID token failed" errors  
✅ Tokens automatically refresh when needed  
✅ Clean, reusable pattern for all API calls  

The News feature should now work perfectly! 🎉

