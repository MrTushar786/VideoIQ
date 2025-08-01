import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Heart, 
  Smile, 
  Image, 
  Mic, 
  Phone, 
  Video,
  MoreVertical 
} from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmojiPicker } from './EmojiPicker';
import { MediaUpload } from './MediaUpload';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  media_url?: string;
  created_at: string;
  reactions?: MessageReaction[];
}

interface MessageReaction {
  id: string;
  emoji: string;
  user_id: string;
}

interface Partner {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  last_seen: string;
}

interface ChatInterfaceProps {
  coupleId: string;
  partner: Partner;
}

export const ChatInterface = ({ coupleId, partner }: ChatInterfaceProps) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (coupleId) {
      fetchMessages();
      subscribeToMessages();
      subscribeToTyping();
    }
  }, [coupleId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          message_reactions (
            id,
            emoji,
            user_id
          )
        `)
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `couple_id=eq.${coupleId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === payload.new.id ? payload.new as Message : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTyping = () => {
    const channel = supabase
      .channel(`typing:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `couple_id=eq.${coupleId}`
        },
        (payload) => {
          const data = payload.new as any;
          if (data.user_id !== profile?.id) {
            setPartnerTyping(data.is_typing);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          couple_id: coupleId,
          sender_id: profile.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      updateTypingStatus(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const updateTypingStatus = async (typing: boolean) => {
    if (!profile) return;

    try {
      await supabase
        .from('typing_indicators')
        .upsert({
          couple_id: coupleId,
          user_id: profile.id,
          is_typing: typing,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      updateTypingStatus(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 1000);
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_id: profile.id,
          emoji
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startCall = async (type: 'voice' | 'video') => {
    try {
      const { error } = await supabase
        .from('call_sessions')
        .insert({
          couple_id: coupleId,
          caller_id: profile?.id,
          call_type: type,
          status: 'initiated'
        });

      if (error) throw error;

      toast({
        title: `${type === 'video' ? 'Video' : 'Voice'} Call`,
        description: `Calling ${partner.display_name}...`,
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Error",
        description: "Failed to start call",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Heart className="w-8 h-8 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-secondary/20">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-love-pink/20 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="gradient-heart text-white">
              {partner.display_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{partner.display_name}</h3>
            <p className="text-xs text-muted-foreground">
              @{partner.username} • {partnerTyping ? 'typing...' : 'online'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startCall('voice')}
            className="text-primary hover:bg-love-pink/10"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startCall('video')}
            className="text-primary hover:bg-love-pink/10"
          >
            <Video className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-love-pink/10"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === profile?.id}
              onAddReaction={(emoji) => addReaction(message.id, emoji)}
            />
          ))}
          {partnerTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-love-pink/20 bg-background/80 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a loving message..."
              className="pr-20 border-love-pink/30 focus:border-primary resize-none"
              maxLength={1000}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              >
                <Smile className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMediaUpload(!showMediaUpload)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              >
                <Image className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            variant="romantic"
            size="sm"
            className="h-10 w-10 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4">
            <EmojiPicker
              onEmojiSelect={(emoji) => {
                setNewMessage(prev => prev + emoji);
                setShowEmojiPicker(false);
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}

        {/* Media Upload */}
        {showMediaUpload && (
          <div className="absolute bottom-20 right-4">
            <MediaUpload
              onMediaUpload={(url, type) => {
                // Handle media upload
                setShowMediaUpload(false);
              }}
              onClose={() => setShowMediaUpload(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};