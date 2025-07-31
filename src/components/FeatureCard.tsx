import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: boolean;
}

export const FeatureCard = ({ icon: Icon, title, description, gradient = false }: FeatureCardProps) => {
  return (
    <Card className={`
      p-6 h-full transition-romantic hover:shadow-romantic hover:scale-105 border-love-pink/20
      ${gradient ? 'gradient-soft' : 'bg-card/50 backdrop-blur-sm'}
    `}>
      <div className="space-y-4">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          ${gradient ? 'gradient-heart' : 'bg-love-pink/20'}
        `}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );
};