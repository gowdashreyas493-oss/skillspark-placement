import { TrendingUp, Users, Award, Building2 } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "150+",
      label: "Active Students",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Building2,
      value: "50+",
      label: "Partner Companies",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Award,
      value: "85%",
      label: "Placement Rate",
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      icon: TrendingUp,
      value: "12 LPA",
      label: "Average Package",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Driving Success Across Institutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform powers placement excellence with measurable results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
