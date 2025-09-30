import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Code2, Trophy } from "lucide-react";


const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Trusted by 150+ Students & 20+ Institutions
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transform Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Placement Journey
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Enterprise-grade platform for managing placements, tracking progress, and preparing for success with integrated assessments and analytics.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg shadow-lg hover:shadow-xl transition-all" onClick={() => navigate("/auth")}>
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg">
              Watch Demo
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Real-time Analytics</h3>
              <p className="text-muted-foreground text-sm">
                Track placement metrics, performance insights, and trends with dynamic dashboards
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <Code2 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Integrated Compiler</h3>
              <p className="text-muted-foreground text-sm">
                Practice coding challenges with multi-language support and instant feedback
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4 mx-auto">
                <Trophy className="w-6 h-6 text-warning" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Mock Assessments</h3>
              <p className="text-muted-foreground text-sm">
                Prepare with realistic mock interviews, aptitude tests, and coding rounds
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
