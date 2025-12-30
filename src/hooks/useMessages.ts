import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/lib/supabase';

export const useMessages = (currentUser: 'he' | 'she' | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data as Message[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
            
            // Play notification sound for incoming messages
            if (currentUser && (payload.new as Message).sender !== currentUser) {
              playNotificationSound();
            }
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => 
              m.id === payload.new.id ? payload.new as Message : m
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages, currentUser]);

  const sendMessage = async (content: string, type: 'text' | 'voice' | 'heartbeat' = 'text', voiceUrl?: string) => {
    if (!currentUser) return;

    const { error } = await supabase.from('messages').insert({
      sender: currentUser,
      content,
      message_type: type,
      voice_url: voiceUrl,
    });

    if (error) {
      console.error('Error sending message:', error);
    }
  };

  const addReaction = async (messageId: string, reaction: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const currentReactions = Array.isArray(message.reactions) ? message.reactions : [];
    const updatedReactions = currentReactions.includes(reaction)
      ? currentReactions.filter(r => r !== reaction)
      : [...currentReactions, reaction];

    const { error } = await supabase
      .from('messages')
      .update({ reactions: updatedReactions })
      .eq('id', messageId);

    if (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);
  };

  const nukeAllMessages = async () => {
    // Hard delete ALL messages from database - no trace left
    const { error } = await supabase
      .from('messages')
      .delete()
      .gte('created_at', '1970-01-01'); // Deletes all rows
    
    if (error) {
      console.error('Error deleting messages:', error);
      return false;
    }
    
    // Clear local state immediately
    setMessages([]);
    
    // Clear any cached messages in localStorage
    localStorage.removeItem('pending_messages');
    
    return true;
  };

  return {
    messages,
    loading,
    sendMessage,
    addReaction,
    markAsRead,
    nukeAllMessages,
  };
};

const playNotificationSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  audio.volume = 0.3;
  audio.play().catch(() => {});
};
