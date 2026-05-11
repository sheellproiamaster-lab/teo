-- Migration: add usage tracking to users + ensure messages table has needed columns
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Usage tracking columns on users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS messages_used INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cooldown_end BIGINT DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS usage_date TEXT DEFAULT '';

-- 2. Message persistence columns (image and document support)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 3. Make sure users can update their own usage columns (add if RLS is active)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
      AND policyname = 'Users can update own usage'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can update own usage"
      ON public.users
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
    $policy$;
  END IF;
END $$;
