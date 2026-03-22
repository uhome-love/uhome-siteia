
-- Add missing columns to profiles for corretor sync
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS uhomesales_id uuid UNIQUE,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS telefone text,
  ADD COLUMN IF NOT EXISTS foto_url text,
  ADD COLUMN IF NOT EXISTS creci text,
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS sincronizado_em timestamp with time zone;

-- Create sync_log table
CREATE TABLE IF NOT EXISTS public.sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  direcao text NOT NULL,
  tipo text NOT NULL,
  payload jsonb,
  sucesso boolean DEFAULT true,
  erro text
);

ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read sync_log" ON public.sync_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service can insert sync_log" ON public.sync_log
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
