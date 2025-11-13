"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const firebase_1 = require("../config/firebase");
const router = express_1.default.Router();
// Get all content
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { role } = req.user;
        const { type, limit = 20, offset = 0 } = req.query;
        let query = firebase_1.db.collection('content');
        // Filter by type if specified
        if (type) {
            query = query.where('type', '==', type);
        }
        // Students can only see published content
        if (role === 'student') {
            query = query.where('published', '==', true);
        }
        const snapshot = await query
            .orderBy('createdAt', 'desc')
            .limit(Number(limit))
            .offset(Number(offset))
            .get();
        const content = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(content);
    }
    catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});
// Get content by ID
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;
        const doc = await firebase_1.db.collection('content').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Content not found' });
        }
        const content = doc.data();
        // Students can only access published content
        if (role === 'student' && !content.published) {
            return res.status(403).json({ error: 'Access denied. Content not published.' });
        }
        res.json({
            id: doc.id,
            ...content
        });
    }
    catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});
// Create new content (teachers only)
router.post('/', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const { uid } = req.user;
        const contentData = {
            ...req.body,
            createdBy: uid,
            createdAt: new Date(),
            updatedAt: new Date(),
            published: false // Default to unpublished
        };
        const docRef = await firebase_1.db.collection('content').add(contentData);
        res.status(201).json({
            id: docRef.id,
            message: 'Content created successfully'
        });
    }
    catch (error) {
        console.error('Error creating content:', error);
        res.status(500).json({ error: 'Failed to create content' });
    }
});
// Update content (teachers only)
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const doc = await firebase_1.db.collection('content').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Content not found' });
        }
        const content = doc.data();
        // Check if user is the creator
        if (content.createdBy !== uid) {
            return res.status(403).json({ error: 'Access denied. You can only edit your own content.' });
        }
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };
        await firebase_1.db.collection('content').doc(id).update(updateData);
        res.json({ message: 'Content updated successfully' });
    }
    catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ error: 'Failed to update content' });
    }
});
// Delete content (teachers only)
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const doc = await firebase_1.db.collection('content').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Content not found' });
        }
        const content = doc.data();
        // Check if user is the creator
        if (content.createdBy !== uid) {
            return res.status(403).json({ error: 'Access denied. You can only delete your own content.' });
        }
        await firebase_1.db.collection('content').doc(id).delete();
        res.json({ message: 'Content deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ error: 'Failed to delete content' });
    }
});
// Publish/Unpublish content (teachers only)
router.patch('/:id/publish', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const { published } = req.body;
        const doc = await firebase_1.db.collection('content').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Content not found' });
        }
        const content = doc.data();
        // Check if user is the creator
        if (content.createdBy !== uid) {
            return res.status(403).json({ error: 'Access denied. You can only publish your own content.' });
        }
        await firebase_1.db.collection('content').doc(id).update({
            published: Boolean(published),
            updatedAt: new Date()
        });
        res.json({
            message: `Content ${published ? 'published' : 'unpublished'} successfully`
        });
    }
    catch (error) {
        console.error('Error updating content status:', error);
        res.status(500).json({ error: 'Failed to update content status' });
    }
});
exports.default = router;
//# sourceMappingURL=content.js.map