import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3">
      <Avatar className="w-8 h-8 mt-1">
        <AvatarFallback className="gradient-heart text-white text-xs">
          P
        </AvatarFallback>
      </Avatar>
      
      <Card className="p-3 bg-background border-love-pink/20 shadow-soft">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-love-pink rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-love-pink rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-love-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-muted-foreground ml-2">typing...</span>
        </div>
      </Card>
    </div>
  );
};