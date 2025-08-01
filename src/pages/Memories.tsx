import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MemoryTimeline } from '@/components/memories/MemoryTimeline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Heart, Users } from 'lucide-react';
import { LoveIcon } from '@/components/LoveIcon';

export default function Memories() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [loadingCouple, setLoadingCouple] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      fetchCouple();
    }
  }, [profile]);

  const fetchCouple = async () => {
    if (!profile?.partner_id) {
      setLoadingCouple(false);
      return;
    }

    try {
      const { data: coupleData, error: coupleError } = await supabase
        .from('couples')
        .select('id')
        .or(`partner1_id.eq.${profile.id},partner2_id.eq.${profile.id}`)
        .single();

      if (coupleError) throw coupleError;
      setCoupleId(coupleData.id);
    } catch (error) {
      console.error('Error fetching couple:', error);
    } finally {
      setLoadingCouple(false);
    }
  };

  if (loading || loadingCouple) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <div className="text-center">
          <LoveIcon animate size="lg" />
          <p className="mt-4 text-muted-foreground">Loading memories...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  if (!coupleId) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center shadow-romantic border-love-pink/20">
          <div className="w-16 h-16 mx-auto gradient-heart rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">No Partner Connected</h2>
          <p className="text-muted-foreground mb-6">
            You need to connect with your partner before you can create shared memories.
          </p>
          
          <div className="space-y-3">
            <Button
              variant="romantic"
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              <Heart className="w-4 h-4 mr-2" />
              Connect with Partner
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft">
      {/* Header */}
      <header className="border-b border-love-pink/20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <LoveIcon animate size="md" />
                <span className="font-script text-xl text-primary">Memories</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <MemoryTimeline coupleId={coupleId} />
      </div>
    </div>
  );
}