import { Heart } from "lucide-react";

export const FloatingHearts = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <Heart
          key={i}
          className={`
            absolute text-love-pink/30 fill-love-pink/20 animate-float
            ${i % 2 === 0 ? 'w-4 h-4' : 'w-6 h-6'}
          `}
          style={{
            left: `${10 + (i * 12)}%`,
            top: `${20 + (i * 8)}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + (i % 2)}s`
          }}
        />
      ))}
    </div>
  );
};