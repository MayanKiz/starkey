import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface PresenceEvent {
  type: 'join' | 'leave';
  user: 'he' | 'she';
  timestamp: number;
}

export const usePresence = (currentUser: 'he' | 'she') => {
  const [presenceEvents, setPresenceEvents] = useState<PresenceEvent[]>([]);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  
  const otherUser = currentUser === 'he' ? 'she' : 'he';
  
  const addEvent = useCallback((event: PresenceEvent) => {
    setPresenceEvents(prev => {
      const newEvents = [...prev, event];
      // Keep only last 5 events
      return newEvents.slice(-5);
    });
    
    // Auto-remove event after 4 seconds
    setTimeout(() => {
      setPresenceEvents(prev => prev.filter(e => e.timestamp !== event.timestamp));
    }, 4000);
  }, []);

  useEffect(() => {
    const channel = supabase.channel('presence-room', {
      config: {
        presence: {
          key: currentUser,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setIsOtherOnline(!!state[otherUser]?.length);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key === otherUser) {
          setIsOtherOnline(true);
          addEvent({
            type: 'join',
            user: otherUser,
            timestamp: Date.now(),
          });
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === otherUser) {
          setIsOtherOnline(false);
          addEvent({
            type: 'leave',
            user: otherUser,
            timestamp: Date.now(),
          });
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user: currentUser,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, otherUser, addEvent]);

  const dismissEvent = useCallback((timestamp: number) => {
    setPresenceEvents(prev => prev.filter(e => e.timestamp !== timestamp));
  }, []);

  return {
    presenceEvents,
    isOtherOnline,
    dismissEvent,
  };
};
