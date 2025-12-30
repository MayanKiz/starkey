import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export const useTypingIndicator = (currentUser: 'he' | 'she' | null) => {
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const otherId = currentUser === 'he' ? 'she' : 'he';

  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('typing-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'typing_status' },
        (payload) => {
          if (payload.new.id === otherId) {
            setOtherTyping(payload.new.is_typing);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, otherId]);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!currentUser) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await supabase
      .from('typing_status')
      .update({ is_typing: isTyping, updated_at: new Date().toISOString() })
      .eq('id', currentUser);

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 3000);
    }
  }, [currentUser]);

  return { otherTyping, setTyping };
};
