import { useState } from "react";
import { flushSync } from "react-dom";
import { Upload, Loader2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getApiEndpoint } from "@/config/api";

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: () => void;
}

const categories = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "History",
  "Geography",
  "General",
  "Other",
];

const allowedMimeTypes = [
  "video/mp4",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  "video/webm",
];

const allowedExtensions = [".mp4", ".mov", ".mkv", ".avi", ".webm"];

const MAX_SIZE_MB = 500;

export const VideoUploadDialog = ({
  open,
  onOpenChange,
  onUploadSuccess,
}: VideoUploadDialogProps) => {
  const { getIdToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.type)) {
      toast.error("Only MP4, MOV, MKV, AVI, or WEBM video files are allowed");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File size should be less than ${MAX_SIZE_MB}MB`);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a video file");
      return;
    }

    if (!formData.title) {
      toast.error("Please enter a title");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setIsProcessing(false);

    try {
      const token = await getIdToken();
      const uploadFormData = new FormData();
      uploadFormData.append("video", selectedFile);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("category", formData.category || "General");

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      const promise = new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.min(95, Math.round((event.loaded / event.total) * 100));
            // Force immediate DOM update for real-time progress
            flushSync(() => {
              setUploadProgress(percentComplete);
            });
          }
        });

        xhr.addEventListener("loadstart", () => {
          flushSync(() => {
            setUploadProgress(0);
          });
        });

        xhr.addEventListener("load", () => {
          // Client upload complete, now server is processing
          flushSync(() => {
            setUploadProgress(95);
            setIsProcessing(true);
          });

          if (xhr.status >= 200 && xhr.status < 300) {
            // Server processing complete
            flushSync(() => {
              setUploadProgress(100);
            });
            setTimeout(() => resolve(), 500); // Small delay to show 100%
          } else {
            // Handle error response
            let errorMessage = `Upload failed (Status: ${xhr.status})`;
            try {
              const errorData = JSON.parse(xhr.responseText);
              errorMessage = errorData.message || errorData.error || errorMessage;
              console.error("Upload error response:", errorData);
            } catch (e) {
              console.error("Failed to parse error response:", xhr.responseText);
              if (xhr.responseText) {
                errorMessage = xhr.responseText.substring(0, 200);
              }
            }
            reject(new Error(errorMessage));
          }
        });

        xhr.addEventListener("error", (e) => {
          console.error("XHR error:", e);
          setIsProcessing(false);
          reject(new Error("Network error during upload. Please check your connection."));
        });

        xhr.addEventListener("timeout", () => {
          setIsProcessing(false);
          reject(new Error("Upload timeout. File might be too large. Please try again."));
        });

        xhr.addEventListener("abort", () => {
          setIsProcessing(false);
          reject(new Error("Upload was cancelled"));
        });

        xhr.open("POST", getApiEndpoint('/videos/upload'));
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.timeout = 900000; // 15 minutes timeout for large files
        xhr.send(uploadFormData);
      });

      await promise;

      toast.success("Video uploaded successfully!");
      setFormData({
        title: "",
        description: "",
        category: "",
      });
      setSelectedFile(null);
      setUploadProgress(0);
      setIsProcessing(false);
      onOpenChange(false);
      onUploadSuccess();
    } catch (error: any) {
      console.error("Error uploading video:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      
      // Show detailed error message
      const errorMessage = error.message || "Failed to upload video";
      toast.error(errorMessage, {
        duration: 5000,
        description: errorMessage.includes("timeout") 
          ? "The file might be too large. Try uploading a smaller file or check your internet connection."
          : errorMessage.includes("Network")
          ? "Please check your internet connection and try again."
          : "Please check the file format and try again.",
      });
      
      setUploadProgress(0);
      setIsProcessing(false);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Upload Video Lecture</DialogTitle>
          <DialogDescription>
            Upload a video lecture for your students to stream (max {MAX_SIZE_MB}MB).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Video File *</Label>
            {!selectedFile ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept={allowedExtensions.join(",")}
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="video-file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload video (MP4, MOV, MKV, AVI, WEBM)
                  </p>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Upload className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm truncate">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  disabled={uploading}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {uploading && (
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isProcessing ? "Processing on server..." : "Uploading..."}
                  </span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                {isProcessing && (
                  <p className="text-xs text-muted-foreground text-center">
                    Video is being processed and uploaded to Cloudinary. Please wait...
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter video title"
              value={formData.title}
              onChange={(event) =>
                setFormData({ ...formData, title: event.target.value })
              }
              required
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a description for this lecture"
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
              rows={3}
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !selectedFile}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

