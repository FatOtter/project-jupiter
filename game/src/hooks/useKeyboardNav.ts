import { useEffect, useCallback } from 'react';

type KeyAction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'ENTER' | 'ESCAPE' | 'TAB';

export function useKeyboardNav(handler: (action: KeyAction) => void, deps: any[] = []) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        handler('UP');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        handler('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        handler('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        handler('RIGHT');
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handler('ENTER');
        break;
      case 'Escape':
        e.preventDefault();
        handler('ESCAPE');
        break;
      case 'Tab':
        e.preventDefault();
        handler('TAB');
        break;
    }
  }, [handler]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, ...deps]);
}
