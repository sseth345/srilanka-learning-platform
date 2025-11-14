import {
  BookOpen,
  Video,
  MessageSquare,
  Newspaper,
  BarChart3,
  Gamepad2,
  Upload,
  FileText,
  Home,
  LogOut,
  User,
  Settings,
  Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardSidebarProps {
  role: "student" | "teacher";
}

export const DashboardSidebar = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const role = userProfile?.role || 'student';
  const studentLinks = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: BookOpen, label: "My Library", path: "/library" },
    { icon: Video, label: "Video Lectures", path: "/videos" },
    { icon: MessageSquare, label: "Discussions", path: "/discussions" },
    { icon: Newspaper, label: "Tamil News", path: "/tamil-news" },
    { icon: FileText, label: "Exercises", path: "/exercises" },
    { icon: Gamepad2, label: "Learning Games", path: "/games" },
    { icon: BarChart3, label: "My Progress", path: "/progress" },
  ];

  const teacherLinks = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Upload, label: "Upload Content", path: "/upload" },
    { icon: BookOpen, label: "Resources", path: "/library" },
    { icon: Video, label: "Video Lectures", path: "/videos" },
    { icon: MessageSquare, label: "Discussions", path: "/discussions" },
    { icon: Newspaper, label: "News Management", path: "/news-management" },
    { icon: FileText, label: "Create Exercise", path: "/exercises" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
  ];

  const links = role === "student" ? studentLinks : teacherLinks;

  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur-sm h-[calc(100vh-4rem)] sticky top-16 flex flex-col shadow-sm">
      <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md font-medium"
                  : "hover:bg-muted/80 text-foreground hover:translate-x-1"
              )
            }
          >
            <link.icon className={cn(
              "h-5 w-5 transition-transform",
              "group-hover:scale-110"
            )} />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      
      {/* User Profile Section */}
      <div className="p-4 border-t bg-muted/30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto hover:bg-muted/80 transition-colors rounded-lg">
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                  <AvatarImage src={userProfile?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                    {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm font-semibold truncate w-full">
                    {userProfile?.displayName || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {userProfile?.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                  </span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/profile?tab=settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
};
