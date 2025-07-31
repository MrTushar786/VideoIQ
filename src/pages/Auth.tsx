import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, UserPlus, Users, ArrowLeft } from "lucide-react";
import { LoveIcon } from "@/components/LoveIcon";
import { FloatingHearts } from "@/components/FloatingHearts";
import { useForm } from "react-hook-form";

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  displayName?: string;
}

interface PairFormData {
  pairCode: string;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPairing, setShowPairing] = useState(false);
  const { signUp, signIn, user, profile, connectWithPartner } = useAuth();
  const navigate = useNavigate();

  const authForm = useForm<AuthFormData>();
  const pairForm = useForm<PairFormData>();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onAuthSubmit = async (data: AuthFormData) => {
    if (isLogin) {
      await signIn(data.email, data.password);
    } else {
      if (data.password !== data.confirmPassword) {
        authForm.setError("confirmPassword", { message: "Passwords don't match" });
        return;
      }
      await signUp(data.email, data.password, data.displayName);
    }
  };

  const onPairSubmit = async (data: PairFormData) => {
    await connectWithPartner(data.pairCode);
    pairForm.reset();
    setShowPairing(false);
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingHearts />
      
      <div className="container mx-auto max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LoveIcon animate size="lg" />
            <span className="font-script text-2xl text-primary">CoupleConnect</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {showPairing ? "Connect with Partner" : isLogin ? "Welcome Back" : "Join CoupleConnect"}
          </h1>
          <p className="text-muted-foreground">
            {showPairing 
              ? "Enter your partner's pair code to connect" 
              : isLogin 
                ? "Sign in to your account" 
                : "Create your account to get started"
            }
          </p>
        </div>

        <Card className="p-8 shadow-romantic border-love-pink/20">
          {!showPairing ? (
            <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto gradient-heart rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      {...authForm.register("displayName")}
                      id="displayName"
                      placeholder="Your name"
                      className="border-love-pink/30 focus:border-primary"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...authForm.register("email", { required: "Email is required" })}
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="border-love-pink/30 focus:border-primary"
                  />
                  {authForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{authForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...authForm.register("password", { required: "Password is required" })}
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="border-love-pink/30 focus:border-primary"
                  />
                  {authForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{authForm.formState.errors.password.message}</p>
                  )}
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      {...authForm.register("confirmPassword", { required: "Please confirm your password" })}
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="border-love-pink/30 focus:border-primary"
                    />
                    {authForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{authForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                variant="romantic" 
                className="w-full" 
                size="lg"
                disabled={authForm.formState.isSubmitting}
              >
                <Heart className="w-5 h-5" />
                {isLogin ? "Sign In" : "Create Account"}
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline text-sm"
                >
                  {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </button>
                
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowPairing(true)}
                    className="block w-full text-primary hover:underline text-sm"
                  >
                    Have a pair code? Connect with partner
                  </button>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={pairForm.handleSubmit(onPairSubmit)} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto gradient-love rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                {profile?.pair_code && (
                  <div className="text-center p-4 bg-love-pink/10 rounded-lg border border-love-pink/20">
                    <p className="text-sm text-muted-foreground mb-2">Your Pair Code:</p>
                    <p className="text-2xl font-mono font-bold text-primary">
                      {profile.pair_code}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Share this with your partner
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="pairCode">Partner's Pair Code</Label>
                  <Input
                    {...pairForm.register("pairCode", { required: "Pair code is required" })}
                    id="pairCode"
                    placeholder="Enter 6-character code"
                    className="border-love-pink/30 focus:border-primary text-center text-lg font-mono"
                    maxLength={6}
                  />
                  {pairForm.formState.errors.pairCode && (
                    <p className="text-sm text-destructive">{pairForm.formState.errors.pairCode.message}</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                variant="heart" 
                className="w-full" 
                size="lg"
                disabled={pairForm.formState.isSubmitting}
              >
                <Heart className="w-5 h-5" />
                Connect Hearts
              </Button>

              <Button
                type="button"
                variant="soft"
                className="w-full"
                onClick={() => setShowPairing(false)}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
            </form>
          )}
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}