import { useState, useEffect } from 'react';

export interface ScrollNavigationState {
  scrollY: number;
  scrollDirection: 'up' | 'down';
  isScrolled: boolean;
  isScrolling: boolean;
  isCompact: boolean;
}

export function useScrollNavigation(threshold: number = 20): ScrollNavigationState {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollStopTimer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > threshold);

      const delta = currentScrollY - lastScrollY;
      if (Math.abs(delta) > 3) {
        if (delta > 0) {
          setScrollDirection('down');
        } else {
          setScrollDirection('up');
        }
        lastScrollY = currentScrollY;
      }

      setIsScrolling(true);
      if (scrollStopTimer) clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollStopTimer) clearTimeout(scrollStopTimer);
    };
  }, [threshold]);

  return {
    scrollY,
    scrollDirection,
    isScrolled,
    isScrolling,
    isCompact: isScrolled
  };
}
