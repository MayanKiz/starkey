'use client';

import { FormEvent, useState } from 'react';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { hashPin } from '@/lib/security';

export function AccountCreation({ onBack, onCreated }: { onBack: () => void; onCreated: () => void }) {
  const [nickname, setNickname] = useState('');
  const [secret, setSecret] = useState('');
  const [chat, setChat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (!supabase) return setError('Supabase configuration is missing.');
    if (!/^[a-zA-Z0-9_-]{2,20}$/.test(nickname) || secret.length !== 6 || chat.length !== 4) return;
    setLoading(true);
    const [login_pin, connection_pin] = await Promise.all([hashPin(secret), hashPin(chat)]);
    const { error: dbError } = await supabase.from('users').insert({ nickname, login_pin, connection_pin });
    setLoading(false);
    if (dbError) return setError(dbError.code === '23505' ? 'That PIN is already in use. Choose different PINs.' : 'Could not create identity. Check your connection.');
    onCreated();
  };
  return <div className="form-screen"><button className="back" onClick={onBack}><ArrowLeft size={18}/> Back</button><div className="form-card"><div className="big-icon"><ShieldCheck/></div><span className="label">NO NAME. NO TRACE.</span><h1>Create an identity</h1><p className="muted">Use an alias only. Real names, emails, and public profiles are never requested.</p><form onSubmit={submit}>
    <label>Nickname only<input value={nickname} onChange={e => setNickname(e.target.value.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,20))} placeholder="e.g. nightwatch" autoComplete="off"/><small>2–20 characters · letters, numbers, _ or -</small></label>
    <label>Secret PIN<input value={secret} onChange={e => setSecret(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" placeholder="••••••" autoComplete="off"/><small>Your encrypted access key. Never share it.</small></label>
    <label>Chat PIN<input value={chat} onChange={e => setChat(e.target.value.replace(/\D/g,'').slice(0,4))} inputMode="numeric" placeholder="••••" autoComplete="off"/><small>Share only with people you want to find you.</small></label>
    {error && <p className="error">{error}</p>}<button className="primary wide" disabled={loading}>{loading ? 'Creating secure identity…' : <><KeyRound size={16}/> Create identity</>}</button>
  </form></div></div>;
}