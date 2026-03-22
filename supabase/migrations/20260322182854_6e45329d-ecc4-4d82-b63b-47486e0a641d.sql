
ALTER TABLE public.public_leads
  ADD COLUMN IF NOT EXISTS uhomesales_lead_id uuid,
  ADD COLUMN IF NOT EXISTS sincronizado_em timestamp with time zone;
