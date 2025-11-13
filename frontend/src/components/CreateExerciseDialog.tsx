import { useState } from "react";
import { Plus, Trash2, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface CreateExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Question {
  type: "mcq" | "true-false" | "multiple-select" | "short-answer";
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  correctAnswers?: number[];
  points: number;
}

const categories = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Tamil Language",
  "History",
  "Geography",
  "General",
];

export const CreateExerciseDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateExerciseDialogProps) => {
  const { getIdToken } = useAuth();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    difficulty: "medium",
    timeLimit: "",
    dueDate: "",
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    type: "mcq",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    points: 1,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "General",
      difficulty: "medium",
      timeLimit: "",
      dueDate: "",
    });
    setQuestions([]);
    setCurrentQuestion({
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
    });
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (currentQuestion.type === "mcq" || currentQuestion.type === "multiple-select") {
      const validOptions = currentQuestion.options?.filter((opt) => opt.trim());
      if (!validOptions || validOptions.length < 2) {
        toast.error("Please provide at least 2 options");
        return;
      }
    }

    setQuestions([...questions, { ...currentQuestion }]);
    setCurrentQuestion({
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
    });
    toast.success("Question added");
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    toast.success("Question removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setCreating(true);

    try {
      const token = await getIdToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/exercises`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
            dueDate: formData.dueDate || null,
            questions,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create exercise");
      }

      toast.success("Exercise created successfully!");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating exercise:", error);
      toast.error(error.message || "Failed to create exercise");
    } finally {
      setCreating(false);
    }
  };

  const updateCurrentQuestionOption = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...(currentQuestion.options || []), ""],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = currentQuestion.options?.filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Exercise</DialogTitle>
          <DialogDescription>
            Create a new exercise with multiple choice, true/false, or short answer questions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Exercise Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Algebra Basics Quiz"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this exercise covers..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                disabled={creating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  disabled={creating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    setFormData({ ...formData, difficulty: value })
                  }
                  disabled={creating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  placeholder="Optional"
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, timeLimit: e.target.value })
                  }
                  disabled={creating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  disabled={creating}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Question Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Questions</h3>
              <span className="text-sm text-muted-foreground">
                {questions.length} question{questions.length !== 1 && "s"} added
              </span>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">New Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                      value={currentQuestion.type}
                      onValueChange={(value: any) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          type: value,
                          options: value === "true-false" ? ["True", "False"] : ["", "", "", ""],
                          correctAnswer: 0,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="true-false">True/False</SelectItem>
                        <SelectItem value="multiple-select">Multiple Select</SelectItem>
                        <SelectItem value="short-answer">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Points</Label>
                    <Input
                      type="number"
                      min="1"
                      value={currentQuestion.points}
                      onChange={(e) =>
                        setCurrentQuestion({
                          ...currentQuestion,
                          points: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Question *</Label>
                  <Textarea
                    placeholder="Enter your question..."
                    value={currentQuestion.question}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, question: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                {(currentQuestion.type === "mcq" ||
                  currentQuestion.type === "multiple-select" ||
                  currentQuestion.type === "true-false") && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {currentQuestion.type === "mcq" && (
                      <RadioGroup
                        value={String(currentQuestion.correctAnswer)}
                        onValueChange={(value) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswer: parseInt(value),
                          })
                        }
                      >
                        {currentQuestion.options?.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <RadioGroupItem value={String(index)} />
                            <Input
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e) =>
                                updateCurrentQuestionOption(index, e.target.value)
                              }
                              className="flex-1"
                            />
                            {currentQuestion.type !== "true-false" &&
                              (currentQuestion.options?.length || 0) > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {currentQuestion.type === "true-false" && (
                      <RadioGroup
                        value={String(currentQuestion.correctAnswer)}
                        onValueChange={(value) =>
                          setCurrentQuestion({
                            ...currentQuestion,
                            correctAnswer: parseInt(value),
                          })
                        }
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="0" />
                          <span>True</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="1" />
                          <span>False</span>
                        </div>
                      </RadioGroup>
                    )}

                    {currentQuestion.type === "multiple-select" && (
                      <div className="space-y-2">
                        {currentQuestion.options?.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Checkbox
                              checked={(currentQuestion.correctAnswers || []).includes(index)}
                              onCheckedChange={(checked) => {
                                const current = currentQuestion.correctAnswers || [];
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  correctAnswers: checked
                                    ? [...current, index]
                                    : current.filter((i) => i !== index),
                                });
                              }}
                            />
                            <Input
                              placeholder={`Option ${index + 1}`}
                              value={option}
                              onChange={(e) =>
                                updateCurrentQuestionOption(index, e.target.value)
                              }
                              className="flex-1"
                            />
                            {(currentQuestion.options?.length || 0) > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {currentQuestion.type !== "true-false" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>
                )}

                {currentQuestion.type === "short-answer" && (
                  <p className="text-sm text-muted-foreground">
                    Students will type their answer. You'll need to grade these manually.
                  </p>
                )}

                <Button type="button" onClick={handleAddQuestion} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question to Exercise
                </Button>
              </CardContent>
            </Card>

            {/* Added Questions List */}
            {questions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Added Questions:</h4>
                {questions.map((q, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">Q{index + 1}.</span>
                            <span className="text-sm text-muted-foreground">
                              ({q.type.replace("-", " ")} • {q.points} point{q.points > 1 && "s"})
                            </span>
                          </div>
                          <p className="text-sm">{q.question}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating || questions.length === 0}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Exercise
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

