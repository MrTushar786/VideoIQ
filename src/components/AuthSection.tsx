import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, UserPlus, Users } from "lucide-react";
import { LoveIcon } from "./LoveIcon";

export const AuthSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 gradient-soft">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LoveIcon animate size="lg" />
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Connect?
            </h2>
          </div>
          <p className="text-xl text-muted-foreground">
            Join thousands of couples who stay connected with CoupleConnect
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Get Started Card */}
          <Card className="p-8 shadow-romantic border-love-pink/20">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto gradient-heart rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">Get Started</h3>
                <p className="text-muted-foreground">
                  Create your account and connect with your partner
                </p>
              </div>

              <Button 
                variant="romantic" 
                className="w-full" 
                size="lg"
                onClick={() => navigate("/auth")}
              >
                <Heart className="w-5 h-5" />
                Sign Up / Login
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account? Sign in to access your dashboard
              </div>
            </div>
          </Card>

          {/* Connect with Partner Card */}
          <Card className="p-8 shadow-romantic border-love-pink/20">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto gradient-love rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">Connect with Partner</h3>
                <p className="text-muted-foreground">
                  Each user gets a unique pair code to connect with their loved one
                </p>
              </div>

              <div className="text-center p-4 bg-love-pink/10 rounded-lg border border-love-pink/20">
                <p className="text-sm text-muted-foreground mb-2">How it works:</p>
                <div className="space-y-1 text-sm">
                  <p>1. Create your account</p>
                  <p>2. Get your unique pair code</p>
                  <p>3. Share code with your partner</p>
                  <p>4. Start video calling!</p>
                </div>
              </div>

              <Button 
                variant="heart" 
                className="w-full" 
                size="lg"
                onClick={() => navigate("/auth")}
              >
                <Heart className="w-5 h-5" />
                Start Connecting
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};