import { useState } from "react";
import { BookOpen, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, GraduationCap, UserCircle, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<"student" | "teacher">("student");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register form state - Student
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentConfirmPassword, setStudentConfirmPassword] = useState("");
  const [studentAgreeTerms, setStudentAgreeTerms] = useState(false);

  // Register form state - Teacher
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPhone, setTeacherPhone] = useState("");
  const [teacherInstitution, setTeacherInstitution] = useState("");
  const [teacherSubjects, setTeacherSubjects] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherConfirmPassword, setTeacherConfirmPassword] = useState("");
  const [teacherAgreeTerms, setTeacherAgreeTerms] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!loginEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    
    try {
      await signIn(loginEmail, loginPassword);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName || !studentEmail || !studentPassword || !studentConfirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!studentEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    if (studentPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (studentPassword !== studentConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!studentAgreeTerms) {
      toast.error("Please agree to the Terms and Conditions");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(studentEmail, studentPassword, studentName, "student");
      toast.success("Welcome to EduLearn! 🎓");
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacherName || !teacherEmail || !teacherPhone || !teacherInstitution || !teacherPassword || !teacherConfirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!teacherEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    if (teacherPhone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (teacherPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (teacherPassword !== teacherConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!teacherAgreeTerms) {
      toast.error("Please agree to the Terms and Conditions");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(teacherEmail, teacherPassword, teacherName, "teacher");
      toast.success("Welcome to EduLearn, Teacher! 👨‍🏫");
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true});
    } catch (error) {
      console.error("Google sign in failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginEmail) {
      toast.error("Please enter your email address first");
      return;
    }

    try {
      await resetPassword(loginEmail);
    } catch (error) {
      console.error("Password reset failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 animate-in">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="gradient-hero p-3 rounded-xl shadow-glow">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Sri Lankan Learning Platform
              </h1>
            </div>
            <h2 className="text-3xl font-bold">
              Welcome to the Future of Learning
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of students and teachers in an interactive learning experience
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "📚", text: "Digital Library", desc: "Thousands of books" },
              { icon: "💬", text: "Discussion Forums", desc: "Ask & Learn" },
              { icon: "📝", text: "Practice Exercises", desc: "Test your skills" },
              { icon: "🎥", text: "Video Lectures", desc: "HD quality content" },
              { icon: "📰", text: "Tamil News", desc: "Language practice" },
              { icon: "📊", text: "Track Progress", desc: "Detailed analytics" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 p-4 bg-card rounded-lg shadow-elevated hover:shadow-glow transition-all"
              >
                <div className="text-3xl">{feature.icon}</div>
                <div>
                  <p className="font-semibold">{feature.text}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Auth forms */}
        <Card className="shadow-elevated animate-in">
          <CardHeader className="space-y-1">
            <div className="flex lg:hidden items-center gap-2 mb-4">
              <div className="gradient-hero p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">EduLearn</span>
            </div>
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>
              Choose your account type and continue your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <label htmlFor="remember" className="text-sm font-medium">
                        Remember me
                      </label>
                    </div>
                    <Button 
                      type="button"
                      variant="link" 
                      className="px-0 text-sm"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    variant="gradient"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        Login
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  disabled={isLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                {/* Account Type Selector */}
                <div className="space-y-3">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Card
                      className={`cursor-pointer transition-all ${
                        accountType === "student"
                          ? "border-primary shadow-glow"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setAccountType("student")}
                    >
                      <CardContent className="pt-6 text-center">
                        <UserCircle className="h-12 w-12 mx-auto mb-2 text-primary" />
                        <h3 className="font-semibold">Student</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Learn and grow
                        </p>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer transition-all ${
                        accountType === "teacher"
                          ? "border-primary shadow-glow"
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setAccountType("teacher")}
                    >
                      <CardContent className="pt-6 text-center">
                        <GraduationCap className="h-12 w-12 mx-auto mb-2 text-primary" />
                        <h3 className="font-semibold">Teacher</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Teach and inspire
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* Student Registration Form */}
                {accountType === "student" && (
                  <form onSubmit={handleStudentRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="student-name"
                          placeholder="Enter your full name"
                          className="pl-10"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="student-email"
                          type="email"
                          placeholder="your.email@example.com"
                          className="pl-10"
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-password">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="student-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className="pl-10 pr-10"
                          value={studentPassword}
                          onChange={(e) => setStudentPassword(e.target.value)}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="student-confirm-password">Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="student-confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-10"
                          value={studentConfirmPassword}
                          onChange={(e) => setStudentConfirmPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="student-terms"
                        checked={studentAgreeTerms}
                        onCheckedChange={(checked) => setStudentAgreeTerms(checked as boolean)}
                      />
                      <label htmlFor="student-terms" className="text-sm leading-none">
                        I agree to the Terms and Conditions and Privacy Policy
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      variant="gradient"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Student Account
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                )}

                {/* Teacher Registration Form */}
                {accountType === "teacher" && (
                  <form onSubmit={handleTeacherRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="teacher-name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="teacher-name"
                          placeholder="Enter your full name"
                          className="pl-10"
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="teacher-email"
                          type="email"
                          placeholder="teacher.email@institution.edu"
                          className="pl-10"
                          value={teacherEmail}
                          onChange={(e) => setTeacherEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="teacher-phone"
                          type="tel"
                          placeholder="+94 XX XXX XXXX"
                          className="pl-10"
                          value={teacherPhone}
                          onChange={(e) => setTeacherPhone(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-institution">Institution/School *</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="teacher-institution"
                          placeholder="Your school or institution name"
                          className="pl-10"
                          value={teacherInstitution}
                          onChange={(e) => setTeacherInstitution(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-subjects">Subjects (Optional)</Label>
                      <Input
                        id="teacher-subjects"
                        placeholder="e.g., Mathematics, Physics"
                        value={teacherSubjects}
                        onChange={(e) => setTeacherSubjects(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-password">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="teacher-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className="pl-10 pr-10"
                          value={teacherPassword}
                          onChange={(e) => setTeacherPassword(e.target.value)}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="teacher-confirm-password">Confirm Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="teacher-confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-10"
                          value={teacherConfirmPassword}
                          onChange={(e) => setTeacherConfirmPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="teacher-terms"
                        checked={teacherAgreeTerms}
                        onCheckedChange={(checked) => setTeacherAgreeTerms(checked as boolean)}
                      />
                      <label htmlFor="teacher-terms" className="text-sm leading-none">
                        I agree to the Terms and Conditions and Privacy Policy. I confirm that I am an authorized educator.
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      variant="gradient"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Teacher Account
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or register with</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  disabled={isLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
