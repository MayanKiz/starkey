import { useState } from 'react';
import { Shield, ArrowLeft, Fingerprint } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface CreateIdentityProps {
  onBack: () => void;
  onSuccess: () => void;
}

const CreateIdentity = ({ onBack, onSuccess }: CreateIdentityProps) => {
  const [nickname, setNickname] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [connectionPin, setConnectionPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim() || loginPin.length !== 6 || connectionPin.length !== 4) {
      toast({
        title: "Invalid Input",
        description: "Please fill all fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('users').insert({
      nickname: nickname.trim(),
      login_pin: loginPin,
      connection_pin: connectionPin,
    });

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "PIN Already Exists",
          description: "This login PIN is already taken. Choose another.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Try again.",
          variant: "destructive",
        });
      }
      return;
    }

    toast({
      title: "Identity Created",
      description: "Your secret identity is ready. Log in to continue.",
    });
    
    onSuccess();
  };

  return (
    <div className="min-h-screen romantic-gradient starry-bg flex flex-col items-center justify-center p-6">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-lavender-deep/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-rose/5 rounded-full blur-3xl" />
      </div>

      <div className="glass-card p-8 max-w-sm w-full animate-fade-in relative z-10">
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Shield className="w-14 h-14 text-lavender-deep relative z-10" />
            <div className="absolute inset-0 blur-xl bg-lavender-deep/40 rounded-full scale-150" />
          </div>
        </div>

        <h1 className="font-display text-2xl text-center text-glow-lavender mb-2">
          Create Secret Identity
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-6">
          Choose your alias and secure PINs
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nickname */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your secret alias..."
              maxLength={20}
              className="w-full px-4 py-3 bg-card/50 border border-border/30 rounded-xl 
                         text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:ring-2 focus:ring-lavender-deep/50 
                         focus:border-lavender-deep/50 transition-all"
            />
          </div>

          {/* Login PIN */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">6-Digit Login PIN</label>
            <div className="relative">
              <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
              <input
                type="tel"
                inputMode="numeric"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                className="w-full pl-11 pr-4 py-3 bg-card/50 border border-border/30 rounded-xl 
                           text-foreground placeholder:text-muted-foreground/50 tracking-[0.5em]
                           focus:outline-none focus:ring-2 focus:ring-lavender-deep/50 
                           focus:border-lavender-deep/50 transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground/60">This is your login password</p>
          </div>

          {/* Connection PIN */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">4-Digit Connection PIN</label>
            <input
              type="tel"
              inputMode="numeric"
              value={connectionPin}
              onChange={(e) => setConnectionPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              className="w-full px-4 py-3 bg-card/50 border border-border/30 rounded-xl 
                         text-foreground placeholder:text-muted-foreground/50 tracking-[0.5em]
                         focus:outline-none focus:ring-2 focus:ring-lavender-deep/50 
                         focus:border-lavender-deep/50 transition-all"
            />
            <p className="text-xs text-muted-foreground/60">Others need this to chat with you</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || nickname.trim().length === 0 || loginPin.length !== 6 || connectionPin.length !== 4}
            className="w-full py-3 bg-lavender-deep/80 hover:bg-lavender-deep text-white 
                       rounded-xl font-medium transition-all disabled:opacity-50 
                       disabled:cursor-not-allowed shadow-[0_0_20px_hsl(270_50%_50%/0.3)]
                       hover:shadow-[0_0_30px_hsl(270_50%_50%/0.5)]"
          >
            {loading ? 'Creating...' : 'Create Identity'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateIdentity;
