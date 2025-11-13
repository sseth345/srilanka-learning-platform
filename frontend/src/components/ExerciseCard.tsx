import { Clock, Award, Target, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    timeLimit: number | null;
    dueDate: Date | null;
    totalPoints: number;
    questions: any[];
    published: boolean;
    totalAttempts: number;
    averageScore: number;
    submission?: any;
  };
  isTeacher: boolean;
  onClick: () => void;
  onPublish?: (published: boolean) => void;
  onDelete?: () => void;
}

export const ExerciseCard = ({
  exercise,
  isTeacher,
  onClick,
  onPublish,
  onDelete,
}: ExerciseCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "hard":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const isOverdue = exercise.dueDate && new Date(exercise.dueDate) < new Date();
  const isCompleted = exercise.submission !== undefined && exercise.submission !== null;

  return (
    <Card
      className={cn(
        "shadow-elevated hover:shadow-glow transition-all duration-300 cursor-pointer",
        !exercise.published && isTeacher && "border-dashed border-2 opacity-75"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary">{exercise.category}</Badge>
              <Badge className={getDifficultyColor(exercise.difficulty)}>
                {exercise.difficulty}
              </Badge>
              {!exercise.published && isTeacher && (
                <Badge variant="outline">Draft</Badge>
              )}
              {isCompleted && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              {isOverdue && !isCompleted && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-lg line-clamp-2">{exercise.title}</h3>
            {exercise.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {exercise.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {exercise.questions.length} Questions
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {exercise.totalPoints} Points
            </span>
          </div>
          {exercise.timeLimit && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {exercise.timeLimit} min
              </span>
            </div>
          )}
          {exercise.dueDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={cn(
                "text-muted-foreground",
                isOverdue && "text-destructive"
              )}>
                {new Date(exercise.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {isTeacher && exercise.published && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Attempts:</span>
              <span className="font-semibold">{exercise.totalAttempts}</span>
            </div>
            {exercise.totalAttempts > 0 && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Avg Score:</span>
                <span className="font-semibold">{exercise.averageScore.toFixed(1)}%</span>
              </div>
            )}
          </div>
        )}

        {isCompleted && exercise.submission && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Score:</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">
                  {exercise.submission.percentage.toFixed(0)}%
                </span>
                <p className="text-xs text-muted-foreground">
                  {exercise.submission.score}/{exercise.submission.totalPoints} points
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {isTeacher ? (
          <div className="flex gap-2 w-full">
            <Button
              variant="default"
              className="flex-1"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {exercise.published ? "View Details" : "Edit & Publish"}
            </Button>
            {!exercise.published && onPublish && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish(true);
                }}
              >
                Publish
              </Button>
            )}
            {exercise.published && onPublish && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish(false);
                }}
              >
                Unpublish
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant={isCompleted ? "outline" : "default"}
            className="w-full"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {isCompleted ? "View Results" : "Start Quiz"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

