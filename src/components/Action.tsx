import { useCallback, useEffect } from 'react';

type CustomActionProps = {
  children?: string;
  keyboardShortcut?: string;
  onAction?: () => void;
};

type ActionProps = Partial<
  Omit<HTMLButtonElement, keyof CustomActionProps> & CustomActionProps
>;

export const Action = ({
  children,
  keyboardShortcut,
  onAction,
}: ActionProps) => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === keyboardShortcut) {
        console.log(`The "${keyboardShortcut}" key was pressed`);
        onAction?.();
        // Add your desired functionality here
      }
    },
    [keyboardShortcut]
  );

  useEffect(() => {
    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyPress);

    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  return children ? null : <button>{children}</button>;
};
