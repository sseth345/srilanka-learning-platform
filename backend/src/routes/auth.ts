import express from 'express';
import { auth } from '../config/firebase';

const router = express.Router();

// Verify token endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    
    res.json({
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      valid: false,
      error: 'Invalid or expired token' 
    });
  }
});

// Create custom token (for testing purposes)
router.post('/custom-token', async (req, res) => {
  try {
    const { uid, additionalClaims } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }

    const customToken = await auth.createCustomToken(uid, additionalClaims);
    
    res.json({ customToken });
  } catch (error) {
    console.error('Custom token creation error:', error);
    res.status(500).json({ error: 'Failed to create custom token' });
  }
});

// Get user by UID
router.get('/user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const userRecord = await auth.getUser(uid);
    
    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Disable/Enable user
router.patch('/user/:uid/status', async (req, res) => {
  try {
    const { uid } = req.params;
    const { disabled } = req.body;

    if (typeof disabled !== 'boolean') {
      return res.status(400).json({ error: 'Disabled status must be a boolean' });
    }

    await auth.updateUser(uid, { disabled });
    
    res.json({ 
      message: `User ${disabled ? 'disabled' : 'enabled'} successfully` 
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

export default router;
