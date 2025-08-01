import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  GameController2, 
  Calendar, 
  MessageCircle, 
  Trophy,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Activity {
  id: string;
  activity_type: 'game' | 'challenge' | 'date_idea' | 'question';
  title: string;
  description: string;
  data: any;
  status: 'active' | 'completed' | 'paused';
  created_by: string;
  created_at: string;
  completed_at?: string;
}

interface CoupleActivitiesProps {
  coupleId: string;
}

export const CoupleActivities = ({ coupleId }: CoupleActivitiesProps) => {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);

  useEffect(() => {
    if (coupleId) {
      fetchActivities();
    }
  }, [coupleId]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('couple_activities')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startActivity = async (activityTemplate: any) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('couple_activities')
        .insert({
          couple_id: coupleId,
          activity_type: activityTemplate.type,
          title: activityTemplate.title,
          description: activityTemplate.description,
          data: activityTemplate.initialData || {},
          status: 'active',
          created_by: profile.id
        })
        .select()
        .single();

      if (error) throw error;

      setActiveActivity(data);
      fetchActivities();

      toast({
        title: "Activity Started",
        description: `${activityTemplate.title} is now active!`,
      });
    } catch (error) {
      console.error('Error starting activity:', error);
      toast({
        title: "Error",
        description: "Failed to start activity",
        variant: "destructive"
      });
    }
  };

  const updateActivityStatus = async (activityId: string, status: string, data?: any) => {
    try {
      const updateData: any = { status };
      if (data) updateData.data = data;
      if (status === 'completed') updateData.completed_at = new Date().toISOString();

      const { error } = await supabase
        .from('couple_activities')
        .update(updateData)
        .eq('id', activityId);

      if (error) throw error;

      fetchActivities();
      if (status === 'completed') {
        setActiveActivity(null);
        toast({
          title: "Activity Completed!",
          description: "Great job completing this activity together!",
        });
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error",
        description: "Failed to update activity",
        variant: "destructive"
      });
    }
  };

  const activityTemplates = [
    {
      type: 'question',
      title: '20 Questions for Couples',
      description: 'Deepen your connection with thoughtful questions',
      icon: MessageCircle,
      initialData: {
        currentQuestion: 0,
        questions: [
          "What's your favorite memory of us together?",
          "If you could travel anywhere with me, where would it be?",
          "What's something new you'd like to try together?",
          "What do you love most about our relationship?",
          "What's a goal you have for us as a couple?",
          "What's your favorite thing I do for you?",
          "How do you like to show love?",
          "What's something you're grateful for today?",
          "What's a tradition you'd like us to start?",
          "What makes you feel most loved by me?",
          "What's your favorite way to spend time together?",
          "What's something you admire about me?",
          "What's a challenge we've overcome together?",
          "What's your favorite date we've been on?",
          "What's something you want to learn about me?",
          "What's your favorite quality about yourself?",
          "What's a dream you have for our future?",
          "What's something that always makes you smile?",
          "What's your favorite way to relax together?",
          "What are you most excited about in our relationship?"
        ]
      }
    },
    {
      type: 'game',
      title: 'Love Language Quiz',
      description: 'Discover each other\'s love languages',
      icon: Heart,
      initialData: {
        currentPlayer: 1,
        player1Score: { words: 0, acts: 0, gifts: 0, time: 0, touch: 0 },
        player2Score: { words: 0, acts: 0, gifts: 0, time: 0, touch: 0 },
        currentQuestion: 0,
        questions: [
          {
            question: "What makes you feel most loved?",
            options: [
              { text: "Hearing 'I love you' and compliments", type: "words" },
              { text: "Getting help with tasks", type: "acts" },
              { text: "Receiving thoughtful gifts", type: "gifts" },
              { text: "Spending quality time together", type: "time" },
              { text: "Hugs, kisses, and physical closeness", type: "touch" }
            ]
          }
          // Add more questions...
        ]
      }
    },
    {
      type: 'challenge',
      title: '7-Day Gratitude Challenge',
      description: 'Share what you\'re grateful for each day',
      icon: Trophy,
      initialData: {
        day: 1,
        entries: []
      }
    },
    {
      type: 'date_idea',
      title: 'Virtual Date Night',
      description: 'Creative ideas for your next date',
      icon: Calendar,
      initialData: {
        ideas: [
          "Cook the same meal together over video call",
          "Watch a movie simultaneously and text reactions",
          "Take a virtual museum tour together",
          "Play online games together",
          "Have a themed photo shoot at home",
          "Write letters to your future selves",
          "Create a shared playlist",
          "Do a puzzle together online",
          "Have a virtual picnic",
          "Learn something new together online"
        ],
        currentIdea: 0,
        completed: []
      }
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'game': return GameController2;
      case 'challenge': return Trophy;
      case 'date_idea': return Calendar;
      case 'question': return MessageCircle;
      default: return Heart;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-primary';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Heart className="w-8 h-8 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Couple Activities</h2>
        <p className="text-muted-foreground">Fun ways to connect and grow together</p>
      </div>

      {/* Active Activity */}
      {activeActivity && (
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-heart rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{activeActivity.title}</h3>
                <p className="text-sm text-muted-foreground">Currently Active</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateActivityStatus(activeActivity.id, 'paused')}
              >
                <Pause className="w-4 h-4" />
              </Button>
              <Button
                variant="romantic"
                size="sm"
                onClick={() => updateActivityStatus(activeActivity.id, 'completed')}
              >
                Complete
              </Button>
            </div>
          </div>

          {/* Activity Content */}
          <div className="space-y-4">
            {activeActivity.activity_type === 'question' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Question {(activeActivity.data.currentQuestion || 0) + 1} of {activeActivity.data.questions?.length || 0}
                  </span>
                  <Progress 
                    value={((activeActivity.data.currentQuestion || 0) + 1) / (activeActivity.data.questions?.length || 1) * 100} 
                    className="w-32"
                  />
                </div>
                <Card className="p-4 bg-background">
                  <p className="text-lg">
                    {activeActivity.data.questions?.[activeActivity.data.currentQuestion || 0]}
                  </p>
                </Card>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const nextQuestion = (activeActivity.data.currentQuestion || 0) + 1;
                      if (nextQuestion < activeActivity.data.questions.length) {
                        updateActivityStatus(activeActivity.id, 'active', {
                          ...activeActivity.data,
                          currentQuestion: nextQuestion
                        });
                      } else {
                        updateActivityStatus(activeActivity.id, 'completed');
                      }
                    }}
                  >
                    Next Question
                  </Button>
                </div>
              </div>
            )}

            {activeActivity.activity_type === 'challenge' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Day {activeActivity.data.day || 1} of 7
                  </span>
                  <Progress 
                    value={(activeActivity.data.day || 1) / 7 * 100} 
                    className="w-32"
                  />
                </div>
                <Card className="p-4 bg-background">
                  <p className="text-lg mb-3">
                    Share something you're grateful for today
                  </p>
                  <Button
                    variant="romantic"
                    onClick={() => {
                      const nextDay = (activeActivity.data.day || 1) + 1;
                      if (nextDay <= 7) {
                        updateActivityStatus(activeActivity.id, 'active', {
                          ...activeActivity.data,
                          day: nextDay
                        });
                      } else {
                        updateActivityStatus(activeActivity.id, 'completed');
                      }
                    }}
                  >
                    Mark Today Complete
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Available Activities */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Start New Activity</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {activityTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card key={template.title} className="p-4 hover:shadow-romantic transition-romantic">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 gradient-heart rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{template.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => startActivity(template)}
                      disabled={!!activeActivity}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Activity
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      {activities.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => {
              const Icon = getActivityIcon(activity.activity_type);
              return (
                <Card key={activity.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(activity.status)} text-white`}
                      >
                        {activity.status}
                      </Badge>
                      {activity.status === 'paused' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateActivityStatus(activity.id, 'active')}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};