import express from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import type { UploadApiResponse } from "cloudinary";
import { authenticateToken, requireRole, AuthenticatedRequest } from "../middleware/auth";
import { db } from "../config/firebase";

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Cloudinary config (use your env vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

const router = express.Router();

/* ---------------------- Upload Rules ---------------------- */

const allowedVideoExtensions = [".mp4", ".mov", ".mkv", ".avi", ".webm"];
const allowedVideoMimeTypes = [
  "video/mp4",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  "video/webm",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
    fieldSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedVideoExtensions.includes(ext) || !allowedVideoMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only MP4, MOV, MKV, AVI, or WEBM video files are allowed"));
    }
    cb(null, true);
  },
});

/* ---------------------- Cloudinary Helpers ---------------------- */

const getVideoThumbnailUrl = (publicId: string) =>
  cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    secure: true,
    transformation: [{ width: 640, height: 360, crop: "fill" }],
  });

const getStreamingUrl = (publicId: string) =>
  cloudinary.url(publicId, {
    resource_type: "video",
    secure: true,
    type: "upload",
  });

/* ---------------------- Upload Route ---------------------- */

router.post(
  "/upload",
  authenticateToken,
  requireRole("teacher"),
  (req, res, next) => {
    upload.single("video")(req, res, (err: any) => {
      if (err) {
        console.error("❌ Multer error:", err);
        return res.status(400).json({
          error: "Upload error",
          message: err.message || "Failed to process uploaded file",
        });
      }
      next();
    });
  },

  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file", message: "Please upload a video" });
      }

      const { title, description, category } = req.body;
      const { uid, email } = req.user!;
      const { buffer, originalname, size, mimetype } = req.file;

      if (!title) {
        return res.status(400).json({ error: "Missing title" });
      }

      console.log(`📹 Uploading video: ${originalname}, ${(size / 1024 / 1024).toFixed(2)}MB`);

      // Create cloudinary public ID
      const fileId = randomUUID();
      const sanitizedName = path.parse(originalname).name.replace(/[^a-zA-Z0-9-_]+/g, "-");
      const extension = path.extname(originalname).toLowerCase();
      const folder = process.env.CLOUDINARY_VIDEOS_FOLDER || "videos";
      const publicId = `${folder}/${fileId}-${sanitizedName}`;

      // ---------------------- Cloudinary Upload (Fixed Version) ----------------------
      const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Upload timeout")), 180000); // 3 minutes

        const stream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            resource_type: "video",
            type: "upload",
            access_mode: "public",

            // IMPORTANT: async processing so uploads don't block
            eager_async: true,

            // Async transformation (instead of synchronous)
            eager: [{ width: 1280, height: 720, crop: "limit" }],

            chunk_size: 6_000_000,

            context: {
              uploadedBy: uid,
              uploadedByEmail: email || "",
              originalName: originalname,
            },
          },
          (error, result) => {
            clearTimeout(timeout);

            if (error) {
              console.error("❌ Cloudinary callback error:", error);
              return reject(new Error(error.message || "Cloudinary upload failed"));
            }
            if (!result) return reject(new Error("Empty Cloudinary response"));

            console.log(`✅ Cloudinary upload done: ${result.public_id}`);
            resolve(result);
          }
        );

        stream.on("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });

        console.log(`📤 Streaming ${(buffer.length / 1024 / 1024).toFixed(2)}MB to Cloudinary...`);
        stream.end(buffer);
      });

      // ---------------------- Save to Firestore ----------------------

      const userDoc = await db.collection("users").doc(uid).get();
      const displayName = userDoc.data()?.displayName || email || "Unknown";

      const videoData = {
        title,
        description: description || "",
        category: category || "General",
        fileName: originalname,
        fileSize: uploadResult.bytes || size,
        fileType: mimetype,
        storagePath: uploadResult.public_id,
        storageProvider: "cloudinary",
        streamingUrl: getStreamingUrl(uploadResult.public_id),
        thumbnailUrl: getVideoThumbnailUrl(uploadResult.public_id),
        duration: uploadResult.duration || 0,
        width: uploadResult.width || 0,
        height: uploadResult.height || 0,
        uploadedBy: uid,
        uploadedByName: displayName,
        uploadedByEmail: email || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        likes: 0,
        cloudinaryAssetId: uploadResult.asset_id || "",
        cloudinaryVersion: uploadResult.version,
      };

      const docRef = await db.collection("videos").add(videoData);

      return res.status(201).json({
        id: docRef.id,
        message: "Video uploaded successfully",
        video: { id: docRef.id, ...videoData },
      });
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      return res.status(500).json({
        error: "Failed to upload video",
        message: error.message || "Unknown error",
      });
    }
  }
);

/* ---------------------- GET ALL VIDEOS ---------------------- */

router.get("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const snapshot = await db.collection("videos").orderBy("createdAt", "desc").get();

    const videos = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ?? data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() ?? data.updatedAt,
      };
    });

    res.set("Cache-Control", "public, max-age=60");
    res.json(videos);
  } catch (error) {
    console.error("❌ Fetch videos error:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

/* ---------------------- GET + INCREMENT VIEW ---------------------- */

router.get("/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const doc = await db.collection("videos").doc(req.params.id).get();

    if (!doc.exists) return res.status(404).json({ error: "Video not found" });

    const videoData = doc.data()!;
    await doc.ref.update({
      views: (videoData.views || 0) + 1,
      updatedAt: new Date(),
    });

    res.json({
      id: doc.id,
      ...videoData,
      views: (videoData.views || 0) + 1,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

/* ---------------------- UPDATE VIDEO ---------------------- */

router.put("/:id", authenticateToken, requireRole("teacher"), async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.user!;
    const doc = await db.collection("videos").doc(id).get();

    if (!doc.exists) return res.status(404).json({ error: "Video not found" });

    if (doc.data()!.uploadedBy !== uid)
      return res.status(403).json({ error: "You can only edit your own videos" });

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    ["title", "description", "category"].forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    await doc.ref.update(updateData);

    res.json({ message: "Video updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update video" });
  }
});

/* ---------------------- DELETE VIDEO ---------------------- */

router.delete("/:id", authenticateToken, requireRole("teacher"), async (req: AuthenticatedRequest, res) => {
  try {
    const doc = await db.collection("videos").doc(req.params.id).get();

    if (!doc.exists) return res.status(404).json({ error: "Video not found" });

    const videoData = doc.data()!;
    const { uid } = req.user!;

    if (videoData.uploadedBy !== uid)
      return res.status(403).json({ error: "You can delete only your own videos" });

    if (videoData.storageProvider === "cloudinary" && videoData.storagePath) {
      await cloudinary.uploader.destroy(videoData.storagePath, { resource_type: "video" });
    }

    await doc.ref.delete();
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete video" });
  }
});

/* ---------------------- VIEW TRACKING ---------------------- */

router.post("/:id/view", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const doc = await db.collection("videos").doc(req.params.id).get();

    if (!doc.exists) return res.status(404).json({ error: "Video not found" });

    const videoData = doc.data()!;
    await doc.ref.update({
      views: (videoData.views || 0) + 1,
      updatedAt: new Date(),
    });

    res.json({
      message: "View updated",
      streamingUrl: getStreamingUrl(videoData.storagePath),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update view" });
  }
});

export default router;
