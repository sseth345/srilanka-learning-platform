import { useState, useEffect } from "react";
import {
  BookOpen,
  Download,
  Plus,
  Search,
  Filter,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAuthToken } from "@/hooks/useAuthToken";
import { BookUploadDialog } from "@/components/BookUploadDialog";

interface Book {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: Date;
  downloads: number;
  views: number;
}

const Library = () => {
  const { userProfile } = useAuth();
  const { getAuthHeaders } = useAuthToken();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isTeacher = userProfile?.role === "teacher";

  const fetchBooks = async () => {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.append("category", selectedCategory);
    if (selectedSubject !== "all") params.append("subject", selectedSubject);
    if (searchTerm) params.append("search", searchTerm);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books?${params}`,
      {
        headers,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }

    const data = await response.json();
    setBooks(
      data.map((book: any) => ({
        ...book,
        createdAt: new Date(book.createdAt),
      }))
    );
  };

  useEffect(() => {
    setLoading(true);
    fetchBooks()
      .catch((error) => {
        console.error("Error fetching books:", error);
       
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedSubject]);

  const handleSearch = () => {
    fetchBooks();
  };

  const handleDownloadBook = async (book: Book) => {
    try {
      const headers = await getAuthHeaders();

      // Track download
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books/${book.id}/download`,
        {
          method: "POST",
          headers,
        }
      );

      // Download file
      const link = document.createElement("a");
      link.href = book.fileUrl;
      link.download = book.fileName.endsWith(".pdf")
        ? book.fileName
        : `${book.fileName}.pdf`;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started");
      fetchBooks(); // Refresh to update download count
    } catch (error) {
      console.error("Error downloading book:", error);
      toast.error("Failed to download book");
    }
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;

    try {
      setDeleting(true);
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/books/${bookToDelete}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete book");
      }

      toast.success("Book deleted successfully");
      setDeleteDialogOpen(false);
      setBookToDelete(null);
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete book");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (bookId: string) => {
    setBookToDelete(bookId);
    setDeleteDialogOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Get unique categories and subjects
  const categories = ["all", ...new Set(books.map((b) => b.category))];
  const subjects = ["all", ...new Set(books.map((b) => b.subject).filter(Boolean))];

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold mb-2">Library</h1>
          <p className="text-muted-foreground">
            {isTeacher
              ? "Upload and manage course materials"
              : "Access your course materials and books"}
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Book
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="shadow-elevated border-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Search books..."
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
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Grade Level" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub === "all" ? "All Levels" : sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {loading ? (
        <Card className="shadow-elevated">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading books...</p>
          </CardContent>
        </Card>
      ) : books.length === 0 ? (
        <Card className="shadow-elevated border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold mb-2">No books found</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {isTeacher
                ? "Upload your first book to get started"
                : "No books available at the moment"}
            </p>
            {isTeacher && (
              <Button className="mt-4" onClick={() => setUploadDialogOpen(true)}>
                Upload Book
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <Card
              key={book.id}
              className="shadow-elevated hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group border-2 hover:border-primary/20"
            >
              <div className="h-48 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300">
                <BookOpen className="h-20 w-20 text-primary/40 group-hover:text-primary/60 group-hover:scale-110 transition-all duration-300" />
              </div>
              <CardHeader className="pb-3 flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className="w-fit bg-secondary">{book.category}</Badge>
                  {book.subject && (
                    <Badge variant="outline" className="w-fit text-xs">
                      {book.subject}
                    </Badge>
                  )}
                </div>
                <h3 className="font-bold text-lg line-clamp-2 mb-1">{book.title}</h3>
                {book.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {book.description}
                  </p>
                )}
            </CardHeader>
            <CardContent className="pb-3">
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Uploaded by:</span>
                    <span className="font-medium">{book.uploadedByName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span>{formatFileSize(book.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{book.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Views:</span>
                    <span>{book.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Downloads:</span>
                    <span>{book.downloads || 0}</span>
                  </div>
              </div>
            </CardContent>
              <CardFooter className="gap-2 pt-0">
                <Button
                  variant="default"
                  className="flex-1"
                  size="sm"
                  onClick={() => handleDownloadBook(book)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                {isTeacher && book.uploadedBy === userProfile?.uid && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmDelete(book.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
          </Card>
        ))}
      </div>
      )}

      {/* Upload Dialog */}
      <BookUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={fetchBooks}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the book. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBook}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Library;
