import { useEffect, useRef, useState } from 'react';
import { Heart, UserPlus, Delete, Sparkles, ShieldCheck } from 'lucide-react';
import { supabase, User } from '@/lib/supabase';
import { hashPin } from '@/lib/security';

interface PinEntryProps { onAccess: (user: User) => void; onCreateIdentity: () => void; }

const PinEntry = ({ onAccess, onCreateIdentity }: PinEntryProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { if (pin.length === 6) void validatePin(pin); }, [pin]);

  const validatePin = async (value: string) => {
    const { data } = await supabase.from('users').select('*').eq('login_pin', await hashPin(value)).maybeSingle();
    if (!data) {
      setError(true);
      window.setTimeout(() => { setPin(''); setError(false); }, 500);
      return;
    }
    onAccess(data as User);
  };

  const press = (key: string | number) => {
    if (key === 'del') setPin((current) => current.slice(0, -1));
    else if (pin.length < 6) setPin((current) => current + key);
  };

  return (
    <section className="app-shell login-screen flex min-h-full items-center justify-center px-5 py-8">
      <div className="login-visual text-left">
        <div className="login-visual-grid" />
        <div className="login-orb login-orb-one" />
        <div className="login-orb login-orb-two" />
        <div className="login-visual-content">
          <div className="login-brand"><span className="login-brand-dot" /> SECRET CHAT</div>
          <p className="login-kicker">PRIVATE • REAL-TIME • JUST YOU TWO</p>
          <h2 className="login-visual-title">Your little<br /><span>world,</span> beautifully<br />connected.</h2>
          <p className="login-visual-copy">A soft private corner for messages, heartbeats and the people who matter.</p>
          <div className="login-feature-row"><span><Sparkles className="h-4 w-4" /> instant connection</span><span><ShieldCheck className="h-4 w-4" /> just for you</span></div>
        </div>
        <div className="login-visual-footer"><span>SECRET CHAT / 2026</span><span className="login-footer-line" /><span>MADE WITH CARE</span></div>
      </div>
      <div className="login-card-wrap w-full max-w-sm text-center">
        <div className="login-card-glow" />
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-pink-soft shadow-sm login-logo">
          <Heart className="h-10 w-10 fill-[hsl(var(--pink))] text-[hsl(var(--pink))]" />
        </div>
        <p className="mb-1 text-sm font-semibold tracking-wide text-pink">just us, softly</p>
        <h1 className="font-display text-4xl font-semibold text-foreground">Hello again!</h1>
        <p className="mx-auto mt-2 max-w-[260px] text-sm text-muted-foreground">Enter your 6-digit code to open your little world.</p>

        <button className="absolute h-0 w-0 overflow-hidden opacity-0" ref={inputRef} onKeyDown={(event) => { if (/^[0-9]$/.test(event.key)) press(event.key); if (event.key === 'Backspace') press('del'); }} aria-label="PIN input" />
        <div className="my-8 flex justify-center gap-4" aria-label="PIN progress">
          {[0, 1, 2, 3, 4, 5].map((index) => <span key={index} className={`pin-dot ${pin.length > index ? 'pin-dot-filled' : ''} ${error ? 'animate-[shake_.3s_ease-in-out]' : ''}`} />)}
        </div>
        <div className="mx-auto grid max-w-[280px] grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, index) => key === null ? <span key={index} /> : <button key={index} className="pin-key" onClick={() => press(key)} aria-label={key === 'del' ? 'Delete' : `Number ${key}`}>{key === 'del' ? <Delete className="mx-auto h-5 w-5" /> : key}</button>)}
        </div>
        <button onClick={onCreateIdentity} className="cute-button mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-foreground">
          <UserPlus className="h-4 w-4 text-pink" /> Create a new space
        </button>
      </div>
    </section>
  );
};

export default PinEntry;
