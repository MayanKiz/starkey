import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type Message = {
  id: string;
  sender: 'he' | 'she';
  content: string | null;
  message_type: 'text' | 'voice' | 'heartbeat';
  voice_url: string | null;
  reactions: string[];
  is_read: boolean;
  created_at: string;
};

export type TypingStatus = {
  id: 'he' | 'she';
  is_typing: boolean;
  updated_at: string;
};

export type ChatSettings = {
  id: 'he' | 'she';
  wallpaper_url: string | null;
  updated_at: string;
};
