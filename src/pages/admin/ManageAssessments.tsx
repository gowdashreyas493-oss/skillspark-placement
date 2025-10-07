import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const assessmentSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().max(2000, "Description must be less than 2000 characters"),
  type: z.enum(["aptitude_test", "coding_challenge", "mock_interview"], {
    errorMap: () => ({ message: "Invalid assessment type" })
  }),
  duration_minutes: z.number().int("Duration must be a whole number").min(1, "Duration must be at least 1 minute").max(999, "Duration is too large"),
  total_marks: z.number().int("Total marks must be a whole number").min(1, "Total marks must be at least 1").max(9999, "Total marks is too large"),
  is_active: z.boolean()
});

const ManageAssessments = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);

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

    fetchAssessments();
  };

  const fetchAssessments = async () => {
    const { data } = await supabase
      .from("assessments")
      .select("*")
      .order("created_at", { ascending: false });

    setAssessments(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const durationValue = parseInt(formData.get("duration_minutes") as string);
    const marksValue = parseInt(formData.get("total_marks") as string);

    // Validate numeric values
    if (isNaN(durationValue)) {
      toast.error("Invalid duration value");
      return;
    }
    if (isNaN(marksValue)) {
      toast.error("Invalid total marks value");
      return;
    }

    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as "aptitude_test" | "coding_challenge" | "mock_interview",
      duration_minutes: durationValue,
      total_marks: marksValue,
      is_active: formData.get("is_active") === "true",
    };

    // Validate input data
    const validation = assessmentSchema.safeParse(rawData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    const assessmentData = validation.data;

    if (editingAssessment) {
      const { error } = await supabase
        .from("assessments")
        .update(assessmentData)
        .eq("id", editingAssessment.id);

      if (error) {
        toast.error("Failed to update assessment");
      } else {
        toast.success("Assessment updated successfully");
        setOpen(false);
        setEditingAssessment(null);
        fetchAssessments();
      }
    } else {
      const { error } = await supabase
        .from("assessments")
        .insert([assessmentData as any]);

      if (error) {
        toast.error("Failed to create assessment");
      } else {
        toast.success("Assessment created successfully");
        setOpen(false);
        fetchAssessments();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;

    const { error } = await supabase
      .from("assessments")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete assessment");
    } else {
      toast.success("Assessment deleted successfully");
      fetchAssessments();
    }
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

        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Assessments
            </h1>
            <p className="text-xl text-muted-foreground">Manage skill assessments</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow" onClick={() => setEditingAssessment(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Assessment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAssessment ? "Edit Assessment" : "Add New Assessment"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={editingAssessment?.title} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={editingAssessment?.description} />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" defaultValue={editingAssessment?.type || "aptitude_test"} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aptitude_test">Aptitude Test</SelectItem>
                      <SelectItem value="coding_challenge">Coding Challenge</SelectItem>
                      <SelectItem value="mock_interview">Mock Interview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={editingAssessment?.duration_minutes} required />
                  </div>
                  <div>
                    <Label htmlFor="total_marks">Total Marks</Label>
                    <Input id="total_marks" name="total_marks" type="number" defaultValue={editingAssessment?.total_marks} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="is_active">Status</Label>
                  <Select name="is_active" defaultValue={editingAssessment?.is_active?.toString() || "true"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-gradient-primary">
                  {editingAssessment ? "Update" : "Create"} Assessment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment, index) => (
            <Card key={assessment.id} className="hover:shadow-glow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${assessment.is_active ? 'bg-gradient-success text-white' : 'bg-muted text-muted-foreground'}`}>
                    {assessment.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <CardTitle className="text-xl">{assessment.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{assessment.description}</p>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span className="text-muted-foreground capitalize">{assessment.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Duration:</span>
                    <span className="text-muted-foreground">{assessment.duration_minutes} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Marks:</span>
                    <span className="text-success">{assessment.total_marks}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditingAssessment(assessment); setOpen(true); }} className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(assessment.id)} className="flex-1">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {assessments.length === 0 && (
          <Card className="text-center p-12 animate-fade-in">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">No Assessments Yet</h3>
            <p className="text-muted-foreground">Start by creating your first assessment</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageAssessments;
