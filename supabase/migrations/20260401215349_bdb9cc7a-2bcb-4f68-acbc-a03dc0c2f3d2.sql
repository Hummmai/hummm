-- Create negotiation conversations table
CREATE TABLE public.negotiation_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_address TEXT NOT NULL,
  property_url TEXT,
  postcode TEXT,
  agent_name TEXT,
  agent_email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  reply_to_id TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create negotiation emails table
CREATE TABLE public.negotiation_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.negotiation_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL DEFAULT 'outbound',
  sender_name TEXT,
  sender_email TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  ai_drafted BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.negotiation_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_emails ENABLE ROW LEVEL SECURITY;

-- Conversation policies
CREATE POLICY "Users can view own conversations"
  ON public.negotiation_conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own conversations"
  ON public.negotiation_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON public.negotiation_conversations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
  ON public.negotiation_conversations FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Service role manages conversations"
  ON public.negotiation_conversations FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Email policies (user can access emails in their own conversations)
CREATE POLICY "Users can view emails in own conversations"
  ON public.negotiation_emails FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM public.negotiation_conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create emails in own conversations"
  ON public.negotiation_emails FOR INSERT
  WITH CHECK (conversation_id IN (
    SELECT id FROM public.negotiation_conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role manages emails"
  ON public.negotiation_emails FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_neg_conversations_user ON public.negotiation_conversations(user_id);
CREATE INDEX idx_neg_conversations_reply_to ON public.negotiation_conversations(reply_to_id);
CREATE INDEX idx_neg_emails_conversation ON public.negotiation_emails(conversation_id);

-- Enable realtime for emails
ALTER PUBLICATION supabase_realtime ADD TABLE public.negotiation_emails;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_neg_conv_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_neg_conv_updated_at
  BEFORE UPDATE ON public.negotiation_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_neg_conv_updated_at();