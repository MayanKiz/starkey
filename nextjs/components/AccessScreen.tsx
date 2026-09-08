'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { PinPad } from './PinPad';
import { supabase, User } from '@/lib/supabase';
import { hashPin } from '@/lib/security';

export function AccessScreen({ onCreate, onAccess }: { onCreate: () => void; onAccess: (user: User) => void }) {
  const [pin, setPin] = useState(''); const [error, setError] = useState('');
  useEffect(() => { if (pin.length !== 6 || !supabase) return; let active = true; (async () => { const { data } = await supabase.from('users').select('*').eq('login_pin', await hashPin(pin)).maybeSingle(); if (active && data) onAccess(data as User); else if (active) { setError('That Secret PIN was not recognised.'); setTimeout(() => { setPin(''); setError(''); }, 900); } })(); return () => { active = false; }; }, [pin, onAccess]);
  return <main className="access-screen"><div className="access-visual"><header><div className="brand"><span><Sparkles size={16}/></span> AKGEC <b>COMMUNITY</b></div><div className="online"><i/> private network</div></header><div className="hero"><span className="eyebrow">BUILT FOR AKGEC</span><h1>Your campus.<br/><em>Your circle.</em><br/>Your space.</h1><p>A quiet, members-only community for ideas, conversations and connections that stay intentional.</p><div className="trust"><span><ShieldCheck/> nickname-first</span><span><LockKeyhole/> PIN protected</span></div><button className="primary" onClick={onCreate}>Create your account <ArrowRight size={16}/></button></div><footer>AKGEC COMMUNITY / 2026 <span/> private by design</footer></div><div className="access-panel"><PinPad pin={pin} length={6} onChange={setPin}/>{error && <p className="error center">{error}</p>}<div className="or"><span/> or <span/></div><button className="secondary" onClick={onCreate}><UserPlus size={15}/> Create a new account</button></div></main>;
}