import { useState, useEffect, useRef } from 'react';
import { Heart, UserPlus } from 'lucide-react';
import { usePanicTap } from '@/hooks/usePanicTap';
import { supabase, User } from '@/lib/supabase';

interface PinEntryProps {
  onAccess: (user: User) => void;
  onVaultAccess: () => void;
  onCreateIdentity: () => void;
}

const PinEntry = ({ onAccess, onVaultAccess, onCreateIdentity }: PinEntryProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  usePanicTap();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (pin.length === 6) {
      validatePin();
    }
  }, [pin]);

  const validatePin = async () => {
    // Check for vault access (special hardcoded PIN)
    if (pin === '051009') {
      onVaultAccess();
      return;
    }

    // Check if PIN matches any user
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('login_pin', pin)
      .maybeSingle();

    if (fetchError || !data) {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 500);
      return;
    }

    onAccess(data as User);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9' && pin.length < 6) {
      setPin(prev => prev + e.key);
    } else if (e.key === 'Backspace') {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleKeyClick = (key: string | number | null) => {
    if (key === null) return;
    
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 150);

    if (key === 'del') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 6) {
      setPin(prev => prev + key);
    }
  };

  return (
    <div className="min-h-screen romantic-gradient starry-bg flex flex-col items-center justify-center p-6">
      {/* Ambient glow effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-lavender-deep/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-rose/5 rounded-full blur-3xl" />
      </div>

      <div className="glass-card p-10 max-w-sm w-full animate-fade-in relative z-10">
        {/* Logo with enhanced glow */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Heart 
              className="w-16 h-16 text-rose fill-rose animate-pulse-heart relative z-10" 
            />
            <div className="absolute inset-0 blur-2xl bg-rose/40 rounded-full scale-150" />
            <div className="absolute inset-0 blur-xl bg-lavender-deep/30 rounded-full scale-125" />
          </div>
        </div>

        {/* Title with glow effect */}
        <h1 className="font-display text-2xl text-center text-glow-lavender mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-8">
          Enter your secret PIN
        </p>

        {/* PIN Dots */}
        <div className="flex justify-center gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`pin-dot ${pin.length > i ? 'pin-dot-filled' : ''} ${error ? 'animate-[shake_0.3s_ease-in-out] !bg-destructive/50 !border-destructive' : ''}`}
              style={{
                animationDelay: error ? `${i * 0.05}s` : '0s'
              }}
            />
          ))}
        </div>

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="none"
          readOnly
          className="absolute opacity-0 pointer-events-none"
          value={pin}
          onKeyDown={handleKeyPress}
          autoComplete="off"
        />

        {/* Numeric Keypad with glow effects */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) => (
            <button
              key={i}
              onClick={() => handleKeyClick(key)}
              className={`pin-key ${key === null ? 'opacity-0 pointer-events-none' : ''} 
                ${key === 'del' ? 'text-muted-foreground text-base' : ''}
                ${pressedKey === key ? 'scale-95 !bg-lavender-deep/30 !border-lavender-deep/40 shadow-[0_0_25px_hsl(270_50%_50%/0.4),inset_0_0_15px_hsl(270_50%_50%/0.2)]' : ''}
              `}
              disabled={key === null}
            >
              {key === 'del' ? '⌫' : key}
            </button>
          ))}
        </div>

        {/* Create Identity button */}
        <button
          onClick={onCreateIdentity}
          className="w-full mt-6 py-3 flex items-center justify-center gap-2 
                     border border-lavender-deep/30 rounded-xl text-muted-foreground
                     hover:text-foreground hover:border-lavender-deep/50 hover:bg-lavender-deep/10
                     transition-all group"
        >
          <UserPlus className="w-4 h-4 group-hover:text-lavender-deep transition-colors" />
          <span className="text-sm">Create Secret Identity</span>
        </button>
      </div>

      {/* Subtle footer */}
      <p className="mt-8 text-xs text-muted-foreground/40 font-body relative z-10">
        💕 Just for us
      </p>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default PinEntry;
