import { Button } from "@/components/ui/button";
import { Heart, Video, Users } from "lucide-react";
import { LoveIcon } from "./LoveIcon";
import { FloatingHearts } from "./FloatingHearts";
import heroImage from "@/assets/hero-couple.jpg";

export const CoupleHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-soft overflow-hidden">
      <FloatingHearts />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <LoveIcon animate size="lg" />
                <span className="font-script text-2xl text-primary">CoupleConnect</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Stay Connected,
                <span className="block text-transparent bg-clip-text gradient-love font-script">
                  Stay in Love
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                The AI-powered video calling app designed exclusively for couples. 
                Share moments, create memories, and strengthen your bond with beautiful, 
                private video calls.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="romantic" size="xl" className="group">
                <Video className="w-5 h-5 group-hover:scale-110 transition-romantic" />
                Start Video Call
              </Button>
              
              <Button variant="soft" size="xl">
                <Users className="w-5 h-5" />
                Join Your Partner
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-8">
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Heart className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-semibold text-primary">100%</span>
                </div>
                <p className="text-sm text-muted-foreground">Private</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Heart className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-semibold text-primary">AI-Powered</span>
                </div>
                <p className="text-sm text-muted-foreground">Smart Features</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Heart className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-semibold text-primary">Couples Only</span>
                </div>
                <p className="text-sm text-muted-foreground">Just for Two</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-romantic">
              <img 
                src={heroImage} 
                alt="Couple connecting through video call" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 text-love-pink animate-float">
              <Heart className="w-full h-full fill-current" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 text-love-purple animate-float" style={{ animationDelay: '1s' }}>
              <Heart className="w-full h-full fill-current" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};