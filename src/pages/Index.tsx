import { useEffect, useState } from 'react';
import PinEntry from '@/components/PinEntry';
import CreateIdentity from '@/components/CreateIdentity';
import UserHub from '@/components/UserHub';
import ChatView from '@/components/ChatView';
import { registerServiceWorker } from '@/lib/notifications';
import { User } from '@/lib/supabase';

type ViewMode = 'pin' | 'signup' | 'hub' | 'chat';

const Index = () => {
  const [view, setView] = useState<ViewMode>('pin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatPartner, setChatPartner] = useState<User | null>(null);

  useEffect(() => { registerServiceWorker(); }, []);

  const handleLogin = (user: User) => { setCurrentUser(user); setView('hub'); };
  const handleBack = () => {
    if (view === 'chat') { setChatPartner(null); setView('hub'); }
    else { setCurrentUser(null); setView('pin'); }
  };
  const handleDeleteAccount = () => { setCurrentUser(null); setChatPartner(null); setView('pin'); };

  return (
    <main className="app-shell">
      {view === 'pin' && <PinEntry onAccess={handleLogin} onCreateIdentity={() => setView('signup')} />}
      {view === 'signup' && <CreateIdentity onBack={() => setView('pin')} onSuccess={() => setView('pin')} />}
      {view === 'hub' && currentUser && (
        <UserHub currentUser={currentUser} onBack={handleBack} onConnect={(user) => { setChatPartner(user); setView('chat'); }} onDeleteAccount={handleDeleteAccount} />
      )}
      {view === 'chat' && currentUser && chatPartner && <ChatView currentUser={currentUser} chatPartner={chatPartner} onBack={handleBack} />}
    </main>
  );
};

export default Index;
