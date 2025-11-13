import express from 'express';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../config/firebase';
import { Query, DocumentData } from 'firebase-admin/firestore';

const router = express.Router();

// Get all content
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { role } = req.user!;
    const { type, limit = 20, offset = 0 } = req.query;

    let query: Query<DocumentData> = db.collection('content');
    
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
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get content by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user!;

    const doc = await db.collection('content').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const content = doc.data()!;
    
    // Students can only access published content
    if (role === 'student' && !content.published) {
      return res.status(403).json({ error: 'Access denied. Content not published.' });
    }

    res.json({
      id: doc.id,
      ...content
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Create new content (teachers only)
router.post('/', authenticateToken, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
  try {
    const { uid } = req.user!;
    const contentData = {
      ...req.body,
      createdBy: uid,
      createdAt: new Date(),
      updatedAt: new Date(),
      published: false // Default to unpublished
    };

    const docRef = await db.collection('content').add(contentData);

    res.status(201).json({
      id: docRef.id,
      message: 'Content created successfully'
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// Update content (teachers only)
router.put('/:id', authenticateToken, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;

    const doc = await db.collection('content').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const content = doc.data()!;
    
    // Check if user is the creator
    if (content.createdBy !== uid) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own content.' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await db.collection('content').doc(id).update(updateData);

    res.json({ message: 'Content updated successfully' });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Delete content (teachers only)
router.delete('/:id', authenticateToken, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;

    const doc = await db.collection('content').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const content = doc.data()!;
    
    // Check if user is the creator
    if (content.createdBy !== uid) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own content.' });
    }

    await db.collection('content').doc(id).delete();

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// Publish/Unpublish content (teachers only)
router.patch('/:id/publish', authenticateToken, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;
    const { published } = req.body;

    const doc = await db.collection('content').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const content = doc.data()!;
    
    // Check if user is the creator
    if (content.createdBy !== uid) {
      return res.status(403).json({ error: 'Access denied. You can only publish your own content.' });
    }

    await db.collection('content').doc(id).update({
      published: Boolean(published),
      updatedAt: new Date()
    });

    res.json({ 
      message: `Content ${published ? 'published' : 'unpublished'} successfully` 
    });
  } catch (error) {
    console.error('Error updating content status:', error);
    res.status(500).json({ error: 'Failed to update content status' });
  }
});

export default router;
