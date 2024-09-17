import { useEffect, useState } from 'react';

const SAMPLE_ITEMS = [
  "My least favourite chore is...",
  "Rejected slogans for a gym",
  "The tagline under my photo in the high school yearbook would be...",
  "Things not to say when meeting your partner's parents...",
  "Inappropriate times to break into song",
  "Rejected taglines for a toilet paper brand",
  "Rejected titles for the movie \"Titanic\"",
  "Celebrities that shouldn't have been famous",
  "My most embarrassing comedy gig...",
  "Strange rumours about the Melbourne Comedy Scene",
  "Unlikely headlines for tomorrow's newspaper",
  "Unusual profile pictures for a dating app",
  "The last time I really pissed someone off...",
  "Wrong things to say to a heartbroken friend",
  "Audience choice (•‿•)",
  "Unlikely quotes from historical figures",
  "Rejected Slogans for the Olympic Games",
  "They should have cast me as ________ in __________",
  "The worst places to go on a first date",
  "Rejected slogans for a university",
  "If I taught a course at University, what would it be?",
  "Other than comedy, what would I go viral on TikTok for?",
  "USA actually stands for (make up a funny version)",
  "Bad things for a psychiatrist to say...",
  "Which topic could I write a \"how-to guide\" on?",
  "If Raygun did standup comedy...",
  "Self-help book titles that won't sell",
  "The sport I'd win at Olympics",
  "If I end up in jail, it'll be because of...",
  "Unorthodox methods for selecting comedians to perform at the comedy GALA",
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
