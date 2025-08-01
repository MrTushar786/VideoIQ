import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker = ({ onEmojiSelect, onClose }: EmojiPickerProps) => {
  const [activeCategory, setActiveCategory] = useState('hearts');

  const emojiCategories = {
    hearts: ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💟', '♥️', '💌', '💋', '😍', '🥰', '😘', '😗', '😙', '😚'],
    faces: ['😊', '😄', '😃', '😀', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😇', '🥳', '😎', '🤗', '🤭'],
    gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖'],
    symbols: ['💯', '💫', '⭐', '🌟', '✨', '🎉', '🎊', '🔥', '💥', '💢', '💨', '💦', '💤', '🌈', '☀️', '🌙', '⚡']
  };

  return (
    <Card className="w-80 h-64 shadow-romantic border-love-pink/20 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between p-3 border-b border-love-pink/20">
        <h4 className="font-medium text-sm">Add Reaction</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex">
        {/* Category Tabs */}
        <div className="w-16 border-r border-love-pink/20 p-2">
          <div className="space-y-1">
            {Object.keys(emojiCategories).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "soft" : "ghost"}
                size="sm"
                className="w-full h-8 text-xs"
                onClick={() => setActiveCategory(category)}
              >
                {category === 'hearts' && '💕'}
                {category === 'faces' && '😊'}
                {category === 'gestures' && '👍'}
                {category === 'symbols' && '✨'}
              </Button>
            ))}
          </div>
        </div>

        {/* Emoji Grid */}
        <ScrollArea className="flex-1 h-48">
          <div className="grid grid-cols-6 gap-1 p-2">
            {emojiCategories[activeCategory as keyof typeof emojiCategories].map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-love-pink/10 hover:scale-110 transition-all"
                onClick={() => {
                  onEmojiSelect(emoji);
                  onClose();
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};