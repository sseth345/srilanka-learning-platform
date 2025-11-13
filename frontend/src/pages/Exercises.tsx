import { useState, useEffect } from "react";
import { Plus, Search, Filter, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { CreateExerciseDialog } from "@/components/CreateExerciseDialog";
import { ExerciseCard } from "@/components/ExerciseCard";
import { TakeExercise } from "@/components/TakeExercise";
import { ExerciseResults } from "@/components/ExerciseResults";

const Exercises = () => {
  const { userProfile, getIdToken } = useAuth();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "take" | "results">("list");
  const [categories, setCategories] = useState<string[]>([]);

  const isTeacher = userProfile?.role === "teacher";

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();

      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (selectedDifficulty !== "all") params.append("difficulty", selectedDifficulty);
      if (isTeacher && statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/exercises?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exercises");
      }

      const data = await response.json();
      const formattedExercises = data.map((ex: any) => ({
        ...ex,
        dueDate: ex.dueDate ? new Date(ex.dueDate) : null,
      }));

      // Filter by search term
      const filtered = searchTerm
        ? formattedExercises.filter((ex: any) =>
            ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ex.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : formattedExercises;

      setExercises(filtered);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error("Failed to load exercises");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = await getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/exercises/meta/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(["all", ...data]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [selectedCategory, selectedDifficulty, statusFilter]);

  const handleSearch = () => {
    fetchExercises();
  };

  const handleExerciseClick = async (exerciseId: string) => {
    try {
      const token = await getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/exercises/${exerciseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exercise");
      }

      const data = await response.json();
      setSelectedExercise(data);

      if (isTeacher) {
        // Teachers see details/edit view (not implemented yet)
        toast.info("Teacher exercise management coming soon!");
      } else {
        // Students take quiz or see results
        if (data.submission) {
          setViewMode("results");
        } else {
          setViewMode("take");
        }
      }
    } catch (error) {
      console.error("Error fetching exercise:", error);
      toast.error("Failed to load exercise");
    }
  };

  const handlePublishToggle = async (exerciseId: string, published: boolean) => {
    try {
      const token = await getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/exercises/${exerciseId}/publish`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ published }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update exercise");
      }

      toast.success(published ? "Exercise published!" : "Exercise unpublished!");
      fetchExercises();
    } catch (error) {
      console.error("Error updating exercise:", error);
      toast.error("Failed to update exercise");
    }
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedExercise(null);
    fetchExercises();
  };

  // Take Exercise View
  if (viewMode === "take" && selectedExercise) {
    return (
      <TakeExercise
        exercise={selectedExercise}
        onBack={handleBackToList}
        onSubmit={handleBackToList}
      />
    );
  }

  // Results View
  if (viewMode === "results" && selectedExercise && selectedExercise.submission) {
    return (
      <ExerciseResults
        exercise={selectedExercise}
        submission={selectedExercise.submission}
        onBack={handleBackToList}
      />
    );
  }

  // List View
  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isTeacher ? "Manage Quizzes" : "Practice Exercises"}
          </h1>
          <p className="text-muted-foreground">
            {isTeacher
              ? "Create and manage quizzes for your students"
              : "Test your knowledge with interactive quizzes"}
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="shadow-elevated">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Status Tabs for Teachers */}
            {isTeacher && (
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="grid w-full md:w-auto grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} variant="default">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercises Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : exercises.length === 0 ? (
        <Card className="shadow-elevated">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No exercises found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {isTeacher
                ? "Create your first quiz to get started"
                : "No quizzes available at the moment"}
            </p>
            {isTeacher && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isTeacher={isTeacher}
              onClick={() => handleExerciseClick(exercise.id)}
              onPublish={(published) => handlePublishToggle(exercise.id, published)}
            />
          ))}
        </div>
      )}

      {/* Create Exercise Dialog */}
      <CreateExerciseDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchExercises}
      />
    </div>
  );
};

export default Exercises;
