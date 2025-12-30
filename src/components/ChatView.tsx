import { useEffect, useRef, useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import PendingMessageBubble from './PendingMessageBubble';
import ChatInput from './ChatInput';
import SettingsSheet from './SettingsSheet';
import PresenceNotification from './PresenceNotification';
import { useMessages } from '@/hooks/useMessages';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { usePanicTap } from '@/hooks/usePanicTap';
import { usePresence } from '@/hooks/usePresence';
import { useMessageQueue } from '@/hooks/useMessageQueue';
import { supabase } from '@/lib/supabase';
import { sendStealthNotification, markMessagesAsRead } from '@/lib/notifications';
import { WifiOff } from 'lucide-react';

interface ChatViewProps {
  currentUser: 'he' | 'she';
  onBack: () => void;
}

const ChatView = ({ currentUser, onBack }: ChatViewProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, loading, addReaction, markAsRead, nukeAllMessages } = useMessages(currentUser);
  const { otherTyping, setTyping } = useTypingIndicator(currentUser);
  const { presenceEvents, isOtherOnline, dismissEvent } = usePresence(currentUser);
  const { pendingMessages, isOnline, queueMessage, retryMessage } = useMessageQueue(currentUser);
  
  usePanicTap();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingMessages]);

  // Mark incoming messages as read and clear notification state
  useEffect(() => {
    const unreadMessages = messages.filter(m => m.sender !== currentUser && !m.is_read);
    if (unreadMessages.length > 0) {
      unreadMessages.forEach(m => markAsRead(m.id));
      markMessagesAsRead();
    }
  }, [messages, currentUser, markAsRead]);

  // Send notification for new incoming messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender !== currentUser && !document.hasFocus()) {
      sendStealthNotification();
    }
  }, [messages, currentUser]);

  // Load wallpaper setting
  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from('chat_settings')
        .select('wallpaper_url')
        .eq('id', currentUser)
        .single();
      
      if (data?.wallpaper_url) {
        setWallpaper(data.wallpaper_url);
      }
    };
    
    loadSettings();

    const channel = supabase
      .channel('settings-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_settings' },
        (payload) => {
          if (payload.new.id === currentUser) {
            setWallpaper(payload.new.wallpaper_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Notify other user when leaving
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTyping(false);
      }
    };

    const handleBeforeUnload = () => {
      setTyping(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [setTyping]);

  const getWallpaperStyle = () => {
    if (!wallpaper) {
      return { background: 'var(--gradient-romantic)' };
    }
    if (wallpaper.startsWith('linear-gradient')) {
      return { background: wallpaper };
    }
    return { 
      backgroundImage: `url(${wallpaper})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  };

  const handleSendMessage = async (content: string, type: 'text' | 'voice' | 'heartbeat', voiceUrl?: string) => {
    await queueMessage(content, type, voiceUrl);
  };

  return (
    <div className="h-screen flex flex-col">
      <ChatHeader
        currentUser={currentUser}
        otherTyping={otherTyping}
        isOtherOnline={isOtherOnline}
        onSettings={() => setSettingsOpen(true)}
        onBack={onBack}
      />

      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-600" />
          <span className="text-xs text-amber-700 font-medium">You're offline. Messages will be sent when connected.</span>
        </div>
      )}

      {/* Messages area */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4 relative"
        style={getWallpaperStyle()}
      >
        {/* Presence notifications */}
        <PresenceNotification events={presenceEvents} onDismiss={dismissEvent} />

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading messages...</div>
          </div>
        ) : messages.length === 0 && pendingMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4 animate-float">💕</div>
            <h3 className="font-display text-xl text-foreground/80 mb-2">
              Start your conversation
            </h3>
            <p className="text-sm text-muted-foreground max-w-[250px]">
              Send a message or tap the heart to send a heartbeat
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSent={message.sender === currentUser}
                onReaction={addReaction}
              />
            ))}
            
            {/* Pending messages */}
            {pendingMessages.map((message) => (
              <PendingMessageBubble
                key={message.id}
                message={message}
                onRetry={retryMessage}
              />
            ))}
            
            {/* Typing indicator */}
            {otherTyping && (
              <div className="flex justify-start mb-3 animate-fade-in">
                <div className="bubble-received px-4 py-3">
                  <div className="flex gap-1">
                    <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
                    <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput
        onSend={handleSendMessage}
        onTyping={setTyping}
      />

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        currentUser={currentUser}
        onNuke={nukeAllMessages}
      />
    </div>
  );
};

export default ChatView;
