import { ArrowLeft, Award, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ExerciseResultsProps {
  exercise: {
    id: string;
    title: string;
    totalPoints: number;
    questions: Question[];
  };
  submission: {
    id: string;
    score: number;
    totalPoints: number;
    percentage: number;
    timeSpent: number;
    submittedAt: Date;
    answers: SubmissionAnswer[];
  };
  onBack: () => void;
}

interface Question {
  type: "mcq" | "true-false" | "multiple-select" | "short-answer";
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  correctAnswers?: number[];
  points: number;
}

interface SubmissionAnswer {
  questionId: number;
  studentAnswer: any;
  isCorrect: boolean;
  earnedPoints: number;
  needsManualGrading: boolean;
}

export const ExerciseResults = ({ exercise, submission, onBack }: ExerciseResultsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreGrade = (percentage: number) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const correctAnswers = submission.answers.filter((a) => a.isCorrect).length;
  const incorrectAnswers = submission.answers.filter((a) => !a.isCorrect && !a.needsManualGrading).length;
  const pendingAnswers = submission.answers.filter((a) => a.needsManualGrading).length;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Exercises
      </Button>

      {/* Score Card */}
      <Card className="shadow-elevated border-primary">
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
          <p className="text-sm text-muted-foreground">{exercise.title}</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Score */}
            <div className="text-center">
              <div className={cn("text-6xl font-bold mb-2", getScoreColor(submission.percentage))}>
                {submission.percentage.toFixed(0)}%
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1 mb-2">
                Grade: {getScoreGrade(submission.percentage)}
              </Badge>
              <p className="text-sm text-muted-foreground">
                {submission.score} / {submission.totalPoints} points
              </p>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Correct:</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">{correctAnswers}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Incorrect:</span>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="font-semibold">{incorrectAnswers}</span>
                </div>
              </div>
              {pendingAnswers > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending:</span>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold">{pendingAnswers}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Time */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time Spent:</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{formatTime(submission.timeSpent)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Questions:</span>
                <span className="font-semibold">{exercise.questions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Submitted:</span>
                <span className="font-semibold text-xs">
                  {new Date(submission.submittedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold">{submission.percentage.toFixed(1)}%</span>
            </div>
            <Progress value={submission.percentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Answer Review</h2>
        {exercise.questions.map((question, index) => {
          const answer = submission.answers[index];
          return (
            <Card key={index} className={cn(
              "shadow-elevated",
              answer.isCorrect && "border-green-500/50",
              !answer.isCorrect && !answer.needsManualGrading && "border-red-500/50",
              answer.needsManualGrading && "border-yellow-500/50"
            )}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Question {index + 1}
                      </span>
                      <Badge variant="secondary">{question.points} point{question.points > 1 && "s"}</Badge>
                      {answer.isCorrect && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Correct
                        </Badge>
                      )}
                      {!answer.isCorrect && !answer.needsManualGrading && (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Incorrect
                        </Badge>
                      )}
                      {answer.needsManualGrading && (
                        <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending Review
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium">{question.question}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Earned</p>
                    <p className="text-xl font-bold">
                      {answer.earnedPoints}/{question.points}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* MCQ / True-False */}
                {(question.type === "mcq" || question.type === "true-false") && (
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => {
                      const isStudentAnswer = answer.studentAnswer === optIndex;
                      const isCorrectAnswer = question.correctAnswer === optIndex;
                      
                      return (
                        <div
                          key={optIndex}
                          className={cn(
                            "p-3 rounded-lg border",
                            isCorrectAnswer && "bg-green-500/10 border-green-500",
                            isStudentAnswer && !isCorrectAnswer && "bg-red-500/10 border-red-500"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {isStudentAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-600" />}
                            <span>{option}</span>
                            {isStudentAnswer && <Badge variant="outline" className="ml-auto">Your answer</Badge>}
                            {isCorrectAnswer && <Badge variant="outline" className="ml-auto bg-green-500/10">Correct answer</Badge>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Multiple Select */}
                {question.type === "multiple-select" && (
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => {
                      const isStudentAnswer = (answer.studentAnswer || []).includes(optIndex);
                      const isCorrectAnswer = (question.correctAnswers || []).includes(optIndex);
                      
                      return (
                        <div
                          key={optIndex}
                          className={cn(
                            "p-3 rounded-lg border",
                            isCorrectAnswer && "bg-green-500/10 border-green-500",
                            isStudentAnswer && !isCorrectAnswer && "bg-red-500/10 border-red-500"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrectAnswer && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {isStudentAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-red-600" />}
                            <span>{option}</span>
                            {isStudentAnswer && <Badge variant="outline" className="ml-auto">Selected</Badge>}
                            {isCorrectAnswer && <Badge variant="outline" className="ml-auto bg-green-500/10">Correct</Badge>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer */}
                {question.type === "short-answer" && (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-semibold mb-1">Your Answer:</p>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="whitespace-pre-wrap">{answer.studentAnswer || "No answer provided"}</p>
                      </div>
                    </div>
                    {answer.needsManualGrading && (
                      <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-yellow-600">Pending Teacher Review</p>
                          <p className="text-muted-foreground">Your answer will be graded by your teacher.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

