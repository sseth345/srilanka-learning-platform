import { useState, useEffect } from 'react';
import { BookOpen, Video, TrendingUp, FileText, Clock, Award, Newspaper, MessageSquare, Flame } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { useAuthToken } from '@/hooks/useAuthToken';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalBooks: number;
  totalExercises: number;
  exercisesCompleted: number;
  averageScore: number;
  streakDays: number;
  totalLoginDays: number;
  newsRead: number;
  discussionsParticipated: number;
}

interface RecentSubmission {
  id: string;
  exerciseTitle: string;
  percentage: number;
  submittedAt: Date;
}

const Index = () => {
  const { user, userProfile } = useAuth();
  const { getAuthHeaders } = useAuthToken();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalExercises: 0,
    exercisesCompleted: 0,
    averageScore: 0,
    streakDays: 1,
    totalLoginDays: 1,
    newsRead: 0,
    discussionsParticipated: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);

  useEffect(() => {
    if (user && userProfile) {
      fetchDashboardData();
    }
  }, [user, userProfile]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();

      // Fetch exercises count
      const exercisesRes = await fetch('http://localhost:3001/api/exercises', { headers });
      const exercises = exercisesRes.ok ? await exercisesRes.json() : [];

      // Fetch student's submissions
      const submissionsRes = await fetch('http://localhost:3001/api/exercises/my/submissions', { headers });
      const submissions = submissionsRes.ok ? await submissionsRes.json() : [];

      // Fetch books count
      const booksRes = await fetch('http://localhost:3001/api/books', { headers });
      const books = booksRes.ok ? await booksRes.json() : [];

      // Fetch news count
      const newsRes = await fetch('http://localhost:3001/api/news', { headers });
      const newsData = newsRes.ok ? await newsRes.json() : { news: [] };

      // Fetch discussions count
      const discussionsRes = await fetch('http://localhost:3001/api/discussions', { headers });
      const discussions = discussionsRes.ok ? await discussionsRes.json() : [];

      // Calculate stats
      const averageScore = submissions.length > 0
        ? submissions.reduce((sum: number, s: any) => sum + s.percentage, 0) / submissions.length
        : 0;

      setStats({
        totalBooks: books.length,
        totalExercises: exercises.length,
        exercisesCompleted: submissions.length,
        averageScore: Math.round(averageScore),
        streakDays: userProfile?.stats?.streakDays || 1,
        totalLoginDays: userProfile?.stats?.totalLoginDays || 1,
        newsRead: newsData.news?.length || 0,
        discussionsParticipated: discussions.length,
      });

      // Get recent 3 submissions
      const recent = submissions
        .slice(0, 3)
        .map((sub: any) => ({
          id: sub.id,
          exerciseTitle: sub.exerciseTitle,
          percentage: sub.percentage,
          submittedAt: new Date(sub.submittedAt),
        }));
      setRecentSubmissions(recent);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isTeacher = userProfile?.role === 'teacher';

  return (
    <div className="space-y-8 animate-in">
      {/* Hero Section */}
      <div className="gradient-hero rounded-2xl p-8 shadow-glow text-white">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {userProfile?.displayName || 'User'}!
        </h1>
        <p className="text-lg opacity-90 mb-6">
          {isTeacher 
            ? 'Manage your courses and track student progress' 
            : 'Continue your learning journey today'}
        </p>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            size="lg" 
            className="shadow-elevated"
            onClick={() => navigate(isTeacher ? '/exercises' : '/progress')}
          >
            {isTeacher ? 'Create Exercise' : 'View Progress'}
          </Button>
          {!isTeacher && stats.exercisesCompleted > 0 && (
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 hover:bg-white/20 border-white/30"
              onClick={() => navigate('/exercises')}
            >
              Continue Learning
            </Button>
          )}
        </div>
      </div>

      {/* Stats for Students */}
      {!isTeacher && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Books Available"
            value={stats.totalBooks.toString()}
            icon={BookOpen}
            trend={`${stats.totalBooks} in library`}
            colorClass="text-primary"
          />
          <StatCard
            title="Exercises Done"
            value={stats.exercisesCompleted.toString()}
            icon={FileText}
            trend={`${stats.averageScore}% avg score`}
            colorClass="text-secondary"
          />
          <StatCard
            title="Login Streak"
            value={`${stats.streakDays} ${stats.streakDays === 1 ? 'day' : 'days'}`}
            icon={Flame}
            trend={stats.streakDays >= 7 ? 'Amazing! 🔥' : 'Keep going!'}
            colorClass="text-accent"
          />
          <StatCard
            title="Active Days"
            value={stats.totalLoginDays.toString()}
            icon={TrendingUp}
            trend="Total learning days"
            colorClass="text-purple-500"
          />
        </div>
      )}

      {/* Stats for Teachers */}
      {isTeacher && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Exercises Created"
            value={stats.totalExercises.toString()}
            icon={FileText}
            trend="Total exercises"
            colorClass="text-primary"
          />
          <StatCard
            title="Books Uploaded"
            value={stats.totalBooks.toString()}
            icon={BookOpen}
            trend="In library"
            colorClass="text-secondary"
          />
          <StatCard
            title="News Articles"
            value={stats.newsRead.toString()}
            icon={Newspaper}
            trend="Published articles"
            colorClass="text-accent"
          />
          <StatCard
            title="Discussions"
            value={stats.discussionsParticipated.toString()}
            icon={MessageSquare}
            trend="Active threads"
            colorClass="text-purple-500"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Students */}
        {!isTeacher && (
          <Card className="lg:col-span-2 shadow-elevated">
            <CardHeader>
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentSubmissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activity yet</p>
                  <p className="text-sm mt-2">Start by taking an exercise!</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate('/exercises')}
                  >
                    Browse Exercises
                  </Button>
                </div>
              ) : (
                recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{submission.exerciseTitle}</h4>
                        <Badge variant="outline">Exercise</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(submission.submittedAt, { addSuffix: true })}
                      </p>
                    </div>
                    <div className="w-24">
                      <div className="text-xs text-right mb-1 font-medium">
                        {Math.round(submission.percentage)}%
                      </div>
                      <div className="w-full bg-background rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            submission.percentage >= 80
                              ? 'bg-green-500'
                              : submission.percentage >= 60
                              ? 'bg-blue-500'
                              : 'bg-orange-500'
                          }`}
                          style={{ width: `${submission.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats - Teachers */}
        {isTeacher && (
          <Card className="lg:col-span-2 shadow-elevated">
            <CardHeader>
              <h3 className="font-bold text-xl flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Platform Overview
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.totalExercises}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Exercises Available
                  </div>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.totalBooks}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Books in Library
                  </div>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg border-2 border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.newsRead}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    News Articles
                  </div>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-lg border-2 border-orange-200">
                  <div className="text-3xl font-bold text-orange-600">
                    {stats.discussionsParticipated}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Discussions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="shadow-elevated gradient-card">
          <CardHeader>
            <h3 className="font-bold text-xl">Quick Actions</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isTeacher ? (
              <>
                <Button 
                  variant="default" 
                  className="w-full justify-start"
                  onClick={() => navigate('/library')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Library
                </Button>
                <Button 
                  variant="default" 
                  className="w-full justify-start"
                  onClick={() => navigate('/exercises')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Do Exercises
                </Button>
                <Button 
                  variant="default" 
                  className="w-full justify-start"
                  onClick={() => navigate('/tamil-news')}
                >
                  <Newspaper className="mr-2 h-4 w-4" />
                  Read News
                </Button>
                <Button 
                  variant="gradient" 
                  className="w-full justify-start"
                  onClick={() => navigate('/progress')}
                >
                  <Award className="mr-2 h-4 w-4" />
                  View Progress
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="default" 
                  className="w-full justify-start"
                  onClick={() => navigate('/exercises')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Create Exercise
                </Button>
                <Button 
                  variant="default" 
                  className="w-full justify-start"
                  onClick={() => navigate('/news-management')}
                >
                  <Newspaper className="mr-2 h-4 w-4" />
                  Manage News
                </Button>
                <Button 
                  variant="default" 
                  className="w-full justify-start"
                  onClick={() => navigate('/library')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Upload Book
                </Button>
                <Button 
                  variant="gradient" 
                  className="w-full justify-start"
                  onClick={() => navigate('/analytics')}
                >
                  <Award className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
