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
import { Briefcase, ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const driveSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().max(2000, "Description must be less than 2000 characters"),
  company_id: z.string().uuid("Invalid company selection"),
  role: z.string().trim().min(1, "Role is required").max(100, "Role must be less than 100 characters"),
  package_offered: z.number().min(0, "Package must be positive").max(999, "Package value is too large"),
  min_cgpa: z.number().min(0, "CGPA must be between 0 and 10").max(10, "CGPA must be between 0 and 10"),
  drive_date: z.string().min(1, "Drive date is required"),
  deadline: z.string().min(1, "Deadline is required"),
  eligible_branches: z.array(z.string().trim().min(1).max(50)).min(1, "At least one branch is required"),
  is_active: z.boolean()
});

const ManageDrives = () => {
  const navigate = useNavigate();
  const [drives, setDrives] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState<any>(null);

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

    fetchData();
  };

  const fetchData = async () => {
    const [drivesRes, companiesRes] = await Promise.all([
      supabase.from("placement_drives").select("*, companies(name)").order("created_at", { ascending: false }),
      supabase.from("companies").select("*")
    ]);

    setDrives(drivesRes.data || []);
    setCompanies(companiesRes.data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const packageValue = parseFloat(formData.get("package_offered") as string);
    const cgpaValue = parseFloat(formData.get("min_cgpa") as string);
    
    // Validate numeric values
    if (isNaN(packageValue)) {
      toast.error("Invalid package value");
      return;
    }
    if (isNaN(cgpaValue)) {
      toast.error("Invalid CGPA value");
      return;
    }

    const branches = (formData.get("eligible_branches") as string)
      .split(",")
      .map(b => b.trim())
      .filter(b => b.length > 0);

    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      company_id: formData.get("company_id") as string,
      role: formData.get("role") as string,
      package_offered: packageValue,
      min_cgpa: cgpaValue,
      drive_date: formData.get("drive_date") as string,
      deadline: formData.get("deadline") as string,
      eligible_branches: branches,
      is_active: formData.get("is_active") === "true",
    };

    // Validate input data
    const validation = driveSchema.safeParse(rawData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    const driveData = validation.data;

    if (editingDrive) {
      const { error } = await supabase
        .from("placement_drives")
        .update(driveData)
        .eq("id", editingDrive.id);

      if (error) {
        toast.error("Failed to update drive");
      } else {
        toast.success("Drive updated successfully");
        setOpen(false);
        setEditingDrive(null);
        fetchData();
      }
    } else {
      const { error } = await supabase
        .from("placement_drives")
        .insert([driveData as any]);

      if (error) {
        toast.error("Failed to create drive");
      } else {
        toast.success("Drive created successfully");
        setOpen(false);
        fetchData();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this drive?")) return;

    const { error } = await supabase
      .from("placement_drives")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete drive");
    } else {
      toast.success("Drive deleted successfully");
      fetchData();
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
              Placement Drives
            </h1>
            <p className="text-xl text-muted-foreground">Manage recruitment drives</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow" onClick={() => setEditingDrive(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Drive
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDrive ? "Edit Drive" : "Add New Drive"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={editingDrive?.title} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={editingDrive?.description} />
                </div>
                <div>
                  <Label htmlFor="company_id">Company</Label>
                  <Select name="company_id" defaultValue={editingDrive?.company_id} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" name="role" defaultValue={editingDrive?.role} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="package_offered">Package (LPA)</Label>
                    <Input id="package_offered" name="package_offered" type="number" step="0.01" defaultValue={editingDrive?.package_offered} required />
                  </div>
                  <div>
                    <Label htmlFor="min_cgpa">Min CGPA</Label>
                    <Input id="min_cgpa" name="min_cgpa" type="number" step="0.01" defaultValue={editingDrive?.min_cgpa} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="drive_date">Drive Date</Label>
                    <Input id="drive_date" name="drive_date" type="date" defaultValue={editingDrive?.drive_date?.split('T')[0]} required />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Application Deadline</Label>
                    <Input id="deadline" name="deadline" type="date" defaultValue={editingDrive?.deadline?.split('T')[0]} required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="eligible_branches">Eligible Branches (comma-separated)</Label>
                  <Input id="eligible_branches" name="eligible_branches" defaultValue={editingDrive?.eligible_branches?.join(", ")} placeholder="CSE, ECE, IT" required />
                </div>
                <div>
                  <Label htmlFor="is_active">Status</Label>
                  <Select name="is_active" defaultValue={editingDrive?.is_active?.toString() || "true"}>
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
                  {editingDrive ? "Update" : "Create"} Drive
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {drives.map((drive, index) => (
            <Card key={drive.id} className="hover:shadow-glow-lg transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{drive.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{drive.companies?.name}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${drive.is_active ? 'bg-gradient-success text-white' : 'bg-muted text-muted-foreground'}`}>
                    {drive.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{drive.description}</p>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Role:</span>
                    <span className="text-muted-foreground">{drive.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Package:</span>
                    <span className="text-success">₹{drive.package_offered} LPA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Min CGPA:</span>
                    <span className="text-muted-foreground">{drive.min_cgpa}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditingDrive(drive); setOpen(true); }} className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(drive.id)} className="flex-1">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {drives.length === 0 && (
          <Card className="text-center p-12 animate-fade-in">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">No Drives Yet</h3>
            <p className="text-muted-foreground">Start by creating your first placement drive</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ManageDrives;
