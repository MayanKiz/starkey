import { useState, useRef } from 'react';
import { Send, Mic, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLoveRain } from '@/hooks/useLoveRain';

interface ChatInputProps {
  onSend: (content: string, type: 'text' | 'voice' | 'heartbeat', voiceUrl?: string) => void;
  onTyping: (isTyping: boolean) => void;
}

const ChatInput = ({ onSend, onTyping }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { triggerLoveRain, checkForLoveKeywords } = useLoveRain();

  const handleSend = () => {
    if (!message.trim()) return;

    // Check for love keywords and trigger rain
    if (checkForLoveKeywords(message)) {
      triggerLoveRain();
    }

    onSend(message.trim(), 'text');
    setMessage('');
    onTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleHeartbeat = () => {
    onSend('💓', 'heartbeat');
    
    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }

    triggerLoveRain();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping(e.target.value.length > 0);
  };

  return (
    <div className="glass border-t border-glass-border px-4 py-3">
      <div className="flex items-center gap-2">
        {/* Heartbeat button */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-blush/30 transition-colors flex-shrink-0"
          onClick={handleHeartbeat}
        >
          <Heart className="w-5 h-5 text-rose fill-rose animate-pulse-heart" />
        </Button>

        {/* Input field */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full px-4 py-2.5 rounded-full bg-muted/50 border border-border 
                     text-foreground placeholder:text-muted-foreground/50
                     focus:outline-none focus:ring-2 focus:ring-lavender-deep/30 focus:border-lavender-deep/30
                     transition-all duration-200 font-body text-sm backdrop-blur-lg"
          />
        </div>

        {/* Voice/Send button */}
        {message.trim() ? (
          <Button
            size="icon"
            className="rounded-full bg-gradient-to-r from-lavender-deep to-blush-deep hover:opacity-90 transition-opacity flex-shrink-0"
            onClick={handleSend}
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full transition-colors flex-shrink-0 ${
              isRecording ? 'bg-rose text-white' : 'hover:bg-lavender/50'
            }`}
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => {
              setIsRecording(false);
              // TODO: Handle voice recording
            }}
            onTouchStart={() => setIsRecording(true)}
            onTouchEnd={() => {
              setIsRecording(false);
            }}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-muted-foreground'}`} />
          </Button>
        )}
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center justify-center gap-2 mt-2 text-rose animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-rose animate-pulse" />
          <span className="text-xs font-medium">Recording...</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
