import { useState, useEffect } from 'react';
import PinEntry from '@/components/PinEntry';
import ChatView from '@/components/ChatView';
import VaultView from '@/components/VaultView';

type ViewMode = 'pin' | 'chat' | 'vault';
type UserType = 'he' | 'she' | null;

const Index = () => {
  const [view, setView] = useState<ViewMode>('pin');
  const [currentUser, setCurrentUser] = useState<UserType>(null);

  const handleAccess = (user: 'he' | 'she' | 'vault') => {
    if (user === 'vault') {
      setView('vault');
    } else {
      setCurrentUser(user);
      setView('chat');
    }
  };

  const handleBack = () => {
    setView('pin');
    setCurrentUser(null);
  };

  // Stealth notification toast styling
  useEffect(() => {
    // Override notification appearance to look like bank spam
    const style = document.createElement('style');
    style.textContent = `
      [data-sonner-toast] {
        background: hsl(var(--card)) !important;
        border: 1px solid hsl(var(--border)) !important;
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (
    <>
      {view === 'pin' && <PinEntry onAccess={handleAccess} />}
      {view === 'chat' && currentUser && (
        <ChatView currentUser={currentUser} onBack={handleBack} />
      )}
      {view === 'vault' && <VaultView onBack={handleBack} />}
    </>
  );
};

export default Index;
