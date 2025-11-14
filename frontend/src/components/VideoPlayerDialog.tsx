import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VideoPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: {
    id: string;
    title: string;
    streamingUrl: string;
    description?: string;
    uploadedByName?: string;
  } | null;
}

export const VideoPlayerDialog = ({
  open,
  onOpenChange,
  video,
}: VideoPlayerDialogProps) => {
  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden [&>button]:hidden">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl mb-1">{video.title}</DialogTitle>
              {video.uploadedByName && (
                <p className="text-sm text-muted-foreground">
                  Uploaded by {video.uploadedByName}
                </p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="px-6 pb-6 pt-4">
          <div className="aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
            <video
              key={video.streamingUrl}
              src={video.streamingUrl}
              controls
              controlsList="nodownload"
              className="w-full h-full"
              preload="metadata"
            />
          </div>
          {video.description && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-foreground">{video.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

