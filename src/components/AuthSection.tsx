import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, UserPlus, Users } from "lucide-react";
import { LoveIcon } from "./LoveIcon";

export const AuthSection = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [pairCode, setPairCode] = useState("");

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
          {/* Login/Signup Card */}
          <Card className="p-8 shadow-romantic border-love-pink/20">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto gradient-heart rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h3>
                <p className="text-muted-foreground">
                  {isLogin ? "Sign in to reconnect with your partner" : "Start your love journey today"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@example.com"
                    className="border-love-pink/30 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="border-love-pink/30 focus:border-primary"
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="••••••••"
                      className="border-love-pink/30 focus:border-primary"
                    />
                  </div>
                )}
              </div>

              <Button variant="romantic" className="w-full" size="lg">
                <Heart className="w-5 h-5" />
                {isLogin ? "Sign In" : "Create Account"}
              </Button>

              <div className="text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline"
                >
                  {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </Card>

          {/* Couple Pairing Card */}
          <Card className="p-8 shadow-romantic border-love-pink/20">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto gradient-love rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">Connect with Partner</h3>
                <p className="text-muted-foreground">
                  Use your unique pair code to connect with your loved one
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pairCode">Partner's Pair Code</Label>
                  <Input 
                    id="pairCode"
                    value={pairCode}
                    onChange={(e) => setPairCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="border-love-pink/30 focus:border-primary text-center text-lg font-mono"
                    maxLength={6}
                  />
                </div>

                <div className="text-center p-4 bg-love-pink/10 rounded-lg border border-love-pink/20">
                  <p className="text-sm text-muted-foreground mb-2">Your Pair Code:</p>
                  <p className="text-2xl font-mono font-bold text-primary">
                    {Math.random().toString(36).substr(2, 6).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this with your partner
                  </p>
                </div>
              </div>

              <Button variant="heart" className="w-full" size="lg">
                <Heart className="w-5 h-5" />
                Connect Hearts
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};