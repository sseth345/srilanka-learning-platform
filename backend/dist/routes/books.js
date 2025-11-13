"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const firebase_1 = require("../config/firebase");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const isCloudinaryConfigured = () => !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET;
const getCloudinaryDownloadUrl = (publicId, fileName) => {
    if (!isCloudinaryConfigured()) {
        return '';
    }
    const extension = path_1.default.extname(fileName).replace('.', '').toLowerCase() || 'pdf';
    return cloudinary_1.default.utils.private_download_url(publicId, extension, {
        resource_type: 'raw',
        type: 'upload',
        attachment: true,
    });
};
const router = express_1.default.Router();
// Configure multer for file upload
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for PDFs
    },
    fileFilter: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (ext !== '.pdf' || file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed'));
        }
        cb(null, true);
    },
});
// Upload a book (teachers only)
router.post('/upload', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), upload.single('book'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { title, description, category, subject } = req.body;
        const { uid, email } = req.user;
        const { buffer, originalname, size, mimetype } = req.file;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        // Get user profile for displayName
        const userDoc = await firebase_1.db.collection('users').doc(uid).get();
        const userData = userDoc.data();
        const displayName = userData?.displayName || email || 'Unknown';
        // Create unique filename/public id
        const fileId = (0, crypto_1.randomUUID)();
        if (mimetype !== 'application/pdf') {
            return res.status(400).json({ error: 'Invalid file type. Only PDFs are allowed.' });
        }
        if (!isCloudinaryConfigured()) {
            return res.status(500).json({
                error: 'Cloudinary storage is not properly configured. Please contact the administrator.',
            });
        }
        const sanitizedName = path_1.default.parse(originalname).name.replace(/[^a-zA-Z0-9-_]+/g, '-');
        const extension = path_1.default.extname(originalname).toLowerCase() || '.pdf';
        const folder = process.env.CLOUDINARY_BOOKS_FOLDER || 'books';
        const publicId = `${folder}/${fileId}-${sanitizedName}`;
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.default.uploader.upload_stream({
                public_id: publicId,
                resource_type: 'raw',
                type: 'upload',
                access_mode: 'public',
                use_filename: false,
                unique_filename: false,
                overwrite: false,
                filename_override: `${sanitizedName}${extension}`,
                context: {
                    uploadedBy: uid,
                    uploadedByEmail: email || '',
                    uploadedByName: displayName || '',
                    originalName: originalname,
                },
            }, (error, result) => {
                if (error || !result) {
                    return reject(error || new Error('Failed to upload file to Cloudinary'));
                }
                resolve(result);
            });
            uploadStream.end(buffer);
        });
        const storagePath = uploadResult.public_id;
        const downloadUrl = getCloudinaryDownloadUrl(storagePath, originalname);
        const publicUrl = downloadUrl || uploadResult.secure_url;
        const bookData = {
            title,
            description: description || '',
            category: category || 'General',
            subject: subject || '',
            fileName: originalname,
            fileSize: uploadResult.bytes || size,
            fileUrl: publicUrl,
            storagePath,
            storageProvider: 'cloudinary',
            cloudinaryAssetId: uploadResult.asset_id || '',
            cloudinaryVersion: uploadResult.version,
            uploadedBy: uid,
            uploadedByEmail: email || '',
            uploadedByName: displayName || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            published: true,
            downloads: 0,
            views: 0,
        };
        const docRef = await firebase_1.db.collection('books').add(bookData);
        res.status(201).json({
            id: docRef.id,
            message: 'Book uploaded successfully',
            fileUrl: publicUrl,
        });
    }
    catch (error) {
        console.error('Error uploading book:', error);
        res.status(500).json({
            error: 'Failed to upload book',
            message: error.message
        });
    }
});
// Get all books
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const { category, subject, search, limit = 50, offset = 0 } = req.query;
        // Fetch all published books without orderBy to avoid composite index requirement
        let query = firebase_1.db.collection('books').where('published', '==', true);
        const snapshot = await query.get();
        let books = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
        }));
        books = books.map((book) => {
            if (book.storageProvider === 'cloudinary' &&
                book.storagePath &&
                book.fileName) {
                book.fileUrl = getCloudinaryDownloadUrl(book.storagePath, book.fileName);
            }
            return book;
        });
        // Filter in memory by category
        if (category) {
            books = books.filter((book) => book.category === category);
        }
        // Filter in memory by subject
        if (subject) {
            books = books.filter((book) => book.subject === subject);
        }
        // Search filter if search term is provided
        if (search) {
            const searchTerm = search.toLowerCase();
            books = books.filter((book) => book.title.toLowerCase().includes(searchTerm) ||
                book.description.toLowerCase().includes(searchTerm) ||
                book.category.toLowerCase().includes(searchTerm) ||
                book.subject.toLowerCase().includes(searchTerm));
        }
        // Sort in memory by createdAt descending
        books.sort((a, b) => {
            const aTime = a.createdAt?.getTime() || 0;
            const bTime = b.createdAt?.getTime() || 0;
            return bTime - aTime;
        });
        // Apply pagination in memory
        const startIndex = Number(offset);
        const endIndex = startIndex + Number(limit);
        const paginatedBooks = books.slice(startIndex, endIndex);
        res.json(paginatedBooks);
    }
    catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});
