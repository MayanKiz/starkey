import { useState } from 'react';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface CreateIdentityProps { onBack: () => void; onSuccess: () => void; }
const onlyDigits = (value: string, max: number) => value.replace(/\D/g, '').slice(0, max);

const CreateIdentity = ({ onBack, onSuccess }: CreateIdentityProps) => {
  const [nickname, setNickname] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [connectionPin, setConnectionPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nickname.trim() || loginPin.length !== 6 || connectionPin.length !== 4) return;
    setLoading(true);
    const { error } = await supabase.from('users').insert({ nickname: nickname.trim(), login_pin: loginPin, connection_pin: connectionPin });
    setLoading(false);
    if (error) {
      toast({ title: error.code === '23505' ? 'That code is taken' : 'Could not create space', description: error.code === '23505' ? 'Try another 4-digit login code.' : 'Please check your connection and try again.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Your space is ready!', description: 'Use your 4-digit code to come back anytime.' });
    onSuccess();
  };

  return (
    <section className="app-shell page-scroll px-5 py-7">
      <div className="mx-auto flex min-h-full w-full max-w-md items-center justify-center">
        <div className="cute-card relative w-full p-6 sm:p-8">
          <button onClick={onBack} className="mb-6 rounded-full p-2 text-muted-foreground hover:bg-pink-soft" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-soft"><Heart className="h-7 w-7 fill-[hsl(var(--pink))] text-[hsl(var(--pink))]" /></div>
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-pink"><Sparkles className="h-4 w-4" /> make it yours</p>
          <h1 className="font-display text-3xl font-semibold">Create your space</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">No email, no complicated password. Just a cute name and two tiny codes.</p>
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block text-sm font-semibold">Your name<input className="soft-input mt-2" value={nickname} onChange={(e) => setNickname(e.target.value.slice(0, 20))} placeholder="e.g. sunshine" maxLength={20} /></label>
            <label className="block text-sm font-semibold">Your 6-digit login code<input className="soft-input mt-2 tracking-[.45em]" value={loginPin} onChange={(e) => setLoginPin(onlyDigits(e.target.value, 6))} inputMode="numeric" placeholder="••••••" /></label>
            <p className="-mt-3 text-xs text-muted-foreground">This keeps your existing login working.</p>
            <label className="block text-sm font-semibold">Your 4-digit connect code<input className="soft-input mt-2 tracking-[.45em]" value={connectionPin} onChange={(e) => setConnectionPin(onlyDigits(e.target.value, 4))} inputMode="numeric" placeholder="••••" /></label>
            <p className="-mt-3 text-xs text-muted-foreground">Share this only with someone you want to chat with.</p>
            <button className="cute-button w-full rounded-2xl bg-[hsl(var(--pink))] py-3.5 font-semibold text-white disabled:opacity-40" disabled={loading || !nickname.trim() || loginPin.length !== 6 || connectionPin.length !== 4}>{loading ? 'Making your space…' : 'Create my space'}</button>
          </form>
        </div>
      </div>
    </section>
  );
};
export default CreateIdentity;
