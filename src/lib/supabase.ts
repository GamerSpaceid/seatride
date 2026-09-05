import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey);

export type Character = {
  id: number;
  ucp_id: number;
  name: string;
  level: number;
  money: number;
  bank: number;
  skin: number;
  age: number;
  gender: boolean;
  health: number;
  armor: number;
  is_online: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
  last_login: string | null;
};

export type Vehicle = {
  id: number;
  character_id: number;
  model_id: number;
  name: string;
  plate: string;
  color: string;
  fuel: number;
  health: number;
  is_spawned: boolean;
  created_at: string;
};

export type ForumCategory = {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  display_order: number;
};

export type ForumTopic = {
  id: number;
  category_id: number;
  ucp_id: number;
  character_name: string | null;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  views: number;
  created_at: string;
  updated_at: string;
};

export type ForumReply = {
  id: number;
  topic_id: number;
  ucp_id: number;
  character_name: string | null;
  content: string;
  created_at: string;
};

export type Announcement = {
  id: number;
  title: string;
  content: string;
  type: string;
  author: string;
  is_active: boolean;
  created_at: string;
};
