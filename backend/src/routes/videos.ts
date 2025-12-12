import express from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import type { UploadApiResponse } from 'cloudinary';
//import cloudinary from '../config/cloudinary';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { db } from '../config/firebase';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

const router = express.Router();

const isCloudinaryConfigured = () =>
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

const allowedVideoExtensions = ['.mp4', '.mov', '.mkv', '.avi', '.webm'];
const allowedVideoMimeTypes = [
  'video/mp4',
  'video/quicktime',
  'video/x-matroska',
  'video/x-msvideo',
  'video/webm',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
    fieldSize: 10 * 1024 * 1024, // 10MB for other fields
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedVideoExtensions.includes(ext) || !allowedVideoMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only MP4, MOV, MKV, AVI, or WEBM video files are allowed'));
    }
    cb(null, true);
  },
});

const getVideoThumbnailUrl = (publicId: string) =>
  cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    secure: true,
    transformation: [{ width: 640, height: 360, crop: 'fill' }, { quality: 'auto' }],
  });

const getStreamingUrl = (publicId: string) =>
  cloudinary.url(publicId, {
    resource_type: 'video',
    secure: true,
    type: 'upload',
  });

// Upload video (teachers only)
router.post(
  '/upload',
  authenticateToken,
  requireRole('teacher'),
  (req, res, next) => {
    upload.single('video')(req, res, (err: any) => {
      if (err) {
        console.error('❌ Multer error:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File too large',
            message: 'File size exceeds the maximum limit of 500MB. Please upload a smaller file.',
          });
        }
        if (err.code === 'LIMIT_FIELD_SIZE') {
          return res.status(400).json({
            error: 'Field too large',
            message: 'One of the form fields is too large. Please reduce the text length.',
          });
        }
        return res.status(400).json({
          error: 'Upload error',
          message: err.message || 'Failed to process uploaded file',
        });
      }
      next();
    });
  },
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: 'No video file uploaded',
          message: 'Please select a video file to upload',
        });
      }

      if (!isCloudinaryConfigured()) {
        return res.status(500).json({
          error: 'Cloudinary is not properly configured. Please contact the administrator.',
        });
      }

      const { title, description, category } = req.body;
      const { uid, email } = req.user!;
      const { buffer, originalname, size, mimetype } = req.file;

      console.log(`📹 Starting video upload: ${originalname}, Size: ${(size / 1024 / 1024).toFixed(2)}MB`);

      if (!title || title.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Title is required',
          message: 'Please provide a title for the video',
        });
      }

      // Validate buffer
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid file',
          message: 'The uploaded file is empty or corrupted. Please try uploading again.',
        });
      }

      // Check if buffer is too large (memory safety)
      if (buffer.length > 500 * 1024 * 1024) {
        return res.status(400).json({ 
          error: 'File too large',
          message: 'File size exceeds maximum limit of 500MB. Please upload a smaller file.',
        });
      }

      // Validate file extension
      const ext = path.extname(originalname).toLowerCase();
      if (!allowedVideoExtensions.includes(ext)) {
        return res.status(400).json({ 
          error: 'Invalid file type',
          message: `File type ${ext} is not allowed. Only ${allowedVideoExtensions.join(', ')} are supported.`,
        });
      }

      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data();
      const displayName = userData?.displayName || email || 'Unknown';

      const fileId = randomUUID();
      const sanitizedName = path.parse(originalname).name.replace(/[^a-zA-Z0-9-_]+/g, '-');
      const extension = path.extname(originalname).toLowerCase();
      const folder = process.env.CLOUDINARY_VIDEOS_FOLDER || 'videos';
      const publicId = `${folder}/${fileId}-${sanitizedName}`;

      console.log(`📤 Uploading to Cloudinary: ${publicId}`);

      // ----------------- Robust Cloudinary upload (drop-in replacement) -----------------
      const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error("❌ Upload timed out before Cloudinary callback");
          reject(new Error("Upload timeout"));
        }, 90_000);

        const stream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            resource_type: "video" as "video",  // <-- FIXED TYPE
            type: "upload",
            access_mode: "public",

            eager_async: true, // prevents Render timeout

            chunk_size: 6_000_000,

            transformation: [
              { width: 1280, height: 720, crop: "limit" }
            ],

            context: {
              uploadedBy: uid,
              uploadedByEmail: email || "",
              uploadedByName: displayName,
              originalName: originalname,
            }
          },

          (error, result) => {
            clearTimeout(timeout);

            if (error) {
              console.error("❌ Cloudinary callback error:", error);
              return reject(new Error(error.message || "Cloudinary upload failed"));
            }

            if (!result) {
              return reject(new Error("Cloudinary returned empty result"));
            }

            console.log(`✅ Cloudinary upload complete: ${result.public_id}`);
            resolve(result);
          }
        );

        stream.on("finish", () => {
          console.log("📤 Upload stream finished writing");
        });

        stream.on("close", () => {
          console.log("📤 Upload stream closed");
        });

        stream.on("error", (err) => {
          clearTimeout(timeout);
          console.error("❌ Stream write error:", err);
          reject(new Error(err.message));
        });

        try {
          console.log(`📤 Writing ${(buffer.length / 1024 / 1024).toFixed(2)}MB to Cloudinary`);
          stream.end(buffer);
        } catch (err: any) {
          clearTimeout(timeout);
          console.error("❌ Exception during stream write:", err);
          reject(new Error(err.message));
        }
      });


      const videoData = {
        title,
        description: description || '',
        category: category || 'General',
        fileName: originalname,
        fileSize: uploadResult.bytes || size,
        fileType: mimetype,
        storagePath: uploadResult.public_id,
        storageProvider: 'cloudinary',
        streamingUrl: getStreamingUrl(uploadResult.public_id),
        thumbnailUrl: getVideoThumbnailUrl(uploadResult.public_id),
        duration: uploadResult.duration || 0,
        bitrate: uploadResult.bit_rate || 0,
        width: uploadResult.width || 0,
        height: uploadResult.height || 0,
        uploadedBy: uid,
        uploadedByEmail: email || '',
        uploadedByName: displayName || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        likes: 0,
        cloudinaryAssetId: uploadResult.asset_id || '',
        cloudinaryVersion: uploadResult.version,
      };

      const docRef = await db.collection('videos').add(videoData);

      res.status(201).json({
        id: docRef.id,
        message: 'Video uploaded successfully',
        video: {
          id: docRef.id,
          ...videoData,
        },
      });
    } catch (error: any) {
      console.error('❌ Error uploading video:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Determine status code
      let statusCode = 500;
      let errorMessage = 'An unexpected error occurred during upload';
      
      if (error.http_code) {
        statusCode = error.http_code;
        errorMessage = error.message || errorMessage;
      } else if (error.statusCode) {
        statusCode = error.statusCode;
        errorMessage = error.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
        
        // Handle specific error types
        if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
          statusCode = 408;
          errorMessage = 'Upload timeout: The file is too large or upload is taking too long. Please try a smaller file.';
        } else if (error.message.includes('ECONNRESET') || error.message.includes('network')) {
          statusCode = 503;
          errorMessage = 'Network error: Connection was lost during upload. Please try again.';
        } else if (error.message.includes('ENOENT') || error.message.includes('file')) {
          statusCode = 400;
          errorMessage = 'File error: The uploaded file could not be processed.';
        } else if (error.message.includes('Cloudinary')) {
          statusCode = 502;
          errorMessage = `Cloudinary error: ${error.message}`;
        }
      }
      
      res.status(statusCode).json({
        error: 'Failed to upload video',
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && {
          details: error.stack,
          originalError: error.toString(),
        }),
      });
    }
  }
);

