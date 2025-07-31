-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  pair_code TEXT UNIQUE,
  partner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create couples table to manage relationships
CREATE TABLE public.couples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship_status TEXT DEFAULT 'active',
  anniversary_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partner1_id, partner2_id)
);

-- Create video calls table
CREATE TABLE public.video_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL REFERENCES public.profiles(id),
  call_duration INTEGER DEFAULT 0,
  call_status TEXT DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memories table for shared timeline
CREATE TABLE public.memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  content TEXT,
  memory_type TEXT DEFAULT 'note',
  image_url TEXT,
  memory_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their partner's profile" 
ON public.profiles FOR SELECT 
USING (
  auth.uid() = user_id OR 
  id = (SELECT partner_id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for couples
CREATE POLICY "Couples can view their own relationship" 
ON public.couples FOR ALL 
USING (
  partner1_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR 
  partner2_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- RLS Policies for video calls
CREATE POLICY "Users can manage their couple's video calls" 
ON public.video_calls FOR ALL 
USING (
  couple_id IN (
    SELECT id FROM public.couples 
    WHERE partner1_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
    OR partner2_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- RLS Policies for memories
CREATE POLICY "Users can manage their couple's memories" 
ON public.memories FOR ALL 
USING (
  couple_id IN (
    SELECT id FROM public.couples 
    WHERE partner1_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
    OR partner2_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Function to generate unique pair codes
CREATE OR REPLACE FUNCTION generate_pair_code() 
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE pair_code = code) THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, pair_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    generate_pair_code()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_couples_updated_at BEFORE UPDATE ON public.couples FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();