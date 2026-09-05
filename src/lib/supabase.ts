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

export type SocialPost = {
  id: number;
  ucp_id: number;
  character_name: string | null;
  content: string;
  media_url: string | null;
  media_type: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
};

export type SocialLike = {
  id: number;
  post_id: number;
  character_name: string;
  created_at: string;
};

export type SocialComment = {
  id: number;
  post_id: number;
  ucp_id: number;
  character_name: string | null;
  content: string;
  created_at: string;
};

export type UpdateLog = {
  id: number;
  version: string;
  title: string;
  body: string;
  category: string;
  author: string;
  created_at: string;
};

export type ProfileSettings = {
  id: number;
  ucp_id: number;
  avatar_url: string;
  display_name: string;
  bio: string;
  updated_at: string;
};

export type RankInfo = {
  level: number;
  label: string;
  isAdmin: boolean;
  canManageAnnouncements: boolean;
  canManageUpdateLogs: boolean;
  canBan: boolean;
};

export function getRankFromLevel(level: number): RankInfo {
  if (level >= 10) return { level, label: 'Developer', isAdmin: true, canManageAnnouncements: true, canManageUpdateLogs: true, canBan: true };
  if (level >= 8) return { level, label: 'Head Admin', isAdmin: true, canManageAnnouncements: true, canManageUpdateLogs: true, canBan: true };
  if (level >= 6) return { level, label: 'Senior Admin', isAdmin: true, canManageAnnouncements: true, canManageUpdateLogs: false, canBan: true };
  if (level >= 4) return { level, label: 'Moderator', isAdmin: true, canManageAnnouncements: true, canManageUpdateLogs: false, canBan: false };
  if (level >= 2) return { level, label: 'Helper', isAdmin: false, canManageAnnouncements: false, canManageUpdateLogs: false, canBan: false };
  return { level, label: 'Member', isAdmin: false, canManageAnnouncements: false, canManageUpdateLogs: false, canBan: false };
}

export type DonationPackage = {
  id: number;
  label: string;
  amount: number;
  credits: number;
  is_popular: boolean;
  display_order: number;
};

export type Donation = {
  id: number;
  character_name: string;
  amount: number;
  credits: number;
  payment_method: string;
  voucher_code: string | null;
  status: string;
  created_at: string;
};

export type ServerStatus = {
  online: boolean;
  hostname: string;
  gamemode: string;
  language: string;
  players: number;
  maxPlayers: number;
  ping: number;
};
