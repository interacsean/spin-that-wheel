import { useEffect, useState } from 'react';

const SAMPLE_ITEMS = [
  'If titanic had wifi...',
  'Bad things for a psychiatrist to say...',
  'The worst things to think about while meditating...',
  'Ridiculous taglines for a matchmaking service',
  'The title of your autobiography would be',
  'Which topic could I write a \'how-to\' guide on'
];

export function useRemoteItems() {
  const [items, setItems] = useState<string[] | undefined>(undefined);

  useEffect(function loadItems() {
    setTimeout(() => {
      setItems([...SAMPLE_ITEMS]);
    }, 500);
  }, []);

  return items;
}
