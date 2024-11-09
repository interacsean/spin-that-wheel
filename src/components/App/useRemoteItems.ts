import { useEffect, useState } from 'react';


/**
 * From:
 * https://wordwall.net/create/editcontent?guid=4a333f85ffc34f249c20e2342c9dc041&templateId=0
 * 
 * Run in console:
 * Array.from(document.querySelectorAll('.item-input.js-item-input span')).map(
    e => e.innerText)
 */
const SAMPLE_ITEMS = [
  "Things not to say during a political debate",
  "If I end up in jail, it'll be because of...",
  "Text message you'd never send your boss ",
  "Things not to say when meeting your partner's parents...",
  "What historical figures would say if they had social media",
  "If I re-painted the Mona Lisa, what would she look like?",
  "Rejected titles for the movie \"Titanic\"",
  "What politicians really mean when they say, 'No comment'",
  "My first open mic experience...",
  "The worst things to hear from an audience heckler",
  "Unlikely headlines for tomorrow's newspaper",
  "Things you wish you could say to bad drivers",
  "My least favourite chore is...",
  "Rejected titles for motivational books",
  "Audience choice (•‿•)",
  "Weirdest ways you've tried to impress someone...",
  "What comedians wish they could say to the audience but never do",
  "Unlikely ways to start a text conversation",
  "If they made a movie on my life, what would be the title?",
  "Things you’ve Googled at 3 AM",
  "If I taught a course at University, what would it be?",
  "Other than comedy, what would I go viral on TikTok for?",
  "NASA actually stands for (make up a funny version)",
  "Unlikely things to hear during a live podcast recording",
  "Least romantic things to say during a proposal",
  "Rejected slogans for gyms",
  "The weirdest things shared in you friends group chat",
  "If you met Raygun, what would you say to her?",
  "Shampoo names that won't sell",
  "Unorthodox methods for selecting comedians to perform at the comedy GALA"
];

// const SAMPLE_ITEMS: string[] = [
// ];

export function useRemoteItems() {
  // const [items, setItems] = useState<string[] | undefined>(undefined);

  // useEffect(function loadItems() {
  //   setTimeout(() => {
  //     setItems([...SAMPLE_ITEMS]);
  //   }, 500);
  // }, []);

  return SAMPLE_ITEMS;
}
