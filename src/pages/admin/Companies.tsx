import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(200, "Company name must be less than 200 characters"),
  description: z.string().trim().max(2000, "Description must be less than 2000 characters"),
  industry: z.string().trim().max(100, "Industry must be less than 100 characters"),
  website: z.string().trim().refine((val) => !val || z.string().url().safeParse(val).success, "Invalid website URL"),
  logo_url: z.string().trim().refine((val) => !val || z.string().url().safeParse(val).success, "Invalid logo URL")
});

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);

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

    fetchCompanies();
  };

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });

    setCompanies(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const rawData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      industry: formData.get("industry") as string,
      website: formData.get("website") as string,
      logo_url: formData.get("logo_url") as string,
    };

    // Validate input data
    const validation = companySchema.safeParse(rawData);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    const companyData = validation.data;

    if (editingCompany) {
      const { error } = await supabase
        .from("companies")
        .update(companyData)
        .eq("id", editingCompany.id);

      if (error) {
        toast.error("Failed to update company");
      } else {
        toast.success("Company updated successfully");
        setOpen(false);
        setEditingCompany(null);
        fetchCompanies();
      }
    } else {
      const { error } = await supabase
        .from("companies")
        .insert([companyData as any]);

      if (error) {
        toast.error("Failed to create company");
      } else {
        toast.success("Company created successfully");
        setOpen(false);
        fetchCompanies();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete company");
    } else {
      toast.success("Company deleted successfully");
      fetchCompanies();
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
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Companies
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage recruiting companies
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow" onClick={() => setEditingCompany(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCompany ? "Edit Company" : "Add New Company"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input id="name" name="name" defaultValue={editingCompany?.name} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={editingCompany?.description} />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" name="industry" defaultValue={editingCompany?.industry} />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" type="url" defaultValue={editingCompany?.website} />
                </div>
                <div>
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input id="logo_url" name="logo_url" type="url" defaultValue={editingCompany?.logo_url} />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary">
                  {editingCompany ? "Update" : "Create"} Company
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company, index) => (
            <Card 
              key={company.id}
              className="hover:shadow-glow-lg transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{company.name}</CardTitle>
                      <CardDescription>{company.industry}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">{company.description}</p>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline block mb-4">
                    Visit Website
                  </a>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingCompany(company);
                      setOpen(true);
                    }}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(company.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {companies.length === 0 && (
          <Card className="text-center p-12 animate-fade-in">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-2xl font-semibold mb-2">No Companies Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first recruiting company
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Companies;
