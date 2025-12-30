import { useEffect, useRef } from 'react';

export const usePanicTap = (tapCount = 4, timeWindow = 1000) => {
  const tapsRef = useRef<number[]>([]);

  useEffect(() => {
    const handleTap = () => {
      const now = Date.now();
      tapsRef.current.push(now);
      
      // Keep only taps within the time window
      tapsRef.current = tapsRef.current.filter(tap => now - tap < timeWindow);
      
      if (tapsRef.current.length >= tapCount) {
        // Panic! Redirect to Google
        window.location.href = 'https://google.com';
      }
    };

    document.addEventListener('touchstart', handleTap);
    document.addEventListener('click', handleTap);

    return () => {
      document.removeEventListener('touchstart', handleTap);
      document.removeEventListener('click', handleTap);
    };
  }, [tapCount, timeWindow]);
};
