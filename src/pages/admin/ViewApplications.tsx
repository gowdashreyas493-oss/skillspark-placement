import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const ViewApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role !== 'admin') {
      toast.error("Access denied");
      navigate("/dashboard");
      return;
    }

    fetchApplications();
  };

  const fetchApplications = async () => {
    const { data } = await supabase
      .from("student_applications")
      .select(`
        *,
        student_profiles (
          roll_number,
          cgpa,
          branch,
          profiles (
            full_name,
            email
          )
        ),
        placement_drives (
          title,
          role,
          companies (
            name
          )
        )
      `)
      .order("applied_at", { ascending: false });

    setApplications(data || []);
    setLoading(false);
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: "applied" | "shortlisted" | "selected" | "rejected" | "eligible" | "not_eligible") => {
    const { error } = await supabase
      .from("student_applications")
      .update({ status: newStatus })
      .eq("id", applicationId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated successfully");
      fetchApplications();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      applied: "bg-muted",
      eligible: "bg-info",
      not_eligible: "bg-muted",
      shortlisted: "bg-gradient-secondary",
      selected: "bg-gradient-success",
      rejected: "bg-destructive"
    };
    return colors[status] || "bg-muted";
  };

  const getStatusIcon = (status: string) => {
    if (status === "selected") return <CheckCircle className="w-4 h-4" />;
    if (status === "rejected") return <XCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
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
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6 animate-fade-in">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Student Applications
          </h1>
          <p className="text-xl text-muted-foreground">Review and manage all applications</p>
        </div>

        <div className="space-y-4">
          {applications.map((application, index) => (
            <Card 
              key={application.id}
              className="hover:shadow-glow-lg transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {application.student_profiles?.profiles?.full_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {application.student_profiles?.roll_number} • {application.student_profiles?.branch} • CGPA: {application.student_profiles?.cgpa}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.student_profiles?.profiles?.email}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(application.status)}
                      {application.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Applied For</p>
                    <p className="text-muted-foreground">
                      {application.placement_drives?.title} - {application.placement_drives?.role}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {application.placement_drives?.companies?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Applied On</p>
                    <p className="text-muted-foreground">
                      {new Date(application.applied_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                {application.notes && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{application.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Update Status:</span>
                  <Select
                    defaultValue={application.status}
                    onValueChange={(value) => handleStatusUpdate(application.id, value as "applied" | "shortlisted" | "selected" | "rejected" | "eligible" | "not_eligible")}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="eligible">Eligible</SelectItem>
                      <SelectItem value="not_eligible">Not Eligible</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {applications.length === 0 && (
          <Card className="text-center p-12 animate-fade-in">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground">Applications will appear here once students start applying</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ViewApplications;
