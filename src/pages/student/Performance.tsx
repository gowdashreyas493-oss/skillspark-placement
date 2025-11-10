import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, TrendingUp, Target, Code, Brain } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Performance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [interviewResults, setInterviewResults] = useState<any[]>([]);
  const [aptitudeResults, setAptitudeResults] = useState<any[]>([]);
  const [codeSubmissions, setCodeSubmissions] = useState<any[]>([]);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to view performance data");
        setLoading(false);
        return;
      }

      const { data: studentProfile } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!studentProfile) {
        toast.error("Student profile not found. Please complete your profile first.");
        setLoading(false);
        return;
      }

      const [interviews, aptitude, code] = await Promise.all([
        supabase
          .from("mock_interview_results")
          .select("*")
          .eq("student_id", studentProfile.id)
          .order("completed_at", { ascending: false }),
        supabase
          .from("aptitude_test_results")
          .select("*")
          .eq("student_id", studentProfile.id)
          .order("completed_at", { ascending: false }),
        supabase
          .from("code_submissions")
          .select("*")
          .eq("student_id", studentProfile.id)
          .order("submitted_at", { ascending: false })
      ]);

      setInterviewResults(interviews.data || []);
      setAptitudeResults(aptitude.data || []);
      setCodeSubmissions(code.data || []);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  const interviewChartData = interviewResults.slice(0, 5).reverse().map((result, index) => ({
    name: `Test ${index + 1}`,
    score: result.score || 0
  }));

  const aptitudeChartData = aptitudeResults.slice(0, 5).reverse().map((result, index) => ({
    name: result.category.substring(0, 4),
    accuracy: result.accuracy || 0
  }));

  const categoryDistribution = [
    {
      name: "Quantitative",
      value: aptitudeResults.filter(r => r.category === "Quantitative").length
    },
    {
      name: "Logical",
      value: aptitudeResults.filter(r => r.category === "Logical").length
    },
    {
      name: "Verbal",
      value: aptitudeResults.filter(r => r.category === "Verbal").length
    }
  ].filter(item => item.value > 0);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--info))'];

  const avgInterviewScore = interviewResults.length > 0
    ? (interviewResults.reduce((acc, r) => acc + (r.score || 0), 0) / interviewResults.length).toFixed(1)
    : 0;

  const avgAptitudeAccuracy = aptitudeResults.length > 0
    ? (aptitudeResults.reduce((acc, r) => acc + (r.accuracy || 0), 0) / aptitudeResults.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Loading performance data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Performance Dashboard</h1>
          <p className="text-muted-foreground">Track your progress across all assessments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-primary/20 shadow-glow hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Avg Interview Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{avgInterviewScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {interviewResults.length} interviews completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-success/20 shadow-glow hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-success" />
                Aptitude Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{avgAptitudeAccuracy}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {aptitudeResults.length} tests completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-info/20 shadow-glow hover-scale">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Code className="w-4 h-4 text-info" />
                Code Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-info">{codeSubmissions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total programs compiled
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle>Interview Performance Trend</CardTitle>
              <CardDescription>Your score progression over recent interviews</CardDescription>
            </CardHeader>
            <CardContent>
              {interviewChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={interviewChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No interview data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle>Aptitude Test Accuracy</CardTitle>
              <CardDescription>Accuracy percentage across recent tests</CardDescription>
            </CardHeader>
            <CardContent>
              {aptitudeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={aptitudeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="hsl(var(--success))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No aptitude test data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle>Test Category Distribution</CardTitle>
              <CardDescription>Breakdown of aptitude tests by category</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-glow">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest submissions and tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {[...interviewResults.slice(0, 3), ...aptitudeResults.slice(0, 3)]
                  .sort((a, b) => new Date(b.completed_at || b.submitted_at).getTime() - new Date(a.completed_at || a.submitted_at).getTime())
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {item.domain ? `${item.domain} Interview` : `${item.category} Test`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.completed_at || item.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {item.score ? `${item.score}%` : `${item.accuracy?.toFixed(1)}%`}
                        </p>
                      </div>
                    </div>
                  ))}
                {interviewResults.length === 0 && aptitudeResults.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No recent activity
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}