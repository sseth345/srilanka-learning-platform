import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, BookOpen, Clock, FileText, Target, Flame, Trophy, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useAuthToken } from '@/hooks/useAuthToken';
import { format, differenceInDays } from 'date-fns';
import { getApiEndpoint } from '@/config/api';

interface Submission {
  id: string;
  exerciseTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  submittedAt: Date;
}

interface UserStats {
  totalLoginDays: number;
  streakDays: number;
  lastActiveDate: Date;
}

const Progress = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const { getAuthHeaders } = useAuthToken();

  const stats: UserStats = userProfile?.stats || {
    totalLoginDays: 1,
    streakDays: 1,
    lastActiveDate: new Date(),
  };

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(getApiEndpoint('/exercises/my/submissions'), {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      setSubmissions(
        data.map((sub: any) => ({
          ...sub,
          submittedAt: new Date(sub.submittedAt),
        }))
      );
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your progress',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalExercises = submissions.length;
  const averageScore = submissions.length > 0
    ? submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length
    : 0;
  const totalPoints = submissions.reduce((sum, s) => sum + s.score, 0);
  const maxPossiblePoints = submissions.reduce((sum, s) => sum + s.totalPoints, 0);

  // Recent submissions for the chart
  const recentSubmissions = submissions.slice(0, 7).reverse();
  const maxScore = Math.max(...recentSubmissions.map(s => s.percentage), 100);

  if (loading) {
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
          <Trophy className="h-8 w-8 text-primary" />
          My Progress
        </h1>
        <p className="text-muted-foreground">Track your learning journey and achievements</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Exercises Completed */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Exercises Done</span>
              <FileText className="h-5 w-5 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalExercises}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {totalPoints} / {maxPossiblePoints} points earned
            </p>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Average Score</span>
              <Target className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{Math.round(averageScore)}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              {averageScore >= 80 ? 'Excellent!' : averageScore >= 60 ? 'Good job!' : 'Keep practicing!'}
            </p>
          </CardContent>
        </Card>

        {/* Login Streak */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Login Streak</span>
              <Flame className="h-5 w-5 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.streakDays}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.streakDays === 1 ? 'Start your streak!' : 'days in a row 🔥'}
            </p>
          </CardContent>
        </Card>

        {/* Total Active Days */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Active Days</span>
              <Calendar className="h-5 w-5 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.totalLoginDays}</div>
            <p className="text-sm text-muted-foreground mt-1">
              days learning
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Exercise Scores */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Recent Exercise Scores
            </CardTitle>
            <CardDescription>Your last {recentSubmissions.length} exercise attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No exercises completed yet</p>
                <p className="text-sm mt-2">Start practicing to see your progress here!</p>
              </div>
            ) : (
              <div className="flex items-end justify-between gap-2 h-64">
                {recentSubmissions.map((sub, index) => (
                  <div key={sub.id} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-muted rounded-t-lg relative flex items-end" style={{ height: "100%" }}>
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 hover:opacity-80 ${
                          sub.percentage >= 80
                            ? 'bg-gradient-to-t from-green-500 to-green-600'
                            : sub.percentage >= 60
                            ? 'bg-gradient-to-t from-blue-500 to-blue-600'
                            : 'bg-gradient-to-t from-orange-500 to-orange-600'
                        }`}
                        style={{ height: `${(sub.percentage / maxScore) * 100}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold">{Math.round(sub.percentage)}%</div>
                      <div className="text-xs text-muted-foreground truncate w-full">
                        {format(sub.submittedAt, 'MMM dd')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Streak Achievement */}
            {stats.streakDays >= 7 && (
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border-2 border-orange-200">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="font-semibold">Week Warrior</div>
                  <div className="text-xs text-muted-foreground">7+ day streak!</div>
                </div>
              </div>
            )}

            {/* Exercise Achievement */}
            {totalExercises >= 10 && (
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border-2 border-blue-200">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">Practice Master</div>
                  <div className="text-xs text-muted-foreground">Completed 10+ exercises</div>
                </div>
              </div>
            )}

            {/* High Score Achievement */}
            {averageScore >= 80 && (
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border-2 border-green-200">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">Top Performer</div>
                  <div className="text-xs text-muted-foreground">80%+ average score</div>
                </div>
              </div>
            )}

            {/* Active Learner */}
            {stats.totalLoginDays >= 30 && (
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border-2 border-purple-200">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">Dedicated Learner</div>
                  <div className="text-xs text-muted-foreground">30+ active days</div>
                </div>
              </div>
            )}

            {/* No achievements yet */}
            {stats.streakDays < 7 && totalExercises < 10 && averageScore < 80 && stats.totalLoginDays < 30 && (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Keep learning to unlock achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions List */}
      {submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Exercise Attempts</CardTitle>
            <CardDescription>Your latest quiz submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {submissions.slice(0, 10).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{sub.exerciseTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(sub.submittedAt, 'PPp')}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Score</div>
                      <div className="font-bold">
                        {sub.score} / {sub.totalPoints}
                      </div>
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        sub.percentage >= 80
                          ? 'text-green-600'
                          : sub.percentage >= 60
                          ? 'text-blue-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {Math.round(sub.percentage)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Progress;
