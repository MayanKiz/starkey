import { useState, useEffect } from 'react';
import PinEntry from '@/components/PinEntry';
import CreateIdentity from '@/components/CreateIdentity';
import UserHub from '@/components/UserHub';
import ChatView from '@/components/ChatView';
import VaultView from '@/components/VaultView';
import SettingsSheet from '@/components/SettingsSheet';
import NotificationPermission from '@/components/NotificationPermission';
import { registerServiceWorker } from '@/lib/notifications';
import { User } from '@/lib/supabase';

type ViewMode = 'pin' | 'signup' | 'hub' | 'chat' | 'vault';

const Index = () => {
  const [view, setView] = useState<ViewMode>('pin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('hub');
    
    // Show notification prompt on first login if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      const hasAsked = localStorage.getItem('notification_asked');
      if (!hasAsked) {
        setShowNotificationPrompt(true);
        localStorage.setItem('notification_asked', 'true');
      }
    }
  };

  const handleConnect = (targetUser: User) => {
    setChatPartner(targetUser);
    setView('chat');
  };

  const handleBack = () => {
    if (view === 'chat') {
      setChatPartner(null);
      setView('hub');
    } else if (view === 'hub') {
      setCurrentUser(null);
      setView('pin');
    } else {
      setView('pin');
    }
  };

  return (
    <>
      {view === 'pin' && (
        <PinEntry 
          onAccess={handleLogin} 
          onVaultAccess={() => setView('vault')}
          onCreateIdentity={() => setView('signup')}
        />
      )}
      
      {view === 'signup' && (
        <CreateIdentity 
          onBack={() => setView('pin')} 
          onSuccess={() => setView('pin')}
        />
      )}
      
      {view === 'hub' && currentUser && (
        <UserHub 
          currentUser={currentUser} 
          onBack={handleBack}
          onConnect={handleConnect}
          onSettings={() => setSettingsOpen(true)}
        />
      )}
      
      {view === 'chat' && currentUser && chatPartner && (
        <ChatView 
          currentUser={currentUser} 
          chatPartner={chatPartner}
          onBack={handleBack} 
        />
      )}
      
      {view === 'vault' && <VaultView onBack={handleBack} />}
      
      {showNotificationPrompt && (
        <NotificationPermission onClose={() => setShowNotificationPrompt(false)} />
      )}

      {/* Global settings for hub */}
      {view === 'hub' && currentUser && (
        <SettingsSheet
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          currentUser={currentUser.id}
          onNuke={async () => true}
        />
      )}
    </>
  );
};

export default Index;
