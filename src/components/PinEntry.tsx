import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Delete, KeyRound, LockKeyhole, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { supabase, User } from '@/lib/supabase';
import { hashPin } from '@/lib/security';

interface PinEntryProps { onAccess: (user: User) => void; onCreateIdentity: () => void; }

const PinEntry = ({ onAccess, onCreateIdentity }: PinEntryProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    if (pin.length !== 6) return;
    const access = async () => {
      const { data } = await supabase.from('users').select('*').eq('login_pin', await hashPin(pin)).maybeSingle();
      if (data) { onAccess(data as User); return; }
      setError('That Secret PIN was not recognised.');
      window.setTimeout(() => { setPin(''); setError(''); }, 900);
    };
    void access();
  }, [pin, onAccess]);

  const press = (key: string | number) => {
    if (key === 'del') setPin((current) => current.slice(0, -1));
    else if (pin.length < 6) setPin((current) => current + key);
  };

  return <section className="akgec-landing page-scroll">
    <div className="akgec-noise" />
    <div className="akgec-orb akgec-orb-one" /><div className="akgec-orb akgec-orb-two" />
    <header className="akgec-header"><div className="akgec-logo"><span className="akgec-logo-mark"><Sparkles /></span><span>AKGEC <b>COMMUNITY</b></span></div><span className="akgec-header-status"><span /> private network</span></header>
    <div className="akgec-layout">
      <div className="akgec-hero"><div className="akgec-kicker"><span className="kicker-line" /> BUILT FOR AKGEC <span className="kicker-line" /></div><h1>Your campus.<br /><em>Your circle.</em><br />Your space.</h1><p className="akgec-copy">A quiet, members-only community for ideas, conversations and connections that stay intentional.</p><div className="akgec-trust-row"><span><ShieldCheck /> nickname-first</span><span><LockKeyhole /> PIN protected</span></div><button className="akgec-primary" onClick={onCreateIdentity}>Create your account <ArrowRight /></button></div>
      <div className="akgec-access-card"><div className="access-card-top"><div className="access-icon"><KeyRound /></div><div><span className="akgec-label">MEMBER ACCESS</span><h2>Welcome back.</h2></div></div><p className="access-copy">Enter your 6-digit Secret PIN to enter the community.</p><button className="hidden-pin-input" ref={inputRef} onKeyDown={(event) => { if (/^[0-9]$/.test(event.key)) press(event.key); if (event.key === 'Backspace') press('del'); }} aria-label="Secret PIN input" /><div className="access-dots">{[0, 1, 2, 3, 4, 5].map((index) => <span key={index} className={pin.length > index ? 'filled' : ''} />)}</div><div className="access-keypad">{[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, index) => key === null ? <span key={index} /> : <button key={index} onClick={() => press(key)} aria-label={key === 'del' ? 'Delete' : `Number ${key}`}>{key === 'del' ? <Delete /> : key}</button>)}</div>{error && <p className="access-error">{error}</p>}<div className="access-divider"><span /> or <span /></div><button className="access-create" onClick={onCreateIdentity}><UserPlus /> Create a new account</button></div>
    </div>
    <footer className="akgec-footer"><span>AKGEC COMMUNITY / 2026</span><span className="footer-rule" /><span>private by design</span></footer>
  </section>;
};
export default PinEntry;
