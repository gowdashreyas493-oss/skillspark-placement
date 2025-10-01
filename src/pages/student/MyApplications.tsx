import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, ArrowLeft, FileText, Clock } from "lucide-react";

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (profile) {
      const { data } = await supabase
        .from("student_applications")
        .select(`
          *,
          placement_drives (
            title,
            role,
            drive_date,
            companies (
              name,
              industry
            )
          )
        `)
        .eq("student_id", profile.id)
        .order("applied_at", { ascending: false });

      setApplications(data || []);
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      applied: "bg-gradient-secondary",
      shortlisted: "bg-gradient-primary",
      interview_scheduled: "bg-gradient-success",
      selected: "bg-gradient-success",
      rejected: "bg-destructive"
    };
    return colors[status] || "bg-muted";
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
            My Applications
          </h1>
          <p className="text-xl text-muted-foreground">
            Track your application status and progress
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {applications.map((app, index) => (
            <Card 
              key={app.id}
              className="hover:shadow-glow transition-all duration-300 animate-scale-in border-2 hover:border-primary/20"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {app.placement_drives?.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {app.placement_drives?.companies?.name} • {app.placement_drives?.role}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(app.status)}>
                    {app.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-info" />
                    <span className="font-medium">Applied on:</span>
                    <span className="text-muted-foreground">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-warning" />
                    <span className="font-medium">Drive Date:</span>
                    <span className="text-muted-foreground">
                      {new Date(app.placement_drives?.drive_date).toLocaleDateString()}
                    </span>
                  </div>

                  {app.notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <span className="font-medium">Notes:</span>
                        <p className="text-muted-foreground mt-1">{app.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {applications.length === 0 && (
          <Card className="text-center p-12 animate-fade-in">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start applying to placement drives to see them here
            </p>
            <Button onClick={() => navigate("/student/drives")} className="bg-gradient-primary">
              Browse Drives
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
