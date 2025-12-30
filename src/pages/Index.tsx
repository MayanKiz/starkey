import { useState, useEffect } from 'react';
import PinEntry from '@/components/PinEntry';
import ChatView from '@/components/ChatView';
import VaultView from '@/components/VaultView';
import NotificationPermission from '@/components/NotificationPermission';
import { registerServiceWorker } from '@/lib/notifications';

type ViewMode = 'pin' | 'chat' | 'vault';
type UserType = 'he' | 'she' | null;

const Index = () => {
  const [view, setView] = useState<ViewMode>('pin');
  const [currentUser, setCurrentUser] = useState<UserType>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  const handleAccess = (user: 'he' | 'she' | 'vault') => {
    if (user === 'vault') {
      setView('vault');
    } else {
      setCurrentUser(user);
      setView('chat');
      
      // Show notification prompt on first login if not already granted
      if ('Notification' in window && Notification.permission === 'default') {
        const hasAsked = localStorage.getItem('notification_asked');
        if (!hasAsked) {
          setShowNotificationPrompt(true);
          localStorage.setItem('notification_asked', 'true');
        }
      }
    }
  };

  const handleBack = () => {
    setView('pin');
    setCurrentUser(null);
  };

  return (
    <>
      {view === 'pin' && <PinEntry onAccess={handleAccess} />}
      {view === 'chat' && currentUser && (
        <ChatView currentUser={currentUser} onBack={handleBack} />
      )}
      {view === 'vault' && <VaultView onBack={handleBack} />}
      
      {showNotificationPrompt && (
        <NotificationPermission onClose={() => setShowNotificationPrompt(false)} />
      )}
    </>
  );
};

export default Index;
