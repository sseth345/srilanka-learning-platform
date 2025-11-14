import { BookOpen, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { userProfile } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="gradient-hero p-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EduLearn
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative hover:bg-muted/80 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-accent rounded-full ring-2 ring-background"></span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
