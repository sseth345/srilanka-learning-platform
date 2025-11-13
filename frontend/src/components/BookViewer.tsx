import { X, Download, Maximize2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BookViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: {
    id: string;
    title: string;
    fileUrl: string;
    fileName: string;
  } | null;
}

export const BookViewer = ({ open, onOpenChange, book }: BookViewerProps) => {
  const { getIdToken } = useAuth();

  const handleDownload = async () => {
    if (!book) return;

    try {
      const token = await getIdToken();

      // Track download
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books/${book.id}/download`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Download file
      const link = document.createElement("a");
      link.href = book.fileUrl;
      link.download = book.fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading book:", error);
      toast.error("Failed to download book");
    }
  };

  const handleOpenFullscreen = () => {
    if (!book) return;
    window.open(book.fileUrl, "_blank");
  };

  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{book.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenFullscreen}
                title="Open in new tab"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Full Screen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 w-full h-full p-4 pt-2">
          <iframe
            src={`${book.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border rounded-lg"
            title={book.title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

