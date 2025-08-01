import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Heart, 
  Calendar, 
  MapPin, 
  Image, 
  Video,
  Tag,
  Filter
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface Memory {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  memory_type: string;
  memory_date: string;
  location?: string;
  tags?: string[];
  created_by: string;
  created_at: string;
}

interface MemoryTimelineProps {
  coupleId: string;
}

export const MemoryTimeline = ({ coupleId }: MemoryTimelineProps) => {
  const { profile } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    memory_type: 'note',
    memory_date: new Date().toISOString().split('T')[0],
    location: '',
    tags: [] as string[],
    image_url: ''
  });

  useEffect(() => {
    if (coupleId) {
      fetchMemories();
    }
  }, [coupleId]);

  const fetchMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('couple_id', coupleId)
        .order('memory_date', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast({
        title: "Error",
        description: "Failed to load memories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addMemory = async () => {
    if (!newMemory.title.trim() || !profile) return;

    try {
      const { error } = await supabase
        .from('memories')
        .insert({
          couple_id: coupleId,
          created_by: profile.id,
          title: newMemory.title,
          content: newMemory.content,
          memory_type: newMemory.memory_type,
          memory_date: newMemory.memory_date,
          location: newMemory.location || null,
          tags: newMemory.tags.length > 0 ? newMemory.tags : null,
          image_url: newMemory.image_url || null
        });

      if (error) throw error;

      setNewMemory({
        title: '',
        content: '',
        memory_type: 'note',
        memory_date: new Date().toISOString().split('T')[0],
        location: '',
        tags: [],
        image_url: ''
      });
      setShowAddMemory(false);
      fetchMemories();

      toast({
        title: "Memory Added",
        description: "Your special moment has been saved!",
      });
    } catch (error) {
      console.error('Error adding memory:', error);
      toast({
        title: "Error",
        description: "Failed to add memory",
        variant: "destructive"
      });
    }
  };

  const handleTagInput = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setNewMemory(prev => ({ ...prev, tags }));
  };

  const filteredMemories = memories.filter(memory => 
    filterType === 'all' || memory.memory_type === filterType
  );

  const memoryTypes = [
    { value: 'all', label: 'All Memories', icon: Heart },
    { value: 'note', label: 'Notes', icon: Heart },
    { value: 'photo', label: 'Photos', icon: Image },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'milestone', label: 'Milestones', icon: Calendar }
  ];

  const getMemoryIcon = (type: string) => {
    switch (type) {
      case 'photo': return Image;
      case 'video': return Video;
      case 'milestone': return Calendar;
      default: return Heart;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Heart className="w-8 h-8 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground">Loading memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Memory Timeline</h2>
          <p className="text-muted-foreground">Your shared moments together</p>
        </div>
        
        <Dialog open={showAddMemory} onOpenChange={setShowAddMemory}>
          <DialogTrigger asChild>
            <Button variant="romantic" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Memory
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Memory</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={newMemory.title}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Our special moment..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={newMemory.content}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Tell the story of this moment..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <select
                    value={newMemory.memory_type}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, memory_type: e.target.value }))}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    <option value="note">Note</option>
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={newMemory.memory_date}
                    onChange={(e) => setNewMemory(prev => ({ ...prev, memory_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Location (optional)</label>
                <Input
                  value={newMemory.location}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Where did this happen?"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tags (optional)</label>
                <Input
                  value={newMemory.tags.join(', ')}
                  onChange={(e) => handleTagInput(e.target.value)}
                  placeholder="anniversary, vacation, surprise..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Image URL (optional)</label>
                <Input
                  value={newMemory.image_url}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <Button onClick={addMemory} className="w-full" variant="romantic">
                <Heart className="w-4 h-4 mr-2" />
                Save Memory
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {memoryTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Button
              key={type.value}
              variant={filterType === type.value ? "soft" : "ghost"}
              size="sm"
              onClick={() => setFilterType(type.value)}
              className="flex-shrink-0 gap-2"
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </Button>
          );
        })}
      </div>

      {/* Timeline */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No memories yet</h3>
              <p className="text-muted-foreground mb-4">
                Start creating beautiful memories together
              </p>
              <Button variant="romantic" onClick={() => setShowAddMemory(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Memory
              </Button>
            </div>
          ) : (
            filteredMemories.map((memory, index) => {
              const Icon = getMemoryIcon(memory.memory_type);
              return (
                <div key={memory.id} className="relative">
                  {/* Timeline Line */}
                  {index < filteredMemories.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-love-pink/30" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Timeline Icon */}
                    <div className="w-12 h-12 gradient-heart rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Memory Card */}
                    <Card className="flex-1 p-4 shadow-soft border-love-pink/20">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{memory.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(memory.memory_date), 'MMM dd, yyyy')}
                              {memory.location && (
                                <>
                                  <MapPin className="w-4 h-4 ml-2" />
                                  {memory.location}
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {memory.memory_type}
                          </Badge>
                        </div>

                        {memory.image_url && (
                          <img
                            src={memory.image_url}
                            alt={memory.title}
                            className="w-full max-w-sm rounded-lg shadow-soft"
                          />
                        )}

                        {memory.content && (
                          <p className="text-muted-foreground leading-relaxed">
                            {memory.content}
                          </p>
                        )}

                        {memory.tags && memory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {memory.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Added {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};