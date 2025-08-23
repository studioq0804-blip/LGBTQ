/*
  # チャット機能のテーブル作成

  1. New Tables
    - `chat_threads`
      - `id` (uuid, primary key)
      - `match_id` (uuid)
      - `participant_a` (uuid, foreign key to users)
      - `participant_b` (uuid, foreign key to users)
      - `last_message_id` (uuid, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `chat_thread_id` (uuid, foreign key)
      - `sender_id` (uuid, foreign key to users)
      - `content` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for participants to access their own chats
    - Add policies for message access based on chat participation

  3. Indexes
    - Add indexes for performance optimization
    - Chat thread lookup by participants
    - Message ordering by timestamp
*/

-- Chat threads table
CREATE TABLE IF NOT EXISTS chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid,
  participant_a uuid NOT NULL,
  participant_b uuid NOT NULL,
  last_message_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(participant_a, participant_b)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_thread_id uuid NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key for last_message_id after messages table is created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chat_threads_last_message_id_fkey'
  ) THEN
    ALTER TABLE chat_threads 
    ADD CONSTRAINT chat_threads_last_message_id_fkey 
    FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_threads
CREATE POLICY "Users can view their own chat threads"
  ON chat_threads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can create chat threads"
  ON chat_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can update their own chat threads"
  ON chat_threads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = participant_a OR auth.uid() = participant_b);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their chats"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_threads ct
      WHERE ct.id = messages.chat_thread_id
      AND (ct.participant_a = auth.uid() OR ct.participant_b = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their chats"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_threads ct
      WHERE ct.id = messages.chat_thread_id
      AND (ct.participant_a = auth.uid() OR ct.participant_b = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_threads_participants 
  ON chat_threads(participant_a, participant_b);

CREATE INDEX IF NOT EXISTS idx_chat_threads_updated_at 
  ON chat_threads(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_chat_thread_id 
  ON messages(chat_thread_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at 
  ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id 
  ON messages(sender_id);

-- Function to update chat thread's updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_threads 
  SET updated_at = now(), last_message_id = NEW.id
  WHERE id = NEW.chat_thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update chat thread when new message is added
DROP TRIGGER IF EXISTS trigger_update_chat_thread_timestamp ON messages;
CREATE TRIGGER trigger_update_chat_thread_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_thread_timestamp();