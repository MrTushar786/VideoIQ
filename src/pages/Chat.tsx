import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Heart, Users } from 'lucide-react';
import { LoveIcon } from '@/components/LoveIcon';

interface Partner {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  last_seen: string;
}

export default function Chat() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [loadingPartner, setLoadingPartner] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      fetchPartnerAndCouple();
    }
  }, [profile]);

  const fetchPartnerAndCouple = async () => {
    if (!profile?.partner_id) {
      setLoadingPartner(false);
      return;
    }

    try {
      // Fetch partner info
      const { data: partnerData, error: partnerError } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url, last_seen')
        .eq('id', profile.partner_id)
        .single();

      if (partnerError) throw partnerError;
      setPartner(partnerData);

      // Fetch couple ID
      const { data: coupleData, error: coupleError } = await supabase
        .from('couples')
        .select('id')
        .or(`partner1_id.eq.${profile.id},partner2_id.eq.${profile.id}`)
        .single();

      if (coupleError) throw coupleError;
      setCoupleId(coupleData.id);
    } catch (error) {
      console.error('Error fetching partner and couple:', error);
    } finally {
      setLoadingPartner(false);
    }
  };

  if (loading || loadingPartner) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <div className="text-center">
          <LoveIcon animate size="lg" />
          <p className="mt-4 text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  if (!partner || !coupleId) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center shadow-romantic border-love-pink/20">
          <div className="w-16 h-16 mx-auto gradient-heart rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">No Partner Connected</h2>
          <p className="text-muted-foreground mb-6">
            You need to connect with your partner before you can start chatting.
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
    <div className="h-screen flex flex-col">
      <ChatInterface coupleId={coupleId} partner={partner} />
    </div>
  );
}