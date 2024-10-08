import { useCallback, useEffect, useState } from 'react';
import './App.css';
import './font-styles.css';
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
  const [audioPlayTime, setAudioPlayTime] = useState<number>(Date.now());
  const [audioSrc, setAudioSrc] = useState('benny-hill-1.mp3');
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
    setState(WheelStates.Rest);
  }, []);

  useEffect(
    function pickRandomTuneOnPlay() {
      if (audioState === AudioStates.WheelAudio) {
        const randTrack = Math.ceil(Math.random() * 4);
        setAudioSrc(`benny-hill-${randTrack}.mp3`);
        console.log('Setting ', `benny-hill-${randTrack}.mp3`)
      }
    },
    [audioState === AudioStates.WheelAudio, audioPlayTime]
  )

  const onSpinStart = useCallback(() => {
    // TODO: mute music if playing
  }, []);

  useKeyAction(
    'p',
    useCallback(
      function playMusic_() {
        if (spotifyTab) {
          setAudioState(AudioStates.Silent);
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
      setAudioState(AudioStates.Silent);
    }, [])
  );

  useKeyAction(
    '2',
    useCallback(function goToOnStage() {
      setScreen(Screens.OnStage);
      setAudioState(AudioStates.Silent);
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
      setAudioState(AudioStates.Silent);
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
      setAudioPlayTime(Date.now());
      setAudioState(AudioStates.WheelAudio);
      setState(WheelStates.Spinning);
    }, [])
  );

  useKeyAction(
    'x',
    useCallback(function discardSelectedItem() {
      console.log('discarding ', currentItem);
      setItems((items) => items?.filter((item) => item !== currentItem));
    }, [currentItem])
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
      <AudioPlayer playing={audioSrc === 'benny-hill-1.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'benny-hill-1.mp3'}/>
      <AudioPlayer playing={audioSrc === 'benny-hill-2.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'benny-hill-2.mp3'}/>
      <AudioPlayer playing={audioSrc === 'benny-hill-3.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'benny-hill-3.mp3'}/>
      <AudioPlayer playing={audioSrc === 'benny-hill-4.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'benny-hill-4.mp3'}/>
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
      { screen === Screens.Settings && (
        <div className={getScreenClasses(screen === Screens.Settings)} style={{ fontFamily: "hoss round"}}>
          <h1>Settings</h1>
          <button onClick={openSpotifyTab}>Open Spotify controlled tab</button>
          <p>Status: {spotifyTab ? 'Connected!' : 'Pending...'}</p>
        </div>
      )}
    </>
  );
}

const getScreenClasses = (showing: boolean) =>
  `screen _activeState-${showing ? 'showing' : 'hidden'}`;

export default App;
