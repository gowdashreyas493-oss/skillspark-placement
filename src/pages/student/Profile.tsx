import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, User, FileText, Save } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileData, studentData] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("student_profiles").select("*").eq("user_id", user.id).single()
      ]);

      setProfile(profileData.data);
      setStudentProfile(studentData.data);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update profile
      await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone
        })
        .eq("id", user.id);

      // Update student profile
      await supabase
        .from("student_profiles")
        .update({
          roll_number: studentProfile.roll_number,
          branch: studentProfile.branch,
          batch_year: studentProfile.batch_year,
          cgpa: studentProfile.cgpa,
          skills: studentProfile.skills,
          linkedin_url: studentProfile.linkedin_url,
          github_url: studentProfile.github_url
        })
        .eq("user_id", user.id);

      // Upload resume if selected
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${user.id}/resume.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(fileName, resumeFile, { upsert: true });

        if (uploadError) throw uploadError;

        // Update resume URL in student profile
        const { data: { publicUrl } } = supabase.storage
          .from("resumes")
          .getPublicUrl(fileName);

        await supabase
          .from("student_profiles")
          .update({ resume_url: publicUrl })
          .eq("user_id", user.id);
      }

      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-glow">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="w-6 h-6" />
              Student Profile
            </CardTitle>
            <CardDescription>Manage your personal information and academic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile?.full_name || ""}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile?.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  value={studentProfile?.roll_number || ""}
                  onChange={(e) => setStudentProfile({ ...studentProfile, roll_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={studentProfile?.branch || ""}
                  onChange={(e) => setStudentProfile({ ...studentProfile, branch: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchYear">Batch Year</Label>
                <Input
                  id="batchYear"
                  type="number"
                  value={studentProfile?.batch_year || ""}
                  onChange={(e) => setStudentProfile({ ...studentProfile, batch_year: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cgpa">CGPA</Label>
                <Input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  value={studentProfile?.cgpa || ""}
                  onChange={(e) => setStudentProfile({ ...studentProfile, cgpa: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={studentProfile?.linkedin_url || ""}
                  onChange={(e) => setStudentProfile({ ...studentProfile, linkedin_url: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  value={studentProfile?.github_url || ""}
                  onChange={(e) => setStudentProfile({ ...studentProfile, github_url: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Textarea
                  id="skills"
                  value={studentProfile?.skills?.join(", ") || ""}
                  onChange={(e) => setStudentProfile({
                    ...studentProfile,
                    skills: e.target.value.split(",").map(s => s.trim())
                  })}
                  placeholder="e.g., Python, Java, React, Machine Learning"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="resume">Upload Resume (PDF)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  />
                  {studentProfile?.resume_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(studentProfile.resume_url, '_blank')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Current
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}