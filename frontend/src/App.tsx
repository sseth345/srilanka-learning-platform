import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Library from "./pages/Library";
import Videos from "./pages/Videos";
import Discussions from "./pages/Discussions";
import TamilNews from "./pages/TamilNews";
import Games from "./pages/Games";
import Progress from "./pages/Progress";
import Exercises from "./pages/Exercises";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NewsManagement from "./pages/NewsManagement";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><Index /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/library" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><Library /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/videos" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><Videos /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/discussions" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><Discussions /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tamil-news" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><TamilNews /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/games" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><Games /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/progress" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><Progress /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/exercises" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><Exercises /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute requiredRole="teacher">
                  <DashboardLayout><Index /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <DashboardLayout><Profile /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/news-management" 
              element={
                <ProtectedRoute requiredRole="teacher">
                  <DashboardLayout><NewsManagement /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute requiredRole="teacher">
                  <DashboardLayout><Analytics /></DashboardLayout>
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
