"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const firebase_1 = require("../config/firebase");
const firestore_1 = require("firebase-admin/firestore");
const router = express_1.default.Router();
// Get all discussions
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { category, sort = 'recent', limit = 20, offset = 0, search } = req.query;
        let query = firebase_1.db.collection('discussions');
        // Filter by category if specified
        if (category && category !== 'all') {
            query = query.where('category', '==', category);
        }
        // Apply sorting
        if (sort === 'recent') {
            query = query.orderBy('createdAt', 'desc');
        }
        else if (sort === 'popular') {
            query = query.orderBy('likesCount', 'desc');
        }
        else if (sort === 'active') {
            query = query.orderBy('lastActivityAt', 'desc');
        }
        const snapshot = await query
            .limit(Number(limit))
            .offset(Number(offset))
            .get();
        let discussions = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
            lastActivityAt: doc.data().lastActivityAt?.toDate(),
        }));
        // Client-side search filter if search term is provided
        if (search) {
            const searchTerm = search.toLowerCase();
            discussions = discussions.filter((discussion) => discussion.title.toLowerCase().includes(searchTerm) ||
                discussion.content.toLowerCase().includes(searchTerm) ||
                discussion.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)));
        }
        res.json(discussions);
    }
    catch (error) {
        console.error('Error fetching discussions:', error);
        res.status(500).json({ error: 'Failed to fetch discussions' });
    }
});
// Get a specific discussion
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await firebase_1.db.collection('discussions').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Discussion not found' });
        }
        const discussionData = doc.data();
        // Increment view count
        await firebase_1.db.collection('discussions').doc(id).update({
            views: firestore_1.FieldValue.increment(1),
        });
        res.json({
            id: doc.id,
            ...discussionData,
            createdAt: discussionData.createdAt?.toDate(),
            updatedAt: discussionData.updatedAt?.toDate(),
            lastActivityAt: discussionData.lastActivityAt?.toDate(),
        });
    }
    catch (error) {
        console.error('Error fetching discussion:', error);
        res.status(500).json({ error: 'Failed to fetch discussion' });
    }
});
// Create a new discussion
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const { title, content, category, tags } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        // Get user profile for name and avatar
        const userDoc = await firebase_1.db.collection('users').doc(uid).get();
        const userData = userDoc.data();
        const discussionData = {
            title,
            content,
            category: category || 'General',
            tags: tags || [],
            authorId: uid,
            authorName: userData?.displayName || 'Anonymous',
            authorAvatar: userData?.avatar || '',
            authorRole: userData?.role || 'student',
            createdAt: new Date(),
            updatedAt: new Date(),
            lastActivityAt: new Date(),
            views: 0,
            likesCount: 0,
            commentsCount: 0,
            isPinned: false,
            isLocked: false,
            likedBy: [],
        };
        const docRef = await firebase_1.db.collection('discussions').add(discussionData);
        res.status(201).json({
            id: docRef.id,
            message: 'Discussion created successfully',
        });
    }
    catch (error) {
        console.error('Error creating discussion:', error);
        res.status(500).json({ error: 'Failed to create discussion' });
    }
});
// Update a discussion
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const { title, content, category, tags } = req.body;
        const doc = await firebase_1.db.collection('discussions').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Discussion not found' });
        }
        const discussionData = doc.data();
        // Check if user is the author
        if (discussionData.authorId !== uid) {
            return res.status(403).json({ error: 'Access denied. You can only edit your own discussions.' });
        }
        const updateData = {
            updatedAt: new Date(),
        };
        if (title)
            updateData.title = title;
        if (content)
            updateData.content = content;
        if (category)
            updateData.category = category;
        if (tags)
            updateData.tags = tags;
        await firebase_1.db.collection('discussions').doc(id).update(updateData);
        res.json({ message: 'Discussion updated successfully' });
    }
    catch (error) {
        console.error('Error updating discussion:', error);
        res.status(500).json({ error: 'Failed to update discussion' });
    }
});
// Delete a discussion
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { uid, role } = req.user;
        const doc = await firebase_1.db.collection('discussions').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Discussion not found' });
        }
        const discussionData = doc.data();
        // Check if user is the author or a teacher
        if (discussionData.authorId !== uid && role !== 'teacher') {
            return res.status(403).json({ error: 'Access denied. You can only delete your own discussions.' });
        }
        // Delete all comments associated with this discussion
        const commentsSnapshot = await firebase_1.db.collection('comments')
            .where('discussionId', '==', id)
            .get();
        const batch = firebase_1.db.batch();
        commentsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        // Delete the discussion
        await firebase_1.db.collection('discussions').doc(id).delete();
        res.json({ message: 'Discussion deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting discussion:', error);
        res.status(500).json({ error: 'Failed to delete discussion' });
    }
});
// Like/Unlike a discussion
router.post('/:id/like', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const doc = await firebase_1.db.collection('discussions').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Discussion not found' });
        }
        const discussionData = doc.data();
        const likedBy = discussionData.likedBy || [];
        const hasLiked = likedBy.includes(uid);
        if (hasLiked) {
            // Unlike
            await firebase_1.db.collection('discussions').doc(id).update({
                likedBy: firestore_1.FieldValue.arrayRemove(uid),
                likesCount: firestore_1.FieldValue.increment(-1),
            });
            res.json({ message: 'Discussion unliked', liked: false });
        }
        else {
            // Like
            await firebase_1.db.collection('discussions').doc(id).update({
                likedBy: firestore_1.FieldValue.arrayUnion(uid),
                likesCount: firestore_1.FieldValue.increment(1),
            });
            res.json({ message: 'Discussion liked', liked: true });
        }
    }
    catch (error) {
        console.error('Error liking discussion:', error);
        res.status(500).json({ error: 'Failed to like discussion' });
    }
});
// Pin/Unpin a discussion (teachers only)
router.patch('/:id/pin', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { pinned } = req.body;
        const doc = await firebase_1.db.collection('discussions').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Discussion not found' });
        }
        await firebase_1.db.collection('discussions').doc(id).update({
            isPinned: Boolean(pinned),
            updatedAt: new Date(),
        });
        res.json({
            message: `Discussion ${pinned ? 'pinned' : 'unpinned'} successfully`
        });
    }
    catch (error) {
        console.error('Error pinning discussion:', error);
        res.status(500).json({ error: 'Failed to pin discussion' });
    }
});
// Lock/Unlock a discussion (teachers only)
router.patch('/:id/lock', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { locked } = req.body;
        const doc = await firebase_1.db.collection('discussions').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Discussion not found' });
        }
        await firebase_1.db.collection('discussions').doc(id).update({
            isLocked: Boolean(locked),
            updatedAt: new Date(),
        });
        res.json({
            message: `Discussion ${locked ? 'locked' : 'unlocked'} successfully`
        });
    }
    catch (error) {
        console.error('Error locking discussion:', error);
        res.status(500).json({ error: 'Failed to lock discussion' });
    }
});
// Get discussion categories
router.get('/meta/categories', auth_1.authenticateToken, async (req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('discussions').get();
        const categories = new Set();
        snapshot.docs.forEach((doc) => {
            const category = doc.data().category;
            if (category)
                categories.add(category);
        });
        res.json(Array.from(categories).sort());
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
// Get discussion tags
router.get('/meta/tags', auth_1.authenticateToken, async (req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('discussions').get();
        const tags = new Set();
        snapshot.docs.forEach((doc) => {
            const discussionTags = doc.data().tags || [];
            discussionTags.forEach((tag) => tags.add(tag));
        });
        res.json(Array.from(tags).sort());
    }
    catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});
exports.default = router;
//# sourceMappingURL=discussions.js.map