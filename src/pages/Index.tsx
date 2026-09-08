import { useEffect, useState } from 'react';
import PinEntry from '@/components/PinEntry';
import CreateIdentity from '@/components/CreateIdentity';
import SecureHub from '@/components/SecureHub';
import { registerServiceWorker } from '@/lib/notifications';
import { User } from '@/lib/supabase';

type ViewMode = 'pin' | 'signup' | 'hub';

const Index = () => {
  const [view, setView] = useState<ViewMode>('pin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => { registerServiceWorker(); }, []);
  const handleDeleteAccount = () => { setCurrentUser(null); setView('pin'); };
  return <main className="app-shell">
    {view === 'pin' && <PinEntry onAccess={(user) => { setCurrentUser(user); setView('hub'); }} onCreateIdentity={() => setView('signup')} />}
    {view === 'signup' && <CreateIdentity onBack={() => setView('pin')} onSuccess={() => setView('pin')} />}
    {view === 'hub' && currentUser && <SecureHub currentUser={currentUser} onBack={() => { setCurrentUser(null); setView('pin'); }} onDeleteAccount={handleDeleteAccount} />}
  </main>;
};
export default Index;
