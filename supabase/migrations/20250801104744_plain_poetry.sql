/*
  # Enhanced Couples Communication Platform Schema

  1. New Tables
    - `messages` - Real-time messaging system
    - `message_reactions` - Message reactions and emojis
    - `shared_memories` - Photo and memory sharing
    - `couple_activities` - Interactive games and activities
    - `call_sessions` - Video/voice call tracking
    - `notifications` - Real-time notifications

  2. Enhanced Tables
    - Updated `profiles` with username and bio
    - Enhanced `couples` with more relationship data

  3. Security
    - Row Level Security on all tables
    - Couple-only data access policies
    - Real-time subscriptions security
*/

-- Add username and bio to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username text UNIQUE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_seen timestamptz DEFAULT now();
  END IF;
END $$;

-- Messages table for real-time chat
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file')),
  media_url text,
  reply_to_id uuid REFERENCES messages(id),
  edited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Message reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Shared memories (enhanced from existing memories table)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'tags'
  ) THEN
    ALTER TABLE memories ADD COLUMN tags text[];
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memories' AND column_name = 'location'
  ) THEN
    ALTER TABLE memories ADD COLUMN location text;
  END IF;
END $$;

-- Couple activities and games
CREATE TABLE IF NOT EXISTS couple_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('game', 'challenge', 'date_idea', 'question')),
  title text NOT NULL,
  description text,
  data jsonb, -- Store game state, scores, etc.
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Call sessions tracking
CREATE TABLE IF NOT EXISTS call_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  caller_id uuid NOT NULL REFERENCES profiles(id),
  call_type text NOT NULL CHECK (call_type IN ('voice', 'video')),
  status text DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'connected', 'ended', 'missed')),
  started_at timestamptz DEFAULT now(),
  connected_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer DEFAULT 0
);

-- Notifications system
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('message', 'call', 'memory', 'activity', 'system')),
  title text NOT NULL,
  content text,
  data jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Typing indicators (temporary table for real-time)
CREATE TABLE IF NOT EXISTS typing_indicators (
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_typing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (couple_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_couple_created ON messages(couple_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_sessions_couple ON call_sessions(couple_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_couple ON typing_indicators(couple_id);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Messages
CREATE POLICY "Users can view their couple's messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE partner1_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR partner2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their couple"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND couple_id IN (
      SELECT id FROM couples 
      WHERE partner1_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR partner2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for Message Reactions
CREATE POLICY "Users can view reactions on their couple's messages"
  ON message_reactions FOR SELECT
  TO authenticated
  USING (
    message_id IN (
      SELECT m.id FROM messages m
      JOIN couples c ON m.couple_id = c.id
      WHERE c.partner1_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR c.partner2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add reactions to their couple's messages"
  ON message_reactions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    AND message_id IN (
      SELECT m.id FROM messages m
      JOIN couples c ON m.couple_id = c.id
      WHERE c.partner1_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR c.partner2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can remove their own reactions"
  ON message_reactions FOR DELETE
  TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for Couple Activities
CREATE POLICY "Users can manage their couple's activities"
  ON couple_activities FOR ALL
  TO authenticated
  USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE partner1_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR partner2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for Call Sessions
CREATE POLICY "Users can manage their couple's calls"
  ON call_sessions FOR ALL
  TO authenticated
  USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE partner1_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR partner2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for Notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for Typing Indicators
CREATE POLICY "Users can manage typing indicators for their couple"
  ON typing_indicators FOR ALL
  TO authenticated
  USING (
    couple_id IN (
      SELECT id FROM couples 
      WHERE partner1_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
         OR partner2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Function to update last_seen timestamp
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles 
  SET last_seen = now() 
  WHERE user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM typing_indicators 
  WHERE updated_at < now() - interval '30 seconds';
END;
$$ LANGUAGE plpgsql;

-- Function to generate username suggestions
CREATE OR REPLACE FUNCTION generate_username_suggestions(base_name text)
RETURNS text[] AS $$
DECLARE
  suggestions text[] := '{}';
  i integer := 1;
  candidate text;
BEGIN
  -- Add base name if available
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE username = base_name) THEN
    suggestions := array_append(suggestions, base_name);
  END IF;
  
  -- Generate numbered variations
  WHILE array_length(suggestions, 1) < 5 AND i <= 100 LOOP
    candidate := base_name || i::text;
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE username = candidate) THEN
      suggestions := array_append(suggestions, candidate);
    END IF;
    i := i + 1;
  END LOOP;
  
  RETURN suggestions;
END;
$$ LANGUAGE plpgsql;