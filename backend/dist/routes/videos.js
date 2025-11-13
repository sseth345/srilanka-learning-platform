"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const auth_1 = require("../middleware/auth");
const firebase_1 = require("../config/firebase");
const router = express_1.default.Router();
const isCloudinaryConfigured = () => !!process.env.CLOUDINARY_CLOUD_NAME &&
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
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB
    },
    fileFilter: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (!allowedVideoExtensions.includes(ext) || !allowedVideoMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Only MP4, MOV, MKV, AVI, or WEBM video files are allowed'));
        }
        cb(null, true);
    },
});
const getVideoThumbnailUrl = (publicId) => cloudinary_1.default.url(publicId, {
    resource_type: 'video',
    format: 'jpg',
    secure: true,
    transformation: [{ width: 640, height: 360, crop: 'fill' }, { quality: 'auto' }],
});
const getStreamingUrl = (publicId) => cloudinary_1.default.url(publicId, {
    resource_type: 'video',
    secure: true,
    type: 'upload',
});
// Upload video (teachers only)
router.post('/upload', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }
        if (!isCloudinaryConfigured()) {
            return res.status(500).json({
                error: 'Cloudinary is not properly configured. Please contact the administrator.',
            });
        }
        const { title, description, category } = req.body;
        const { uid, email } = req.user;
        const { buffer, originalname, size, mimetype } = req.file;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        const userDoc = await firebase_1.db.collection('users').doc(uid).get();
        const userData = userDoc.data();
        const displayName = userData?.displayName || email || 'Unknown';
        const fileId = (0, crypto_1.randomUUID)();
        const sanitizedName = path_1.default.parse(originalname).name.replace(/[^a-zA-Z0-9-_]+/g, '-');
        const extension = path_1.default.extname(originalname).toLowerCase();
        const folder = process.env.CLOUDINARY_VIDEOS_FOLDER || 'videos';
        const publicId = `${folder}/${fileId}-${sanitizedName}`;
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.default.uploader.upload_stream({
                public_id: publicId,
                resource_type: 'video',
                type: 'upload',
                access_mode: 'public',
                use_filename: false,
                unique_filename: false,
                overwrite: false,
                filename_override: `${sanitizedName}${extension}`,
                chunk_size: 6000000, // 6MB chunks
                context: {
                    uploadedBy: uid,
                    uploadedByEmail: email || '',
                    uploadedByName: displayName || '',
                    originalName: originalname,
                },
            }, (error, result) => {
                if (error || !result) {
                    return reject(error || new Error('Failed to upload video to Cloudinary'));
                }
                resolve(result);
            });
            uploadStream.end(buffer);
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
        const docRef = await firebase_1.db.collection('videos').add(videoData);
        res.status(201).json({
            id: docRef.id,
            message: 'Video uploaded successfully',
            video: {
                id: docRef.id,
                ...videoData,
            },
        });
    }
    catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({
            error: 'Failed to upload video',
            message: error.message,
        });
    }
});
// Get videos list
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { category, search, limit = 50, offset = 0 } = req.query;
        let query = firebase_1.db.collection('videos').orderBy('createdAt', 'desc');
        const snapshot = await query.get();
        let videos = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        if (category) {
            videos = videos.filter((video) => video.category === category);
        }
        if (search) {
            const searchTerm = search.toLowerCase();
            videos = videos.filter((video) => [video.title, video.description, video.category, video.uploadedByName]
                .filter(Boolean)
                .some((field) => field.toLowerCase().includes(searchTerm)));
        }
        const startIndex = Number(offset);
        const endIndex = startIndex + Number(limit);
        const paginatedVideos = videos.slice(startIndex, endIndex).map((video) => ({
            ...video,
            createdAt: video.createdAt?.toDate?.() ?? video.createdAt,
            updatedAt: video.updatedAt?.toDate?.() ?? video.updatedAt,
        }));
        res.json(paginatedVideos);
    }
    catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});
// Get video details and increment views
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = firebase_1.db.collection('videos').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Video not found' });
        }
        const videoData = doc.data();
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
    }
    catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});
// Update video metadata (teachers only)
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const { title, description, category } = req.body;
        const docRef = firebase_1.db.collection('videos').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Video not found' });
        }
        const videoData = doc.data();
        if (videoData.uploadedBy !== uid) {
            return res.status(403).json({ error: 'Access denied. You can only edit your own videos.' });
        }
        const updateData = {
            updatedAt: new Date(),
        };
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (category !== undefined)
            updateData.category = category;
        await docRef.update(updateData);
        res.json({ message: 'Video updated successfully' });
    }
    catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ error: 'Failed to update video' });
    }
});
// Delete video (teachers only)
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const docRef = firebase_1.db.collection('videos').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Video not found' });
        }
        const videoData = doc.data();
        if (videoData.uploadedBy !== uid) {
            return res.status(403).json({ error: 'Access denied. You can only delete your own videos.' });
        }
        try {
            if (videoData.storageProvider === 'cloudinary' && videoData.storagePath) {
                await cloudinary_1.default.uploader.destroy(videoData.storagePath, {
                    resource_type: 'video',
                    type: 'upload',
                });
            }
        }
        catch (error) {
            console.error('Error deleting video from Cloudinary:', error);
        }
        await docRef.delete();
        res.json({ message: 'Video deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});
// Track video view
router.post('/:id/view', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = firebase_1.db.collection('videos').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Video not found' });
        }
        const videoData = doc.data();
        await docRef.update({
            views: (videoData.views || 0) + 1,
            updatedAt: new Date(),
        });
        res.json({
            message: 'View count updated',
            streamingUrl: getStreamingUrl(videoData.storagePath),
        });
    }
    catch (error) {
        console.error('Error updating view count:', error);
        res.status(500).json({ error: 'Failed to update view count' });
    }
});
exports.default = router;
//# sourceMappingURL=videos.js.map