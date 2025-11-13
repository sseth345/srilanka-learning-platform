import express from 'express';
import { auth } from '../config/firebase';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../config/firebase';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { uid } = req.user!;
    
    const userRecord = await auth.getUser(uid);
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      emailVerified: userRecord.emailVerified,
      role: userData?.role || 'student',
      createdAt: userData?.createdAt,
      lastLoginAt: userData?.lastLoginAt,
      preferences: userData?.preferences
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { uid } = req.user!;
    const { displayName, preferences } = req.body;

    const updates: any = {};
    
    if (displayName) {
      await auth.updateUser(uid, { displayName });
      updates.displayName = displayName;
    }
    
    if (preferences) {
      updates.preferences = preferences;
    }

    if (Object.keys(updates).length > 0) {
      await db.collection('users').doc(uid).update(updates);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { role } = req.user!;
    
    if (role !== 'teacher') {
      return res.status(403).json({ error: 'Access denied. Teacher role required.' });
    }

    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (admin only)
router.put('/:userId/role', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { role: currentUserRole } = req.user!;
    const { userId } = req.params;
    const { role: newRole } = req.body;

    if (currentUserRole !== 'teacher') {
      return res.status(403).json({ error: 'Access denied. Teacher role required.' });
    }

    if (!['student', 'teacher'].includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role. Must be student or teacher.' });
    }

    await db.collection('users').doc(userId).update({ role: newRole });

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user (admin only)
router.delete('/:userId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { role: currentUserRole, uid: currentUserId } = req.user!;
    const { userId } = req.params;

    if (currentUserRole !== 'teacher') {
      return res.status(403).json({ error: 'Access denied. Teacher role required.' });
    }

    if (currentUserId === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account.' });
    }

    // Delete user from Firebase Auth
    await auth.deleteUser(userId);
    
    // Delete user document from Firestore
    await db.collection('users').doc(userId).delete();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;

