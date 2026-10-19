-- HDL Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor

create table public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  state jsonb not null default '{}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.saves enable row level security;

create policy "Users can view their own save"
  on public.saves for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Users can insert their own save"
  on public.saves for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "Users can update their own save"
  on public.saves for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "Users can delete their own save"
  on public.saves for delete to authenticated
  using ( (select auth.uid()) = user_id );
