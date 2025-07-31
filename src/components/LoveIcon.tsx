import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoveIconProps {
  className?: string;
  animate?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12"
};

export const LoveIcon = ({ className, animate = false, size = "md" }: LoveIconProps) => {
  return (
    <Heart 
      className={cn(
        "text-primary fill-primary/20",
        sizeMap[size],
        animate && "animate-heart",
        className
      )} 
    />
  );
};