import { useCallback, useEffect } from 'react';

export function useKeyAction(keyboardShortcut: string, onAction: () => void) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // console.log(`The "${event.key}" key was pressed`);
      if (event.key === keyboardShortcut) {
        console.log(`The "${keyboardShortcut}" key was pressed`);
        onAction?.();
        // Add your desired functionality here
      }
    },
    [keyboardShortcut, onAction]
  );

  useEffect(() => {
    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyPress);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}