// Get a specific book
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await firebase_1.db.collection('books').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Book not found' });
        }
        const bookData = doc.data();
        // Increment view count
        await firebase_1.db.collection('books').doc(id).update({
            views: (bookData.views || 0) + 1,
        });
        const fileUrl = bookData.storageProvider === 'cloudinary' &&
            bookData.storagePath &&
            bookData.fileName
            ? getCloudinaryDownloadUrl(bookData.storagePath, bookData.fileName)
            : bookData.fileUrl;
        res.json({
            id: doc.id,
            ...bookData,
            createdAt: bookData.createdAt?.toDate(),
            updatedAt: bookData.updatedAt?.toDate(),
            fileUrl,
        });
    }
    catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});
// Update book metadata (teachers only, own books)
router.put('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const { title, description, category, subject, published } = req.body;
        const doc = await firebase_1.db.collection('books').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Book not found' });
        }
        const bookData = doc.data();
        // Check if user is the uploader
        if (bookData.uploadedBy !== uid) {
            return res.status(403).json({ error: 'Access denied. You can only edit your own books.' });
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
        if (subject !== undefined)
            updateData.subject = subject;
        if (published !== undefined)
            updateData.published = published;
        await firebase_1.db.collection('books').doc(id).update(updateData);
        res.json({ message: 'Book updated successfully' });
    }
    catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Failed to update book' });
    }
});
// Delete a book (teachers only, own books)
router.delete('/:id', auth_1.authenticateToken, (0, auth_1.requireRole)('teacher'), async (req, res) => {
    try {
        const { id } = req.params;
        const { uid } = req.user;
        const doc = await firebase_1.db.collection('books').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Book not found' });
        }
        const bookData = doc.data();
        // Check if user is the uploader
        if (bookData.uploadedBy !== uid) {
            return res.status(403).json({ error: 'Access denied. You can only delete your own books.' });
        }
        // Delete file from storage
        try {
            if (bookData.storageProvider === 'cloudinary' && bookData.storagePath) {
                await cloudinary_1.default.uploader.destroy(bookData.storagePath, {
                    resource_type: 'raw',
                    type: 'upload',
                });
            }
            else if (bookData.storagePath) {
                const file = firebase_1.bucket.file(bookData.storagePath);
                await file.delete();
            }
        }
        catch (storageError) {
            console.error('Error deleting file from storage:', storageError);
            // Continue with Firestore deletion even if storage deletion fails
        }
        // Delete from Firestore
        await firebase_1.db.collection('books').doc(id).delete();
        res.json({ message: 'Book deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});
// Increment download count
router.post('/:id/download', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await firebase_1.db.collection('books').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Book not found' });
        }
        const bookData = doc.data();
        // Increment download count
        await firebase_1.db.collection('books').doc(id).update({
            downloads: (bookData.downloads || 0) + 1,
        });
        let downloadUrl = bookData.fileUrl;
        if (bookData.storageProvider === 'cloudinary' &&
            bookData.storagePath &&
            bookData.fileName) {
            downloadUrl = getCloudinaryDownloadUrl(bookData.storagePath, bookData.fileName);
        }
        res.json({
            message: 'Download count updated',
            fileUrl: downloadUrl
        });
    }
    catch (error) {
        console.error('Error updating download count:', error);
        res.status(500).json({ error: 'Failed to update download count' });
    }
});
// Get categories
router.get('/meta/categories', auth_1.authenticateToken, async (req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('books')
            .where('published', '==', true)
            .get();
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
// Get subjects
router.get('/meta/subjects', auth_1.authenticateToken, async (req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('books')
            .where('published', '==', true)
            .get();
        const subjects = new Set();
        snapshot.docs.forEach((doc) => {
            const subject = doc.data().subject;
            if (subject)
                subjects.add(subject);
        });
        res.json(Array.from(subjects).sort());
    }
    catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});
exports.default = router;
//# sourceMappingURL=books.js.map