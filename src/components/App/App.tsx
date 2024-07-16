import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { Wheel } from '../Wheel/Wheel';
import { useRemoteItems } from '../App/useRemoteItems';
import { useKeyAction } from '../useKeyAction';
import { useOpenTab, playMusic } from '../../services/music/SpotifyTab';
import AudioPlayer from '../../services/local-media/AudioPlayer';

enum WheelStates {
  Spinning,
  Rest,
}

enum Screens {
  Ambient,
  OnStage,
  Social,
  Wheel,
  Settings,
}

enum AudioStates {
  WheelAudio,
  Silent,
}

function App() {
  const initialItems = useRemoteItems();
  const [items, setItems] = useState<string[] | undefined>();
  const [currentItem, setCurrentItem] = useState<string | undefined>();
  const [state, setState] = useState<WheelStates>(WheelStates.Rest);
  const [screen, setScreen] = useState<Screens>(Screens.Ambient);
  const [audioState, setAudioState] = useState<AudioStates>(AudioStates.Silent);
  const { openTab, spotifyTab } = useOpenTab();

  useEffect(
    function setItemsFromInitial() {
      if (initialItems?.length && !items?.length) {
        setItems(initialItems);
      }
    },
    [initialItems]
  );
  const onSpinComplete = useCallback((selectedItem: string) => {
    setCurrentItem(selectedItem);
    console.log({ selectedItem });
    setState(WheelStates.Rest);
    setItems((items) => (items || []).filter((item) => item !== selectedItem));
  }, []);

  const onSpinStart = useCallback(() => {
    // TODO: mute music if playing
  }, []);

  useKeyAction(
    'p',
    useCallback(
      function playMusic_() {
        if (spotifyTab) {
          playMusic(spotifyTab);
        }
      },
      [spotifyTab]
    )
  );
  useKeyAction(
    'b',
    useCallback(
      function playSpinWheelAudio() {
        setAudioState((s) => s === AudioStates.WheelAudio 
          ? AudioStates.Silent 
          : AudioStates.WheelAudio)
      },
      [spotifyTab]
    )
  );

  useKeyAction(
    '1',
    useCallback(function goToAmbient() {
      setScreen(Screens.Ambient);
    }, [])
  );

  useKeyAction(
    '2',
    useCallback(function goToOnStage() {
      setScreen(Screens.OnStage);
    }, [])
  );

  useKeyAction(
    'w',
    useCallback(function goToOnStage() {
      setScreen(Screens.Wheel);
    }, [])
  );
  useKeyAction(
    '3',
    useCallback(function goToOnStage() {
      setScreen(Screens.Wheel);
    }, [])
  );

  useKeyAction(
    '4',
    useCallback(function goToOnStage() {
      setScreen(Screens.Social);
    }, [])
  );

  useKeyAction(
    '\\',
    useCallback(function goToSettings() {
      setScreen(Screens.Settings);
    }, [])
  );

  useKeyAction(
    's',
    useCallback(function onSpin() {
      setState(WheelStates.Spinning);
      setAudioState(AudioStates.WheelAudio);
    }, [])
  );

  useKeyAction(
    '-',
    useCallback(
      function reset() {
        setItems(initialItems);
        setState(WheelStates.Rest);
      },
      [initialItems]
    )
  );

  const openSpotifyTab = useCallback(
    () => openTab('playlist/58PdBqWcgGV2g11HlEygZU'),
    []
  );

  return (
    <>
      <AudioPlayer playing={audioState === AudioStates.WheelAudio} />
      <div className={getScreenClasses(screen === Screens.Ambient)}>
        <img src="/cr-light.png" style={{ width: '100vw', height: '100vh', objectFit: 'cover' }} />
      </div>
      <div className={getScreenClasses(screen === Screens.OnStage)}>
        <img src="/cr-dark.png" style={{ width: '100vw', height: '100vh', objectFit: 'cover' }} />
      </div>
      <div className={getScreenClasses(screen === Screens.Social)}>
        <img src="/cr-social.png" style={{ width: '100vw', height: '100vh', objectFit: 'cover' }} />
      </div>
      <div className={getScreenClasses(screen === Screens.Wheel)}>
        {items?.length && (
          <Wheel
            items={items}
            spinning={state === WheelStates.Spinning}
            onSpinStart={onSpinStart}
            onSpinComplete={onSpinComplete}
          />
        )}
      </div>
      <div className={getScreenClasses(screen === Screens.Settings)}>
        <h1>Settings</h1>
        <button onClick={openSpotifyTab}>Open Spotify controlled tab</button>
        <p>Status: {spotifyTab ? 'Connected!' : 'Pending...'}</p>
      </div>
    </>
  );
}

const getScreenClasses = (showing: boolean) =>
  `screen _activeState-${showing ? 'showing' : 'hidden'}`;

export default App;
