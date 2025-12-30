import { Heart, Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/supabase';

interface ChatHeaderProps {
  currentUser: User;
  chatPartner: User;
  otherTyping: boolean;
  isOtherOnline?: boolean;
  onSettings: () => void;
  onBack: () => void;
}

const ChatHeader = ({ currentUser, chatPartner, otherTyping, isOtherOnline, onSettings, onBack }: ChatHeaderProps) => {
  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <header className="glass sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-glass-border">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-lavender/50"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender-deep to-blush flex items-center justify-center text-lg font-medium">
              {getInitial(chatPartner.nickname)}
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${isOtherOnline ? 'bg-emerald-400' : 'bg-muted-foreground/40'}`} />
          </div>
          
          <div>
            <h2 className="font-display text-lg leading-tight text-glow-rose">{chatPartner.nickname}</h2>
            {otherTyping ? (
              <div className="flex items-center gap-1 text-xs text-rose">
                <span>typing</span>
                <span className="flex gap-0.5">
                  <span className="typing-dot w-1 h-1 rounded-full bg-rose" />
                  <span className="typing-dot w-1 h-1 rounded-full bg-rose" />
                  <span className="typing-dot w-1 h-1 rounded-full bg-rose" />
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{isOtherOnline ? 'Online' : 'Offline'}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Connection indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lavender/50 border border-lavender-deep/20">
          <Heart className="w-3.5 h-3.5 text-rose fill-rose" />
          <span className="text-xs font-medium text-foreground/70">
            Connected
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-lavender/50"
          onClick={onSettings}
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;
