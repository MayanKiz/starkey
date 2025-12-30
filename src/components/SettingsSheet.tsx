import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, Image, Palette } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: 'he' | 'she';
  onNuke: () => void;
}

const GRADIENT_PRESETS = [
  { name: 'Romantic', value: 'linear-gradient(135deg, #E6E6FA, #FFFDD0, #FFD1DC)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #FFD1DC, #E6E6FA, #B0E0E6)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #B0E0E6, #E6E6FA, #DDA0DD)' },
  { name: 'Blush', value: 'linear-gradient(180deg, #FFD1DC, #E6E6FA)' },
];

const SettingsSheet = ({ open, onOpenChange, currentUser, onNuke }: SettingsSheetProps) => {
  const [confirmNuke, setConfirmNuke] = useState(false);

  const handleWallpaperUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For demo, we'll just use a data URL
    const reader = new FileReader();
    reader.onload = async (event) => {
      const url = event.target?.result as string;
      await supabase
        .from('chat_settings')
        .update({ wallpaper_url: url })
        .eq('id', currentUser);
    };
    reader.readAsDataURL(file);
  };

  const handleGradientSelect = async (gradient: string) => {
    await supabase
      .from('chat_settings')
      .update({ wallpaper_url: gradient })
      .eq('id', currentUser);
  };

  const handleNuke = () => {
    if (confirmNuke) {
      onNuke();
      setConfirmNuke(false);
      onOpenChange(false);
    } else {
      setConfirmNuke(true);
      setTimeout(() => setConfirmNuke(false), 3000);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass border-l border-glass-border">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Wallpaper Section */}
          <div>
            <h3 className="text-sm font-medium text-foreground/80 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Chat Wallpaper
            </h3>
            
            <label className="block">
              <div className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-lavender-deep/30 
                           hover:border-lavender-deep/50 transition-colors cursor-pointer text-center">
                <span className="text-sm text-muted-foreground">Upload photo</span>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleWallpaperUpload}
                className="hidden" 
              />
            </label>
          </div>

          {/* Gradient Presets */}
          <div>
            <h3 className="text-sm font-medium text-foreground/80 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Gradient Presets
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleGradientSelect(preset.value)}
                  className="h-16 rounded-xl border border-glass-border overflow-hidden hover:scale-105 transition-transform"
                  style={{ background: preset.value }}
                >
                  <span className="text-xs font-medium text-foreground/70 drop-shadow-sm">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-destructive mb-3 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Danger Zone
            </h3>
            
            <Button
              variant={confirmNuke ? 'destructive' : 'outline'}
              className={`w-full ${confirmNuke ? '' : 'border-destructive/30 text-destructive hover:bg-destructive/10'}`}
              onClick={handleNuke}
            >
              {confirmNuke ? 'Tap again to confirm' : 'Clear All Messages'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This will delete messages for both users permanently
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
