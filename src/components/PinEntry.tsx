import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { usePanicTap } from '@/hooks/usePanicTap';

interface PinEntryProps {
  onAccess: (user: 'he' | 'she' | 'vault') => void;
}

const PinEntry = ({ onAccess }: PinEntryProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
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

  const validatePin = () => {
    switch (pin) {
      case '050108':
        onAccess('he');
        break;
      case '100409':
        onAccess('she');
        break;
      case '051009':
        onAccess('vault');
        break;
      default:
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9' && pin.length < 6) {
      setPin(prev => prev + e.key);
    } else if (e.key === 'Backspace') {
      setPin(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="min-h-screen romantic-gradient flex flex-col items-center justify-center p-6">
      <div className="glass-card p-10 max-w-sm w-full animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Heart 
              className="w-16 h-16 text-rose fill-rose animate-pulse-heart" 
            />
            <div className="absolute inset-0 blur-xl bg-rose/30 rounded-full" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl text-center text-foreground/90 mb-2">
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
              className={`pin-dot ${pin.length > i ? 'pin-dot-filled' : ''} ${error ? 'animate-[shake_0.3s_ease-in-out] bg-destructive/50' : ''}`}
              style={{
                animationDelay: error ? `${i * 0.05}s` : '0s'
              }}
            />
          ))}
        </div>

        {/* Hidden Input - readOnly to prevent keyboard */}
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

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) => (
            <button
              key={i}
              onClick={() => {
                if (key === 'del') {
                  setPin(prev => prev.slice(0, -1));
                } else if (key !== null && pin.length < 6) {
                  setPin(prev => prev + key);
                }
              }}
              className={`h-14 rounded-xl font-body text-xl transition-all duration-200
                ${key === null ? 'pointer-events-none' : 'glass hover:scale-105 active:scale-95'}
                ${key === 'del' ? 'text-muted-foreground text-sm' : 'text-foreground/80'}
              `}
              disabled={key === null}
            >
              {key === 'del' ? '⌫' : key}
            </button>
          ))}
        </div>
      </div>

      {/* Subtle footer */}
      <p className="mt-8 text-xs text-muted-foreground/50 font-body">
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
