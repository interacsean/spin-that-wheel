// import { useEffect, useState } from 'react';


/**
 * From:
 * https://wordwall.net/create/editcontent?guid=4a333f85ffc34f249c20e2342c9dc041&templateId=0
 * 
 * Run in console:
 * Array.from(document.querySelectorAll('.item-input.js-item-input span')).map(
    e => e.innerText).join("\n")
 */
const SAMPLE_ITEMS = [
  "Things you don't want to hear from your Airbnb host",
  "My worst gig was...",
  "Hilarious taglines for a dating app",
  "Things not to say when meeting your partner's parents",
  "Wrong things to say to a heartbroken friend",
  "Reasons to NOT date a comedian",
  "Rejected titles for the movie \"Titanic\"",
  "Sex",
  "Inappropriate times to use baby talk",
  "Ridiculous names for Melbourne's hipster drinking spots",
  "Inappropriate times to Yell 'Aussie, Aussie, Aussie'",
  "Things you wish you could say to the Melbourne Comedy Festival Director",
  "Things Overheard at Bondi Beach",
  "Self-help book titles that won't work",
  "Audience choice (•‿•)",
  "Describe your dating life using movie/sitcom titles",
  "Unlikely songs to hear as elevator music",
  "Which is the best suburb in Melbourne and why?",
  "If they made a movie on my life, what would be the title?",
  "Things you’ve Googled at 3 AM",
  "Things overheard in a nightclub bathroom",
  "Other than comedy, what would I go viral on TikTok for?",
  "KFC actually stands for (make up a funny version)",
  "Things not to say on your first date",
  "Unlikely quotes from historical figures",
  "Rejected slogans for gyms",
  "Things comedians secretly think while on stage",
  "If you met Donald Trump, what would you say to him?",
  "Unlikely tips for aspiring comedians",
  "Celebrities that shouldn't have been famous"
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
