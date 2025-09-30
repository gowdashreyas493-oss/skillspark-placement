import { GraduationCap, FileText, Target, Bell, Upload, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

const FeaturesSection = () => {
  const features = [
    {
      icon: GraduationCap,
      title: "Student Profiles",
      description: "Comprehensive profiles with academic records, resumes, certifications, and skills management",
    },
    {
      icon: Target,
      title: "Placement Tracking",
      description: "Real-time tracking of company drives, eligibility criteria, and placement status for every student",
    },
    {
      icon: FileText,
      title: "Assessment Center",
      description: "Mock interviews, aptitude tests, and coding challenges with detailed performance analytics",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Email and in-app alerts for upcoming drives, deadlines, and personalized opportunities",
    },
    {
      icon: Upload,
      title: "Bulk Operations",
      description: "Import/export student data, upload resumes, and manage files with cloud-based storage",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Role-based access control, JWT authentication, and secure data management for peace of mind",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need for Placement Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete toolkit for students, admins, and institutions to manage the entire placement lifecycle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-8 hover:shadow-xl transition-all hover:-translate-y-1 border-2 hover:border-primary/50 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 shadow-glow">
                  <Icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
