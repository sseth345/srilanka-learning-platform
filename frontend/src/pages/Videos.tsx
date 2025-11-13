import { Play, Clock, Eye, MessageSquare } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const videos = [
  {
    id: 1,
    title: "Calculus Fundamentals - Derivatives",
    instructor: "Dr. Smith",
    duration: "45:30",
    views: 1250,
    comments: 48,
    category: "Mathematics",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600",
    uploadDate: "2024-01-15",
  },
  {
    id: 2,
    title: "Quantum Mechanics Introduction",
    instructor: "Prof. Johnson",
    duration: "1:12:45",
    views: 2100,
    comments: 87,
    category: "Physics",
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600",
    uploadDate: "2024-01-20",
  },
  {
    id: 3,
    title: "Data Structures and Algorithms",
    instructor: "Dr. Williams",
    duration: "58:20",
    views: 3400,
    comments: 125,
    category: "Computer Science",
    thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600",
    uploadDate: "2024-02-01",
  },
  {
    id: 4,
    title: "Organic Chemistry Reactions",
    instructor: "Prof. Brown",
    duration: "42:15",
    views: 980,
    comments: 35,
    category: "Chemistry",
    thumbnail: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600",
    uploadDate: "2024-02-10",
  },
];

const Videos = () => {
  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Video Lectures</h1>
        <p className="text-muted-foreground">Watch recorded lectures and live streams</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="shadow-elevated hover:shadow-glow transition-all duration-300 overflow-hidden">
            <div className="relative h-56 bg-muted group cursor-pointer">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary rounded-full p-4 shadow-glow">
                  <Play className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <Badge className="absolute top-3 right-3 bg-black/70 text-white">
                <Clock className="mr-1 h-3 w-3" />
                {video.duration}
              </Badge>
            </div>
            <CardHeader>
              <Badge className="w-fit mb-2 bg-secondary">{video.category}</Badge>
              <h3 className="font-bold text-lg">{video.title}</h3>
              <p className="text-sm text-muted-foreground">by {video.instructor}</p>
            </CardHeader>
            <CardFooter className="flex justify-between items-center">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {video.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {video.comments}
                </span>
              </div>
              <Button variant="gradient" size="sm">
                Watch Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Videos;
