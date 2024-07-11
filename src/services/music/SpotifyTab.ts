import { useCallback, useState } from 'react';

export function playMusic(spotifyTab: Window) {
  spotifyTab.postMessage('wheel_toggleMusic', 'https://open.spotify.com');
}

export function useOpenTab() {
  const [spotifyTab, setSpotifyTab] = useState<Window | null>(null);

  const openTab = useCallback(async (path: string) => {
    const newWindow = window.open(`https://open.spotify.com/${path}`);

    const intervalId = setInterval(() => {
      console.log({ newWindow });
      if (newWindow) {
        setSpotifyTab(newWindow);
        clearInterval(intervalId);
      }
    }, 250);
  }, []);

  return { openTab, spotifyTab };
}

// let newWindow: Window | null = null;
// async function openTabJs(url: string) {
//   newWindow = window.open(url);

//   return new Promise((res, _rej) => {

//   });
// }
