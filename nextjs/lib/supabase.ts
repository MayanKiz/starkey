import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && key ? createClient(url, key) : null;

export type Rank = 'Leader' | 'Guardian' | 'Member' | 'Newcomer';
export type User = { id: string; nickname: string; rank?: Rank; login_pin: string; connection_pin: string; is_online: boolean; last_seen: string; created_at: string };
export type Message = { id: string; sender: 'he' | 'she'; content: string | null; message_type: 'text' | 'voice' | 'heartbeat'; voice_url: string | null; reactions: string[]; is_read: boolean; created_at: string; sender_id: string | null; receiver_id: string | null };
