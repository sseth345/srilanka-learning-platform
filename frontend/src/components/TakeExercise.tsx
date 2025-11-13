import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Award, Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface TakeExerciseProps {
  exercise: {
    id: string;
    title: string;
    description: string;
    timeLimit: number | null;
    totalPoints: number;
    questions: Question[];
  };
  onBack: () => void;
  onSubmit: () => void;
}

interface Question {
  type: "mcq" | "true-false" | "multiple-select" | "short-answer";
  question: string;
  options?: string[];
  points: number;
}

export const TakeExercise = ({ exercise, onBack, onSubmit }: TakeExerciseProps) => {
  const { getIdToken } = useAuth();
  const [answers, setAnswers] = useState<any[]>(Array(exercise.questions.length).fill(null));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    exercise.timeLimit ? exercise.timeLimit * 60 : null
  );
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionIndex: number, answer: any) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleAutoSubmit = async () => {
    toast.error("Time's up! Submitting your quiz...");
    await submitExercise();
  };

  const submitExercise = async () => {
    setIsSubmitting(true);

    try {
      const token = await getIdToken();
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/exercises/${exercise.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers,
            timeSpent,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit exercise");
      }

      const data = await response.json();
      toast.success(`Quiz submitted! You scored ${data.percentage.toFixed(0)}%`);
      onSubmit();
    } catch (error: any) {
      console.error("Error submitting exercise:", error);
      toast.error(error.message || "Failed to submit exercise");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitClick = () => {
    const unanswered = answers.filter((a) => a === null || a === "").length;
    if (unanswered > 0) {
      toast.warning(`You have ${unanswered} unanswered question(s)`);
    }
    setSubmitDialogOpen(true);
  };

  const answeredCount = answers.filter((a) => a !== null && a !== "").length;
  const progress = (answeredCount / exercise.questions.length) * 100;

  const question = exercise.questions[currentQuestion];

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <Badge variant={timeLeft < 300 ? "destructive" : "secondary"} className="text-lg px-4 py-2">
              <Clock className="mr-2 h-4 w-4" />
              {formatTime(timeLeft)}
            </Badge>
          )}
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Award className="mr-2 h-4 w-4" />
            {exercise.totalPoints} pts
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">
                {answeredCount}/{exercise.questions.length} answered
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="shadow-elevated">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-base text-muted-foreground mb-2">
                Question {currentQuestion + 1} of {exercise.questions.length}
              </CardTitle>
              <h2 className="text-xl font-bold">{question.question}</h2>
            </div>
            <Badge variant="secondary">{question.points} point{question.points > 1 && "s"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* MCQ */}
          {question.type === "mcq" && (
            <RadioGroup
              value={String(answers[currentQuestion] ?? "")}
              onValueChange={(value) => handleAnswerChange(currentQuestion, parseInt(value))}
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                  <RadioGroupItem value={String(index)} id={`q${currentQuestion}-${index}`} />
                  <Label htmlFor={`q${currentQuestion}-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* True/False */}
          {question.type === "true-false" && (
            <RadioGroup
              value={String(answers[currentQuestion] ?? "")}
              onValueChange={(value) => handleAnswerChange(currentQuestion, parseInt(value))}
            >
              {["True", "False"].map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                  <RadioGroupItem value={String(index)} id={`q${currentQuestion}-${index}`} />
                  <Label htmlFor={`q${currentQuestion}-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Multiple Select */}
          {question.type === "multiple-select" && (
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                  <Checkbox
                    id={`q${currentQuestion}-${index}`}
                    checked={(answers[currentQuestion] || []).includes(index)}
                    onCheckedChange={(checked) => {
                      const current = answers[currentQuestion] || [];
                      const updated = checked
                        ? [...current, index]
                        : current.filter((i: number) => i !== index);
                      handleAnswerChange(currentQuestion, updated);
                    }}
                  />
                  <Label htmlFor={`q${currentQuestion}-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {/* Short Answer */}
          {question.type === "short-answer" && (
            <Textarea
              placeholder="Type your answer here..."
              value={answers[currentQuestion] || ""}
              onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
              rows={5}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {exercise.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                index === currentQuestion
                  ? "bg-primary text-primary-foreground"
                  : answers[index] !== null && answers[index] !== ""
                  ? "bg-green-500 text-white"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === exercise.questions.length - 1 ? (
          <Button onClick={handleSubmitClick} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Quiz
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(Math.min(exercise.questions.length - 1, currentQuestion + 1))}
          >
            Next
          </Button>
        )}
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              {answeredCount === exercise.questions.length ? (
                "You've answered all questions. Are you ready to submit?"
              ) : (
                <div className="space-y-2">
                  <p>You have {exercise.questions.length - answeredCount} unanswered question(s).</p>
                  <p className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    Unanswered questions will be marked as incorrect.
                  </p>
                </div>
              )}
              <p className="mt-2 font-semibold">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitExercise}
              disabled={isSubmitting}
              className="bg-primary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Yes, Submit"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

