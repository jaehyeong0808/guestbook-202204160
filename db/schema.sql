create extension if not exists pgcrypto;

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  password_hash text not null,
  like_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table entries add column if not exists like_count integer not null default 0;

create index if not exists entries_created_at_idx on entries (created_at desc);
