import { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, Newspaper, MessageSquare, TrendingUp, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuthToken } from '@/hooks/useAuthToken';
import { format } from 'date-fns';

interface OverviewStats {
  users: {
    total: number;
    students: number;
    teachers: number;
    active: number;
  };
  exercises: {
    total: number;
    published: number;
    submissions: number;
    averageScore: number;
  };
  news: {
    total: number;
    published: number;
    views: number;
    likes: number;
  };
  discussions: {
    total: number;
  };
  books: {
    total: number;
  };
}

interface UserActivity {
  displayName: string;
  email: string;
  role: string;
  lastLoginAt: Date;
  stats?: {
    totalLoginDays: number;
    streakDays: number;
  };
}

interface ExercisePerformance {
  title: string;
  category: string;
  totalAttempts: number;
  averageScore: number;
}

const Analytics = () => {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [exercisePerf, setExercisePerf] = useState<ExercisePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const { getAuthHeaders } = useAuthToken();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();

      // Fetch overview stats
      const overviewRes = await fetch('http://localhost:3001/api/analytics/overview', { headers });
      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setOverview(data);
      }

      // Fetch user activity
      const activityRes = await fetch('http://localhost:3001/api/analytics/user-activity?limit=10', { headers });
      if (activityRes.ok) {
        const data = await activityRes.json();
        setUserActivity(
          data.map((u: any) => ({
            ...u,
            lastLoginAt: new Date(u.lastLoginAt),
          }))
        );
      }

      // Fetch exercise performance
      const exerciseRes = await fetch('http://localhost:3001/api/analytics/exercise-performance', { headers });
      if (exerciseRes.ok) {
        const data = await exerciseRes.json();
        setExercisePerf(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">Platform insights and statistics</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">Total Users</span>
              <Users className="h-5 w-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{overview.users.total}</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Students</span>
                <span className="font-semibold">{overview.users.students}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teachers</span>
                <span className="font-semibold">{overview.users.teachers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active (7d)</span>
                <span className="font-semibold text-green-600">{overview.users.active}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercises Card */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">Exercises</span>
              <Award className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{overview.exercises.total}</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Published</span>
                <span className="font-semibold">{overview.exercises.published}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submissions</span>
                <span className="font-semibold">{overview.exercises.submissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Score</span>
                <span className="font-semibold text-green-600">{overview.exercises.averageScore}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* News Card */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">News Articles</span>
              <Newspaper className="h-5 w-5 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{overview.news.total}</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Published</span>
                <span className="font-semibold">{overview.news.published}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Views</span>
                <span className="font-semibold">{overview.news.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Likes</span>
                <span className="font-semibold text-pink-600">{overview.news.likes}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Card */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">Content</span>
              <BookOpen className="h-5 w-5 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{overview.books.total + overview.discussions.total}</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Books</span>
                <span className="font-semibold">{overview.books.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discussions</span>
                <span className="font-semibold">{overview.discussions.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Items</span>
                <span className="font-semibold text-orange-600">{overview.books.total + overview.discussions.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent User Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent User Activity
            </CardTitle>
            <CardDescription>Last 10 active users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No activity data</p>
              ) : (
                userActivity.map((user, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <div className="font-medium">{user.displayName || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium capitalize">
                        <span className={user.role === 'teacher' ? 'text-primary' : 'text-blue-600'}>
                          {user.role}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(user.lastLoginAt, 'MMM dd, HH:mm')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Exercises */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Exercises
            </CardTitle>
            <CardDescription>Most attempted exercises</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exercisePerf.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No exercise data</p>
              ) : (
                exercisePerf.map((exercise, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{exercise.title}</div>
                        <div className="text-xs text-muted-foreground">{exercise.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">{exercise.totalAttempts}</div>
                        <div className="text-xs text-muted-foreground">attempts</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${exercise.averageScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-green-600">{Math.round(exercise.averageScore)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Student Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Rate</span>
                <span className="text-lg font-bold text-green-600">
                  {overview.users.total > 0
                    ? Math.round((overview.users.active / overview.users.total) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${overview.users.total > 0 ? (overview.users.active / overview.users.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exercise Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Score</span>
                <span className="text-lg font-bold text-blue-600">{overview.exercises.averageScore}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${overview.exercises.averageScore}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">News Engagement</span>
                <span className="text-lg font-bold text-purple-600">
                  {overview.news.total > 0 ? Math.round(overview.news.views / overview.news.total) : 0}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Avg views per article</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