// Get all videos ONCE — no filtering (frontend does filtering)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const snapshot = await db
      .collection('videos')
      .orderBy('createdAt', 'desc')
      .get();

    const videos = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
      };
    });

    // Cache headers (Render will LOVE this)
    res.set('Cache-Control', 'public, max-age=60'); // 1 minute cache
    res.set('ETag', `"${snapshot.size}-${snapshot.readTime.toMillis()}"`);

    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});


// Get video details and increment views
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const docRef = db.collection('videos').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoData = doc.data()!;

    await docRef.update({
      views: (videoData.views || 0) + 1,
      updatedAt: new Date(),
    });

    res.json({
      id: doc.id,
      ...videoData,
      views: (videoData.views || 0) + 1,
      createdAt: videoData.createdAt?.toDate?.() ?? videoData.createdAt,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Update video metadata (teachers only)
router.put('/:id', authenticateToken, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;
    const { title, description, category } = req.body;

    const docRef = db.collection('videos').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoData = doc.data()!;

    if (videoData.uploadedBy !== uid) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own videos.' });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;

    await docRef.update(updateData);

    res.json({ message: 'Video updated successfully' });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video (teachers only)
router.delete('/:id', authenticateToken, requireRole('teacher'), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;

    const docRef = db.collection('videos').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoData = doc.data()!;

    if (videoData.uploadedBy !== uid) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own videos.' });
    }

    try {
      if (videoData.storageProvider === 'cloudinary' && videoData.storagePath) {
        await cloudinary.uploader.destroy(videoData.storagePath, {
          resource_type: 'video',
          type: 'upload',
        });
      }
    } catch (error) {
      console.error('Error deleting video from Cloudinary:', error);
    }

    await docRef.delete();

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Track video view
router.post('/:id/view', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const docRef = db.collection('videos').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoData = doc.data()!;

    await docRef.update({
      views: (videoData.views || 0) + 1,
      updatedAt: new Date(),
    });

    res.json({
      message: 'View count updated',
      streamingUrl: getStreamingUrl(videoData.storagePath),
    });
  } catch (error) {
    console.error('Error updating view count:', error);
    res.status(500).json({ error: 'Failed to update view count' });
  }
});

export default router;

