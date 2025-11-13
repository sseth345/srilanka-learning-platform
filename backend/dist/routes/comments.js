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
// Get all comments for a discussion
router.get('/discussion/:discussionId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { discussionId } = req.params;
        const { sort = 'oldest' } = req.query;
        // Fetch comments without orderBy to avoid index requirement
        const query = firebase_1.db.collection('comments')
            .where('discussionId', '==', discussionId);
        const snapshot = await query.get();
        let comments = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
        }));
        // Sort in memory
        if (sort === 'oldest') {
            comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        }
        else if (sort === 'newest') {
            comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        else if (sort === 'popular') {
            comments.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
        }
        // Build comment tree (organize replies)
        const commentMap = new Map();
        const rootComments = [];
        // First pass: create comment objects
        comments.forEach((comment) => {
            commentMap.set(comment.id, { ...comment, replies: [] });
        });
        // Second pass: organize into tree
        comments.forEach((comment) => {
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId);
                if (parent) {
                    parent.replies.push(commentMap.get(comment.id));
                }
            }
            else {
                rootComments.push(commentMap.get(comment.id));
            }
        });
        res.json(rootComments);
    }
    catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});
// Get a specific comment
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await firebase_1.db.collection('comments').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        const commentData = doc.data();
        res.json({
            id: doc.id,
            ...commentData,
            createdAt: commentData.createdAt?.toDate(),
            updatedAt: commentData.updatedAt?.toDate(),
        });
    }
    catch (error) {
        console.error('Error fetching comment:', error);
        res.status(500).json({ error: 'Failed to fetch comment' });
    }
});
// Create a new comment
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const { discussionId, content, parentId } = req.body;
        if (!discussionId || !content) {
            return res.status(400).json({ error: 'Discussion ID and content are required' });
        }
        // Check if discussion exists and is not locked
        const discussionDoc = await firebase_1.db.collection('discussions').doc(discussionId).get();
        if (!discussionDoc.exists) {
            return res.status(404).json({ error: 'Discussion not found' });
        }
        const discussionData = discussionDoc.data();
        if (discussionData.isLocked) {
            return res.status(403).json({ error: 'This discussion is locked' });
        }
        // Get user profile for name and avatar
        const userDoc = await firebase_1.db.collection('users').doc(uid).get();
        const userData = userDoc.data();
        const commentData = {
            discussionId,
            content,
            parentId: parentId || null,
            authorId: uid,
            authorName: userData?.displayName || 'Anonymous',
            authorAvatar: userData?.avatar || '',
            authorRole: userData?.role || 'student',
            createdAt: new Date(),
            updatedAt: new Date(),
            likesCount: 0,
            likedBy: [],
            isEdited: false,
        };
        const docRef = await firebase_1.db.collection('comments').add(commentData);
        // Update discussion comment count and last activity
        await firebase_1.db.collection('discussions').doc(discussionId).update({
            commentsCount: firestore_1.FieldValue.increment(1),
            lastActivityAt: new Date(),
        });
        // If this is a reply, update parent comment reply count
        if (parentId) {
            const parentDoc = await firebase_1.db.collection('comments').doc(parentId).get();
            if (parentDoc.exists) {
                await firebase_1.db.collection('comments').doc(parentId).update({
                    repliesCount: firestore_1.FieldValue.increment(1),
                });
            }
        }
        res.status(201).json({
            id: docRef.id,
            message: 'Comment created successfully',
        });
    }
    catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});
// Update a comment
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const doc = await firebase_1.db.collection('comments').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        const commentData = doc.data();
        // Check if user is the author
        if (commentData.authorId !== uid) {
            return res.status(403).json({ error: 'Access denied. You can only edit your own comments.' });
        }
        await firebase_1.db.collection('comments').doc(id).update({
            content,
            updatedAt: new Date(),
            isEdited: true,
        });
        res.json({ message: 'Comment updated successfully' });
    }
    catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
});
// Delete a comment
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { uid, role } = req.user;
        const doc = await firebase_1.db.collection('comments').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        const commentData = doc.data();
        // Check if user is the author or a teacher
        if (commentData.authorId !== uid && role !== 'teacher') {
            return res.status(403).json({ error: 'Access denied. You can only delete your own comments.' });
        }
        // Delete all replies to this comment
        const repliesSnapshot = await firebase_1.db.collection('comments')
            .where('parentId', '==', id)
            .get();
        const batch = firebase_1.db.batch();
        repliesSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        // Update discussion comment count
        const totalDeleted = repliesSnapshot.size + 1; // replies + the comment itself
        await firebase_1.db.collection('discussions').doc(commentData.discussionId).update({
            commentsCount: firestore_1.FieldValue.increment(-totalDeleted),
        });
        // Delete the comment
        await firebase_1.db.collection('comments').doc(id).delete();
        res.json({ message: 'Comment deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});
// Like/Unlike a comment
router.post('/:id/like', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const doc = await firebase_1.db.collection('comments').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        const commentData = doc.data();
        const likedBy = commentData.likedBy || [];
        const hasLiked = likedBy.includes(uid);
        if (hasLiked) {
            // Unlike
            await firebase_1.db.collection('comments').doc(id).update({
                likedBy: firestore_1.FieldValue.arrayRemove(uid),
                likesCount: firestore_1.FieldValue.increment(-1),
            });
            res.json({ message: 'Comment unliked', liked: false });
        }
        else {
            // Like
            await firebase_1.db.collection('comments').doc(id).update({
                likedBy: firestore_1.FieldValue.arrayUnion(uid),
                likesCount: firestore_1.FieldValue.increment(1),
            });
            res.json({ message: 'Comment liked', liked: true });
        }
    }
    catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({ error: 'Failed to like comment' });
    }
});
// Get comment count for a discussion
router.get('/discussion/:discussionId/count', auth_1.authenticateToken, async (req, res) => {
    try {
        const { discussionId } = req.params;
        const snapshot = await firebase_1.db.collection('comments')
            .where('discussionId', '==', discussionId)
            .get();
        res.json({ count: snapshot.size });
    }
    catch (error) {
        console.error('Error fetching comment count:', error);
        res.status(500).json({ error: 'Failed to fetch comment count' });
    }
});
exports.default = router;
//# sourceMappingURL=comments.js.map