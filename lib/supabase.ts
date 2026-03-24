import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder_anon_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ----- SQL スキーマ（Supabaseダッシュボードで実行してください） -----
// create table emotion_logs (
//   id          uuid primary key default gen_random_uuid(),
//   user_id     uuid references auth.users not null,
//   partner_id  uuid references auth.users,
//   emotion_id  int not null check (emotion_id between 1 and 9),
//   message     text,
//   created_at  timestamptz default now()
// );
//
// create table partner_connections (
//   id              uuid primary key default gen_random_uuid(),
//   user_id         uuid references auth.users not null,
//   partner_user_id uuid references auth.users not null,
//   status          text default 'pending' check (status in ('pending','active')),
//   invite_code     text unique not null,
//   created_at      timestamptz default now()
// );
//
// create table streaks (
//   user_id        uuid references auth.users primary key,
//   current_streak int default 0,
//   longest_streak int default 0,
//   last_sent_at   timestamptz
// );
//
// -- RLS ポリシー（各テーブル）
// alter table emotion_logs enable row level security;
// create policy "own_logs" on emotion_logs using (auth.uid() = user_id);
// alter table partner_connections enable row level security;
// create policy "own_connections" on partner_connections using (auth.uid() = user_id or auth.uid() = partner_user_id);
// alter table streaks enable row level security;
// create policy "own_streak" on streaks using (auth.uid() = user_id);
