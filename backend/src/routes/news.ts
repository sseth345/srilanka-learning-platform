import express from 'express';
import multer from 'multer';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { db, bucket } from '../config/firebase';
import { randomUUID } from 'crypto';

const router = express.Router();

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for audio files
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// Get all news articles
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { category, language, limit = 20, offset = 0 } = req.query;

    // Fetch all news without complex queries to avoid index requirement
    let query: any = db.collection('news');

    const snapshot = await query.get();

    let news = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      publishedAt: doc.data().publishedAt?.toDate(),
    }));

    // Filter in memory
    if (category && category !== 'all') {
      news = news.filter((n: any) => n.category === category);
    }

    if (language && language !== 'all') {
      news = news.filter((n: any) => n.language === language);
    }

    // Sort by publishedAt/createdAt descending
    news.sort((a: any, b: any) => {
      const aTime = (a.publishedAt || a.createdAt)?.getTime() || 0;
      const bTime = (b.publishedAt || b.createdAt)?.getTime() || 0;
      return bTime - aTime;
    });

    // Apply pagination
    const startIndex = Number(offset);
    const endIndex = startIndex + Number(limit);
    const paginatedNews = news.slice(startIndex, endIndex);

    res.json({
      news: paginatedNews,
      total: news.length,
      hasMore: endIndex < news.length,
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get single news article
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('news').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'News article not found' });
    }

    const newsData = doc.data()!;

    // Increment view count
    await db.collection('news').doc(id).update({
      views: (newsData.views || 0) + 1,
    });

    res.json({
      id: doc.id,
      ...newsData,
      views: (newsData.views || 0) + 1,
      createdAt: newsData.createdAt?.toDate(),
      updatedAt: newsData.updatedAt?.toDate(),
      publishedAt: newsData.publishedAt?.toDate(),
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Create news article (teachers only)
router.post('/', authenticateToken, requireRole('teacher'), upload.single('audio'), async (req: AuthenticatedRequest, res) => {
  try {
    const { uid, email } = req.user!;
    const { title, content, summary, category, language, tags, sourceUrl, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Get user profile
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    const authorName = userData?.displayName || email || 'Unknown';

    let audioUrl = null;
    let audioFileName = null;

    // Upload audio file if provided
    if (req.file) {
      const fileId = randomUUID();
      const fileName = `news/audio/${fileId}_${req.file.originalname}`;
      const file = bucket.file(fileName);

      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
          metadata: {
            uploadedBy: uid,
            originalName: req.file.originalname,
          },
        },
        public: true,
      });

      audioUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      audioFileName = req.file.originalname;
    }

    const newsData = {
      title,
      content,
      summary: summary || content.substring(0, 200) + '...',
      category: category || 'General',
      language: language || 'Tamil',
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      sourceUrl: sourceUrl || null,
      audioUrl,
      audioFileName,
      authorId: uid,
      authorName,
      published: Boolean(published),
      publishedAt: Boolean(published) ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
      likedBy: [],
    };

    const docRef = await db.collection('news').add(newsData);

    res.status(201).json({
      id: docRef.id,
      message: 'News article created successfully',
    });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ error: 'Failed to create news article' });
  }
});

// Update news article (teachers only, own articles)
router.put('/:id', authenticateToken, requireRole('teacher'), upload.single('audio'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;
    const { title, content, summary, category, language, tags, sourceUrl, published, removeAudio } = req.body;

    const doc = await db.collection('news').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'News article not found' });
    }

    const newsData = doc.data()!;

    if (newsData.authorId !== uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (summary !== undefined) updateData.summary = summary;
    if (category) updateData.category = category;
    if (language) updateData.language = language;
    if (tags) updateData.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    if (sourceUrl !== undefined) updateData.sourceUrl = sourceUrl;

    // Handle published status
    if (published !== undefined) {
      updateData.published = Boolean(published);
      if (Boolean(published) && !newsData.published) {
        updateData.publishedAt = new Date();
      }
    }

    // Remove existing audio if requested
    if (removeAudio === 'true' && newsData.audioUrl) {
      const fileName = newsData.audioUrl.split('/').pop();
      if (fileName) {
        try {
          await bucket.file(`news/audio/${fileName}`).delete();
        } catch (err) {
          console.error('Error deleting audio file:', err);
        }
      }
      updateData.audioUrl = null;
      updateData.audioFileName = null;
    }

    // Upload new audio file if provided
    if (req.file) {
      // Delete old audio if exists
      if (newsData.audioUrl) {
        const fileName = newsData.audioUrl.split('/').pop();
        if (fileName) {
          try {
            await bucket.file(`news/audio/${fileName}`).delete();
          } catch (err) {
            console.error('Error deleting old audio file:', err);
          }
        }
      }

      const fileId = randomUUID();
      const fileName = `news/audio/${fileId}_${req.file.originalname}`;
      const file = bucket.file(fileName);

      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
          metadata: {
            uploadedBy: uid,
            originalName: req.file.originalname,
          },
        },
        public: true,
      });

      updateData.audioUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      updateData.audioFileName = req.file.originalname;
    }

    await db.collection('news').doc(id).update(updateData);

    res.json({ message: 'News article updated successfully' });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Failed to update news article' });
  }
});

// Delete news article (teachers only, own articles)
router.delete('/:id', authenticateToken, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;

    const doc = await db.collection('news').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'News article not found' });
    }

    const newsData = doc.data()!;

    if (newsData.authorId !== uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete audio file if exists
    if (newsData.audioUrl) {
      const fileName = newsData.audioUrl.split('/').pop();
      if (fileName) {
        try {
          await bucket.file(`news/audio/${fileName}`).delete();
        } catch (err) {
          console.error('Error deleting audio file:', err);
        }
      }
    }

    await db.collection('news').doc(id).delete();

    res.json({ message: 'News article deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Failed to delete news article' });
  }
});

// Like/Unlike news article
router.post('/:id/like', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;

    const doc = await db.collection('news').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'News article not found' });
    }

    const newsData = doc.data()!;
    const likedBy = newsData.likedBy || [];
    const hasLiked = likedBy.includes(uid);

    if (hasLiked) {
      // Unlike
      await db.collection('news').doc(id).update({
        likes: Math.max(0, (newsData.likes || 0) - 1),
        likedBy: likedBy.filter((id: string) => id !== uid),
      });
      res.json({ message: 'Unliked', liked: false });
    } else {
      // Like
      await db.collection('news').doc(id).update({
        likes: (newsData.likes || 0) + 1,
        likedBy: [...likedBy, uid],
      });
      res.json({ message: 'Liked', liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Get categories
router.get('/meta/categories', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const snapshot = await db.collection('news').get();

    const categories = new Set<string>();
    snapshot.docs.forEach((doc: any) => {
      const category = doc.data().category;
      if (category) categories.add(category);
    });

    res.json(Array.from(categories).sort());
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;

