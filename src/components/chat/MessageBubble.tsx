import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Smile, Reply, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageReaction {
  id: string;
  emoji: string;
  user_id: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  media_url?: string;
  created_at: string;
  reactions?: MessageReaction[];
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onAddReaction: (emoji: string) => void;
}

export const MessageBubble = ({ message, isOwn, onAddReaction }: MessageBubbleProps) => {
  const [showReactions, setShowReactions] = useState(false);

  const quickReactions = ['❤️', '😍', '😘', '🥰', '😊', '👍'];

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="space-y-2">
            {message.media_url && (
              <img
                src={message.media_url}
                alt="Shared image"
                className="max-w-xs rounded-lg shadow-soft"
              />
            )}
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="space-y-2">
            {message.media_url && (
              <video
                src={message.media_url}
                controls
                className="max-w-xs rounded-lg shadow-soft"
              />
            )}
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-2">
            {message.media_url && (
              <audio
                src={message.media_url}
                controls
                className="max-w-xs"
              />
            )}
            {message.content && (
              <p className="text-sm">{message.content}</p>
            )}
          </div>
        );
      default:
        return <p className="text-sm leading-relaxed">{message.content}</p>;
    }
  };

  const groupedReactions = message.reactions?.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>) || {};

  return (
    <div className={cn(
      "flex gap-3 group",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {!isOwn && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarFallback className="gradient-heart text-white text-xs">
            P
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "flex flex-col max-w-[70%]",
        isOwn ? "items-end" : "items-start"
      )}>
        <Card className={cn(
          "p-3 shadow-soft transition-romantic",
          isOwn 
            ? "gradient-love text-white" 
            : "bg-background border-love-pink/20"
        )}>
          {renderMessageContent()}
        </Card>

        {/* Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 px-2">
            {Object.entries(groupedReactions).map(([emoji, reactions]) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs bg-love-pink/10 hover:bg-love-pink/20 rounded-full"
                onClick={() => onAddReaction(emoji)}
              >
                {emoji} {reactions.length}
              </Button>
            ))}
          </div>
        )}

        {/* Quick Reactions (show on hover) */}
        <div className={cn(
          "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isOwn ? "flex-row-reverse" : "flex-row"
        )}>
          <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-soft">
            {quickReactions.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-xs hover:scale-110 transition-transform"
                onClick={() => onAddReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
              onClick={() => setShowReactions(!showReactions)}
            >
              <Smile className="w-3 h-3" />
            </Button>
          </div>
          
          <span className="text-xs text-muted-foreground px-2">
            {formatTime(message.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};