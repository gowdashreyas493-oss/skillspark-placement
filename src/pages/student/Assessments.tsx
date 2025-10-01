import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ArrowLeft, Clock, CheckCircle, Play, Award } from "lucide-react";

const Assessments = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

    // Fetch all active assessments
    const { data: assessmentsData } = await supabase
      .from("assessments")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setAssessments(assessmentsData || []);

    // Fetch user's attempts
    if (profile) {
      const { data: attemptsData } = await supabase
        .from("assessment_attempts")
        .select("*")
        .eq("student_id", profile.id);

      setAttempts(attemptsData || []);
    }

    setLoading(false);
  };

  const getAttempt = (assessmentId: string) => {
    return attempts.find(att => att.assessment_id === assessmentId);
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      aptitude: "bg-gradient-secondary",
      technical: "bg-gradient-primary",
      coding: "bg-gradient-success"
    };
    return colors[type] || "bg-muted";
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
            Assessments
          </h1>
          <p className="text-xl text-muted-foreground">
            Test your skills and track your progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment, index) => {
            const attempt = getAttempt(assessment.id);
            const isCompleted = attempt?.completed_at;
            
            return (
              <Card 
                key={assessment.id}
                className="hover:shadow-glow-lg transition-all duration-300 animate-scale-in border-2 hover:border-primary/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <Badge className={getTypeColor(assessment.type)}>
                      {assessment.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{assessment.title}</CardTitle>
                  <CardDescription>{assessment.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-warning" />
                      <span className="font-medium">Duration:</span>
                      <span className="text-muted-foreground">
                        {assessment.duration_minutes} minutes
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-success" />
                      <span className="font-medium">Total Marks:</span>
                      <span className="text-muted-foreground">
                        {assessment.total_marks}
                      </span>
                    </div>

                    {isCompleted && (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="font-medium">Score:</span>
                          <span className="text-success font-semibold">
                            {attempt.score}/{assessment.total_marks} ({attempt.percentage}%)
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <Button
                    className="w-full shadow-lg hover:shadow-glow transition-all bg-gradient-primary"
                    disabled={isCompleted}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Assessment
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {assessments.length === 0 && (
          <Card className="text-center p-12 animate-fade-in">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">No Assessments Available</h3>
            <p className="text-muted-foreground">
              Check back later for new assessments
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Assessments;
