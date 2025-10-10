import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, LogOut, GraduationCap, Building2, FileText, TrendingUp, Users, Calendar, BarChart3, Brain, Target, Code2, User, Megaphone } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    drives: 0,
    applications: 0,
    assessments: 0,
    companies: 0
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // Get user role from user_roles table (secure)
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      const fullProfile = { ...profileData, role: roleData?.role || 'student' };
      setProfile(fullProfile);

      // Fetch stats
      const { count: drivesCount } = await supabase
        .from("placement_drives")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const { count: companiesCount } = await supabase
        .from("companies")
        .select("*", { count: "exact", head: true });

      const { count: assessmentsCount } = await supabase
        .from("assessments")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (roleData?.role === "student") {
        const { data: studentProfile } = await supabase
          .from("student_profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (studentProfile) {
          const { count: appsCount } = await supabase
            .from("student_applications")
            .select("*", { count: "exact", head: true })
            .eq("student_id", studentProfile.id);

          setStats({
            drives: drivesCount || 0,
            applications: appsCount || 0,
            assessments: assessmentsCount || 0,
            companies: companiesCount || 0
          });
        }
      } else {
        const { count: appsCount } = await supabase
          .from("student_applications")
          .select("*", { count: "exact", head: true });

        setStats({
          drives: drivesCount || 0,
          applications: appsCount || 0,
          assessments: assessmentsCount || 0,
          companies: companiesCount || 0
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PlacementPro</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-medium">{profile?.full_name}</div>
              <div className="text-sm text-muted-foreground capitalize">{profile?.role}</div>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            {profile?.role === 'admin' 
              ? 'Manage placements and track student progress'
              : 'Track your placement journey and prepare for success'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-glow transition-all duration-300 border-2 hover:border-primary/20 animate-scale-in bg-gradient-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Drives</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <Building2 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">{stats.drives}</div>
              <p className="text-xs text-muted-foreground">Open opportunities</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300 border-2 hover:border-secondary/20 animate-scale-in bg-gradient-card" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {profile?.role === "admin" ? "Total Applications" : "My Applications"}
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-secondary flex items-center justify-center shadow-glow">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent">{stats.applications}</div>
              <p className="text-xs text-muted-foreground">
                {profile?.role === "admin" ? "From all students" : "Submitted"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300 border-2 hover:border-success/20 animate-scale-in bg-gradient-card" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-success flex items-center justify-center shadow-glow">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-success bg-clip-text text-transparent">{stats.assessments}</div>
              <p className="text-xs text-muted-foreground">Available tests</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-glow transition-all duration-300 border-2 hover:border-info/20 animate-scale-in bg-gradient-card" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-info flex items-center justify-center shadow-glow">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-info">{stats.companies}</div>
              <p className="text-xs text-muted-foreground">Recruiting now</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {profile?.role === "student" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 bg-gradient-card"
              onClick={() => navigate("/student/drives")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Placement Drives</CardTitle>
                <CardDescription>Browse and apply to open positions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-primary shadow-lg hover:shadow-glow">
                  Explore Drives
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-secondary/20 bg-gradient-card"
              onClick={() => navigate("/student/applications")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-glow mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track your application status</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-secondary shadow-lg hover:shadow-glow">
                  View Applications
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-success/20 bg-gradient-card"
              onClick={() => navigate("/student/assessments")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-glow mb-4">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>Take tests and improve skills</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-success shadow-lg hover:shadow-glow">
                  Start Learning
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-info/20 bg-gradient-card"
              onClick={() => navigate("/student/mock-interview")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-info flex items-center justify-center shadow-glow mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Mock Interview</CardTitle>
                <CardDescription>Practice interview skills</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-info shadow-lg hover:shadow-glow">
                  Start Interview
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 bg-gradient-card"
              onClick={() => navigate("/student/aptitude-test")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Aptitude Test</CardTitle>
                <CardDescription>Test your aptitude skills</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-primary shadow-lg hover:shadow-glow">
                  Take Test
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-secondary/20 bg-gradient-card"
              onClick={() => navigate("/student/code-compiler")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-glow mb-4">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Code Compiler</CardTitle>
                <CardDescription>Write and run code</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-secondary shadow-lg hover:shadow-glow">
                  Open Compiler
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-success/20 bg-gradient-card"
              onClick={() => navigate("/student/performance")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-glow mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Performance</CardTitle>
                <CardDescription>View analytics & reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-success shadow-lg hover:shadow-glow">
                  View Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-info/20 bg-gradient-card"
              onClick={() => navigate("/student/profile")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-info flex items-center justify-center shadow-glow mb-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Update your details</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-info shadow-lg hover:shadow-glow">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-warning/20 bg-gradient-card"
              onClick={() => navigate("/student/announcements")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center shadow-glow mb-4">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Announcements</CardTitle>
                <CardDescription>View campus notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-warning shadow-lg hover:shadow-glow">
                  View Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 bg-gradient-card"
              onClick={() => navigate("/admin/companies")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Manage Companies</CardTitle>
                <CardDescription>Add and edit company profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-primary shadow-lg hover:shadow-glow">
                  Manage Companies
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-secondary/20 bg-gradient-card"
              onClick={() => navigate("/admin/drives")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center shadow-glow mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Placement Drives</CardTitle>
                <CardDescription>Create and manage drives</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-secondary shadow-lg hover:shadow-glow">
                  Manage Drives
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-success/20 bg-gradient-card"
              onClick={() => navigate("/admin/applications")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-success flex items-center justify-center shadow-glow mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Applications</CardTitle>
                <CardDescription>Review student applications</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-success shadow-lg hover:shadow-glow">
                  View Applications
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-info/20 bg-gradient-card"
              onClick={() => navigate("/admin/assessments")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-info flex items-center justify-center shadow-glow mb-4">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>Manage tests & questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-info shadow-lg hover:shadow-glow">
                  Manage Tests
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 bg-gradient-card"
              onClick={() => navigate("/admin/announcements")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Announcements</CardTitle>
                <CardDescription>Send notifications to students</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-primary shadow-lg hover:shadow-glow">
                  Manage Announcements
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
