import { useState, useEffect, useCallback } from 'react';
import { 
  PendingMessage, 
  savePendingMessage, 
  getPendingMessages, 
  removePendingMessage,
  updateMessageStatus,
  sendMessageToSupabase,
  processMessageQueue 
} from '@/lib/messageQueue';

export const useMessageQueue = (currentUser: 'he' | 'she' | null) => {
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load pending messages on mount
  useEffect(() => {
    const loadPending = async () => {
      const messages = await getPendingMessages();
      setPendingMessages(messages.filter(m => m.sender === currentUser));
    };
    loadPending();
  }, [currentUser]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processMessageQueue().then(async () => {
        const messages = await getPendingMessages();
        setPendingMessages(messages.filter(m => m.sender === currentUser));
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  const queueMessage = useCallback(async (
    content: string, 
    type: 'text' | 'voice' | 'heartbeat' = 'text',
    voiceUrl?: string
  ): Promise<PendingMessage> => {
    if (!currentUser) throw new Error('No user');

    const message: PendingMessage = {
      id: crypto.randomUUID(),
      sender: currentUser,
      content,
      message_type: type,
      voice_url: voiceUrl,
      created_at: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
    };

    await savePendingMessage(message);
    setPendingMessages(prev => [...prev, message]);

    // Try to send immediately if online
    if (navigator.onLine) {
      await updateMessageStatus(message.id, 'sending');
      setPendingMessages(prev => 
        prev.map(m => m.id === message.id ? { ...m, status: 'sending' } : m)
      );

      const success = await sendMessageToSupabase(message);
      
      if (success) {
        await removePendingMessage(message.id);
        setPendingMessages(prev => prev.filter(m => m.id !== message.id));
      } else {
        await updateMessageStatus(message.id, 'failed', 1);
        setPendingMessages(prev => 
          prev.map(m => m.id === message.id ? { ...m, status: 'failed', retryCount: 1 } : m)
        );
      }
    }

    return message;
  }, [currentUser]);

  const retryMessage = useCallback(async (id: string) => {
    const message = pendingMessages.find(m => m.id === id);
    if (!message) return;

    await updateMessageStatus(id, 'sending');
    setPendingMessages(prev => 
      prev.map(m => m.id === id ? { ...m, status: 'sending' } : m)
    );

    const success = await sendMessageToSupabase(message);

    if (success) {
      await removePendingMessage(id);
      setPendingMessages(prev => prev.filter(m => m.id !== id));
    } else {
      const newRetryCount = message.retryCount + 1;
      await updateMessageStatus(id, 'failed', newRetryCount);
      setPendingMessages(prev => 
        prev.map(m => m.id === id ? { ...m, status: 'failed', retryCount: newRetryCount } : m)
      );
    }
  }, [pendingMessages]);

  return {
    pendingMessages,
    isOnline,
    queueMessage,
    retryMessage,
  };
};
