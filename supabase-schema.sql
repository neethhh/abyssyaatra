create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table if not exists public.beach_update_submissions (
  id uuid primary key default gen_random_uuid(),
  beach_name text not null check (char_length(trim(beach_name)) between 2 and 120),
  state text not null check (char_length(trim(state)) between 2 and 80),
  proposed_type text check (proposed_type is null or char_length(trim(proposed_type)) <= 80),
  proposed_water text check (proposed_water is null or char_length(trim(proposed_water)) <= 120),
  proposed_tags text[] not null default '{}',
  notes text not null check (char_length(trim(notes)) between 10 and 1000),
  submitter_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists beach_update_submissions_submitter_idx on public.beach_update_submissions (submitter_id, created_at desc);
create index if not exists beach_update_submissions_public_idx on public.beach_update_submissions (beach_name, state, status);
alter table public.beach_update_submissions enable row level security;
drop policy if exists beach_updates_insert_own on public.beach_update_submissions;
drop policy if exists beach_updates_select_own on public.beach_update_submissions;
create policy beach_updates_insert_own on public.beach_update_submissions for insert to authenticated with check ((select auth.uid()) = submitter_id and status = 'pending');
create policy beach_updates_select_own on public.beach_update_submissions for select to authenticated using ((select auth.uid()) = submitter_id);

-- Run this script through the connected Supabase MCP execute_sql tool.
