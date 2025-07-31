import { FeatureCard } from "./FeatureCard";
import { Video, Heart, Brain, Shield, Calendar, MessageCircle } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Video,
      title: "HD Video Calls",
      description: "Crystal clear video and audio quality with end-to-end encryption for your private moments.",
      gradient: true
    },
    {
      icon: Heart,
      title: "Mood Detection",
      description: "AI analyzes your voice and expressions to understand your mood and suggest conversation topics.",
    },
    {
      icon: Brain,
      title: "Smart Suggestions", 
      description: "Get personalized date ideas, conversation starters, and relationship insights powered by AI.",
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your conversations and memories are completely private with military-grade encryption.",
      gradient: true
    },
    {
      icon: Calendar,
      title: "Virtual Date Nights",
      description: "Plan and schedule romantic virtual dates with themes, games, and special activities.",
    },
    {
      icon: MessageCircle,
      title: "Memory Timeline",
      description: "Save and share your favorite moments, photos, and call memories in a beautiful timeline.",
    }
  ];

  return (
    <section className="py-20 px-4 relative">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            Features Made for
            <span className="block text-transparent bg-clip-text gradient-love font-script text-4xl md:text-5xl">
              Lovebirds
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every feature is thoughtfully designed to bring you closer together, 
            no matter the distance between you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
            />
          ))}
        </div>
      </div>
    </section>
  );
};