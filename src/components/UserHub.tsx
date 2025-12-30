import { useState, useEffect } from 'react';
import { Users, Lock, ArrowLeft, Settings, Zap } from 'lucide-react';
import { supabase, User } from '@/lib/supabase';
import { usePanicTap } from '@/hooks/usePanicTap';

interface UserHubProps {
  currentUser: User;
  onBack: () => void;
  onConnect: (targetUser: User) => void;
  onSettings: () => void;
}

const UserHub = ({ currentUser, onBack, onConnect, onSettings }: UserHubProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [connectionPin, setConnectionPin] = useState('');
  const [error, setError] = useState(false);

  usePanicTap();

  useEffect(() => {
    fetchUsers();

    // Realtime subscription for user updates
    const channel = supabase
      .channel('users-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => fetchUsers()
      )
      .subscribe();

    // Mark current user as online
    supabase.from('users').update({ is_online: true, last_seen: new Date().toISOString() })
      .eq('id', currentUser.id);

    // Mark offline on leave
    const handleBeforeUnload = () => {
      supabase.from('users').update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('id', currentUser.id);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [currentUser.id]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('is_online', { ascending: false })
      .order('last_seen', { ascending: false });

    if (data) {
      // Filter out current user
      setUsers((data as User[]).filter(u => u.id !== currentUser.id));
    }
    setLoading(false);
  };

  const handleConnect = () => {
    if (!selectedUser) return;

    if (connectionPin === selectedUser.connection_pin) {
      onConnect(selectedUser);
    } else {
      setError(true);
      setTimeout(() => {
        setConnectionPin('');
        setError(false);
      }, 500);
    }
  };

  const maskPin = (pin: string) => {
    return pin.slice(0, 2) + '****';
  };

  if (selectedUser) {
    return (
      <div className="min-h-screen romantic-gradient starry-bg flex flex-col items-center justify-center p-6">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-lavender-deep/10 rounded-full blur-3xl" />
        </div>

        <div className="glass-card p-8 max-w-sm w-full animate-fade-in relative z-10">
          <button
            onClick={() => { setSelectedUser(null); setConnectionPin(''); }}
            className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-6">
            <div className="relative">
              <Lock className="w-12 h-12 text-rose relative z-10" />
              <div className="absolute inset-0 blur-xl bg-rose/40 rounded-full scale-150" />
            </div>
          </div>

          <h2 className="font-display text-xl text-center text-glow-rose mb-2">
            Connect to {selectedUser.nickname}
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-6">
            Enter their 4-digit connection PIN
          </p>

          {/* PIN Input */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-mono
                  ${connectionPin.length > i ? 'border-rose/60 bg-rose/10' : 'border-border/30 bg-card/30'}
                  ${error ? 'animate-[shake_0.3s_ease-in-out] !border-destructive' : ''}
                  transition-all`}
              >
                {connectionPin[i] ? '•' : ''}
              </div>
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) => (
              <button
                key={i}
                onClick={() => {
                  if (key === 'del') {
                    setConnectionPin(prev => prev.slice(0, -1));
                  } else if (key !== null && connectionPin.length < 4) {
                    setConnectionPin(prev => prev + key);
                  }
                }}
                className={`pin-key ${key === null ? 'opacity-0 pointer-events-none' : ''} 
                  ${key === 'del' ? 'text-muted-foreground text-base' : ''}`}
                disabled={key === null}
              >
                {key === 'del' ? '⌫' : key}
              </button>
            ))}
          </div>

          <button
            onClick={handleConnect}
            disabled={connectionPin.length !== 4}
            className="w-full py-3 bg-rose/80 hover:bg-rose text-white rounded-xl font-medium 
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-[0_0_20px_hsl(350_80%_60%/0.3)]"
          >
            Connect
          </button>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen romantic-gradient starry-bg flex flex-col p-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-lavender-deep/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-rose/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="glass-card p-4 mb-4 flex items-center justify-between relative z-10">
        <button
          onClick={onBack}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-lavender-deep" />
          <span className="font-display text-lg text-glow-lavender">The Hub</span>
        </div>

        <button
          onClick={onSettings}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Current user card */}
      <div className="glass-card p-4 mb-4 relative z-10 border border-lavender-deep/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lavender-deep/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-lavender-deep" />
          </div>
          <div>
            <p className="font-medium text-foreground">{currentUser.nickname}</p>
            <p className="text-xs text-muted-foreground">Your PIN: {maskPin(currentUser.login_pin)}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-500">Online</span>
          </div>
        </div>
      </div>

      {/* Section title */}
      <div className="flex items-center gap-2 mb-3 px-2 relative z-10">
        <div className="h-px flex-1 bg-border/30" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Active Agents</span>
        <div className="h-px flex-1 bg-border/30" />
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto space-y-2 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading agents...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-3">🕵️</div>
            <p className="text-muted-foreground">No other agents online</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Invite someone to join</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="glass-card p-4 flex items-center gap-3 hover:border-lavender-deep/30 
                         transition-all cursor-pointer group"
              onClick={() => setSelectedUser(user)}
            >
              <div className="w-10 h-10 rounded-full bg-card/50 border border-border/30 
                              flex items-center justify-center text-lg">
                {user.nickname.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-foreground group-hover:text-glow-lavender transition-all">
                  {user.nickname}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  PIN: {maskPin(user.login_pin)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {user.is_online ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-500">Online</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground/50">Offline</span>
                )}
                
                <button
                  className="px-3 py-1.5 bg-rose/20 hover:bg-rose/30 text-rose text-sm 
                             rounded-lg transition-all border border-rose/20 
                             group-hover:shadow-[0_0_15px_hsl(350_80%_60%/0.2)]"
                >
                  Connect
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserHub;
