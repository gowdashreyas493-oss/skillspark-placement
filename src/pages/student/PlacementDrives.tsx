import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, DollarSign, Trophy, ArrowLeft, GraduationCap, Clock } from "lucide-react";
import { toast } from "sonner";

const PlacementDrives = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Get student profile
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    setStudentProfile(profile);

    // Fetch active drives with company details
    const { data: drivesData } = await supabase
      .from("placement_drives")
      .select(`
        *,
        companies (
          name,
          logo_url,
          industry
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setDrives(drivesData || []);

    // Fetch user's applications
    if (profile) {
      const { data: appsData } = await supabase
        .from("student_applications")
        .select("drive_id, status")
        .eq("student_id", profile.id);

      setApplications(appsData || []);
    }

    setLoading(false);
  };

  const handleApply = async (driveId: string) => {
    if (!studentProfile) {
      toast.error("Please complete your student profile first");
      return;
    }

    const { error } = await supabase
      .from("student_applications")
      .insert({
        student_id: studentProfile.id,
        drive_id: driveId,
        status: "applied"
      });

    if (error) {
      toast.error("Failed to apply: " + error.message);
    } else {
      toast.success("Application submitted successfully!");
      fetchData();
    }
  };

  const getApplicationStatus = (driveId: string) => {
    return applications.find(app => app.drive_id === driveId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Placement Drives
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore and apply to exciting opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {drives.map((drive, index) => {
            const application = getApplicationStatus(drive.id);
            const isApplied = !!application;
            
            return (
              <Card 
                key={drive.id} 
                className="hover:shadow-glow-lg transition-all duration-300 animate-scale-in border-2 hover:border-primary/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{drive.title}</CardTitle>
                        <CardDescription className="text-base">
                          {drive.companies?.name}
                        </CardDescription>
                      </div>
                    </div>
                    {isApplied && (
                      <Badge className="bg-gradient-success">
                        {application.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4">{drive.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="font-medium">Role:</span>
                      <span className="text-muted-foreground">{drive.role}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-success" />
                      <span className="font-medium">Package:</span>
                      <span className="text-muted-foreground">
                        ₹{drive.package_offered?.toLocaleString()} LPA
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="w-4 h-4 text-secondary" />
                      <span className="font-medium">Min CGPA:</span>
                      <span className="text-muted-foreground">{drive.min_cgpa}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-info" />
                      <span className="font-medium">Drive Date:</span>
                      <span className="text-muted-foreground">
                        {new Date(drive.drive_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-warning" />
                      <span className="font-medium">Deadline:</span>
                      <span className="text-muted-foreground">
                        {new Date(drive.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {drive.eligible_branches?.map((branch: string) => (
                      <Badge key={branch} variant="outline" className="bg-gradient-card">
                        {branch}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleApply(drive.id)}
                    disabled={isApplied}
                    className="w-full shadow-lg hover:shadow-glow transition-all bg-gradient-primary"
                  >
                    {isApplied ? "Already Applied" : "Apply Now"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {drives.length === 0 && (
          <Card className="text-center p-12 animate-fade-in">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">No Active Drives</h3>
            <p className="text-muted-foreground">
              Check back later for new placement opportunities
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlacementDrives;
