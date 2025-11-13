"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const firebase_1 = require("../config/firebase");
const auth_1 = require("../middleware/auth");
const firebase_2 = require("../config/firebase");
const router = express_1.default.Router();
// Get user profile
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const userRecord = await firebase_1.auth.getUser(uid);
        const userDoc = await firebase_2.db.collection('users').doc(uid).get();
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
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});
// Update user profile
router.put('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const { displayName, preferences } = req.body;
        const updates = {};
        if (displayName) {
            await firebase_1.auth.updateUser(uid, { displayName });
            updates.displayName = displayName;
        }
        if (preferences) {
            updates.preferences = preferences;
        }
        if (Object.keys(updates).length > 0) {
            await firebase_2.db.collection('users').doc(uid).update(updates);
        }
        res.json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});
// Get all users (admin only)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'teacher') {
            return res.status(403).json({ error: 'Access denied. Teacher role required.' });
        }
        const usersSnapshot = await firebase_2.db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// Update user role (admin only)
router.put('/:userId/role', auth_1.authenticateToken, async (req, res) => {
    try {
        const { role: currentUserRole } = req.user;
        const { userId } = req.params;
        const { role: newRole } = req.body;
        if (currentUserRole !== 'teacher') {
            return res.status(403).json({ error: 'Access denied. Teacher role required.' });
        }
        if (!['student', 'teacher'].includes(newRole)) {
            return res.status(400).json({ error: 'Invalid role. Must be student or teacher.' });
        }
        await firebase_2.db.collection('users').doc(userId).update({ role: newRole });
        res.json({ message: 'User role updated successfully' });
    }
    catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});
// Delete user (admin only)
router.delete('/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { role: currentUserRole, uid: currentUserId } = req.user;
        const { userId } = req.params;
        if (currentUserRole !== 'teacher') {
            return res.status(403).json({ error: 'Access denied. Teacher role required.' });
        }
        if (currentUserId === userId) {
            return res.status(400).json({ error: 'Cannot delete your own account.' });
        }
        // Delete user from Firebase Auth
        await firebase_1.auth.deleteUser(userId);
        // Delete user document from Firestore
        await firebase_2.db.collection('users').doc(userId).delete();
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map