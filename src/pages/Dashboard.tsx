import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, Heart, Calendar, MessageCircle, Settings, LogOut, Users, GameController2, Image } from "lucide-react";
import { LoveIcon } from "@/components/LoveIcon";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Partner {
  id: string;
  display_name: string;
  avatar_url: string | null;
  email: string;
}

export default function Dashboard() {
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isInCall, setIsInCall] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile?.partner_id) {
      fetchPartner();
    }
  }, [profile]);

  const fetchPartner = async () => {
    if (!profile?.partner_id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, email')
        .eq('id', profile.partner_id)
        .single();

      if (error) {
        console.error('Error fetching partner:', error);
        return;
      }

      setPartner(data);
    } catch (error) {
      console.error('Error fetching partner:', error);
    }
  };

  const handleStartCall = async () => {
    if (!partner) {
      toast({
        title: "No Partner Connected",
        description: "Please connect with your partner first using a pair code.",
        variant: "destructive"
      });
      return;
    }

    setIsInCall(true);
    // Simulate video call for demo
    toast({
      title: "Video Call Starting",
      description: `Calling ${partner.display_name}...`,
    });

    // In a real app, this would integrate with WebRTC or a service like Agora
    setTimeout(() => {
      toast({
        title: "Call Connected",
        description: `Connected with ${partner.display_name}!`,
      });
    }, 2000);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    toast({
      title: "Call Ended",
      description: "Video call has been ended.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <div className="text-center">
          <LoveIcon animate size="lg" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-soft">
      {/* Header */}
      <header className="border-b border-love-pink/20 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LoveIcon animate size="md" />
              <span className="font-script text-xl text-primary">CoupleConnect</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile.display_name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Call Area */}
          <div className="lg:col-span-2">
            <Card className="p-8 shadow-romantic border-love-pink/20 text-center">
              {!isInCall ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto gradient-heart rounded-full flex items-center justify-center">
                    <Video className="w-12 h-12 text-white" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Ready for a Video Call?</h2>
                    <p className="text-muted-foreground">
                      {partner 
                        ? `Connect with ${partner.display_name} with HD video and audio`
                        : "Connect with your partner using a pair code first"
                      }
                    </p>
                  </div>

                  <Button
                    variant="romantic"
                    size="xl"
                    onClick={handleStartCall}
                    disabled={!partner}
                    className="group"
                  >
                    <Video className="w-6 h-6 group-hover:scale-110 transition-romantic" />
                    {partner ? `Call ${partner.display_name}` : "No Partner Connected"}
                  </Button>

                  {!partner && (
                    <Button
                      variant="soft"
                      onClick={() => navigate("/auth")}
                    >
                      <Users className="w-4 h-4" />
                      Connect with Partner
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <div className="w-full h-64 bg-gradient-to-br from-love-pink/20 to-love-purple/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto gradient-heart rounded-full flex items-center justify-center mb-4 animate-pulse">
                          <Heart className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-lg font-semibold">
                          {partner ? `Connected with ${partner.display_name}` : "Video Call Active"}
                        </p>
                        <p className="text-sm text-muted-foreground">HD • Encrypted</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <Button variant="destructive" onClick={handleEndCall}>
                      End Call
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Partner Info */}
            <Card className="p-6 shadow-romantic border-love-pink/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Partner Connection
              </h3>
              
              {partner ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-heart rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {partner.display_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{partner.display_name}</p>
                      <p className="text-sm text-muted-foreground">{partner.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground bg-love-pink/10 p-2 rounded">
                    Connected • Ready for calls
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-3">No partner connected</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your pair code: <code className="font-mono bg-love-pink/10 px-2 py-1 rounded">{profile.pair_code}</code>
                  </p>
                  <Button variant="soft" size="sm" onClick={() => navigate("/auth")}>
                    Connect Partner
                  </Button>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 shadow-romantic border-love-pink/20">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" disabled>
                  <Calendar className="w-4 h-4 mr-2" />
                  Virtual Date Night
                  <span className="ml-auto text-xs text-muted-foreground">Soon</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate("/chat")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Private Chat
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate("/memories")}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Memory Timeline
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => navigate("/activities")}
                >
                  <GameController2 className="w-4 h-4 mr-2" />
                  Couple Activities
                </Button>
                <Button variant="ghost" className="w-full justify-start" disabled>
                  <Heart className="w-4 h-4 mr-2" />
                  Mood Check-in
                  <span className="ml-auto text-xs text-muted-foreground">Soon</span>
                </Button>
                <Button variant="ghost" className="w-full justify-start" disabled>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                  <span className="ml-auto text-xs text-muted-foreground">Soon</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}