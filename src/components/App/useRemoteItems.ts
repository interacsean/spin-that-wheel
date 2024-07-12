import { useEffect, useState } from 'react';

const SAMPLE_ITEMS = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

export function useRemoteItems() {
  const [items, setItems] = useState<string[] | undefined>(undefined);

  useEffect(function loadItems() {
    setTimeout(() => {
      setItems([...SAMPLE_ITEMS]);
    }, 500);
  }, []);

  return items;
}
