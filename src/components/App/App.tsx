import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import './font-styles.css';
import { Wheel } from '../Wheel/Wheel';
import { useKeyAction } from '../useKeyAction';
import AudioPlayer from '../../services/local-media/AudioPlayer';
import { useWakeLock } from '../../services/wake-lock/useWakeLock';
import { updateRemoteItems, useRemoteItems, useRemoteWheelCanvasRatioMax, updateRemoteWheelCanvasRatioMax } from './useRemoteItems';

const FADE_RATE_MULT = 0.05;
const FADE_RATE_ABS = 0.003;

const DISCARD_LAST_ITEM_BY_DEFAULT = true;

enum WheelStates {
  Spinning,
  Rest,
}

enum Screens {
  Ambient,
  OnStage,
  Like,
  Social,
  Break,
  End,
  Wheel,
  Settings,
}

enum AudioStates {
  WheelAudio,
  OneOff,
  Silent,
}

function App() {
  useWakeLock();
  const [initialItems, setInitialItems] = useState<string>();
  const [items, setItems] = useState<string[] | undefined>();
  const [currentItem, setCurrentItem] = useState<string | undefined>();
  const [state, setState] = useState<WheelStates>(WheelStates.Rest);
  const [screen, setScreen] = useState<Screens>(Screens.Settings);
  const [audioState, setAudioState] = useState<AudioStates>(AudioStates.Silent);
  const [audioPlayTime, setAudioPlayTime] = useState<number>(Date.now());
  const [audioSrc, setAudioSrc] = useState('benny-hill-1.mp3');
  const [resetZoomTimestampTrigger, setResetZoomTimestampTrigger] = useState<number>(Date.now());;
  const [fadeVol, setFadeVol] = useState(1);
  const fadingVolDestination = useRef<false | number>(false);
  const [hotKeysEnabled, setHotKeysEnabled] = useState(true);
  const enableHotkeys = useCallback(() => setHotKeysEnabled(true), []);
  const disableHotkeys = useCallback(() => setHotKeysEnabled(false), []);
  const [itemsInitialised, setItemsInitialised] = useState(false);
  const [ itemToDiscardOnNextSpin, discardItemOnNextSpin ] = useState<string | null>(null); 

  const remoteItems = useRemoteItems();
  const remoteWheelCanvasRatioMax = useRemoteWheelCanvasRatioMax();
  const [localWheelCanvasRatioMax, setLocalWheelCanvasRatioMax] = useState(remoteWheelCanvasRatioMax);

  useEffect(() => {
    if (remoteItems && !itemsInitialised) {
      setInitialItems(remoteItems);
      setItems(remoteItems?.split("\n").map((s) => s.trim()).filter((s) => !!s.length));
      setItemsInitialised(true);
    }
  }, [!!remoteItems, itemsInitialised])

  useEffect(() => {
    setLocalWheelCanvasRatioMax(remoteWheelCanvasRatioMax);
  }, [remoteWheelCanvasRatioMax]);

  const setRemoteItemsFromInitial = useCallback(() => {
    if (initialItems) {
      console.log('setting items', initialItems);
      updateRemoteItems(initialItems || '');
    }
  }, [initialItems, updateRemoteItems]);

  const onSpinComplete = useCallback((selectedItem: string) => {
    setCurrentItem(selectedItem);
    if (DISCARD_LAST_ITEM_BY_DEFAULT) {
      selectedItem && discardItemOnNextSpin(selectedItem);
    }
    setState(WheelStates.Rest);
  }, [discardItemOnNextSpin]);

  useEffect(
    function pickRandomTuneOnPlay() {
      if (audioState === AudioStates.WheelAudio) {
        const randTrack = Math.ceil(Math.random() * 5);
        setAudioSrc(`jaja-${randTrack}.mp3`);
        // setAudioSrc(`benny-hill-${randTrack}.mp3`);
      }
    },
    [audioState === AudioStates.WheelAudio, audioPlayTime]
  )

  console.log({ fadeVol });

  const onSpinStart = useCallback(() => {
    // TODO: mute music if playing
  }, []);

  useKeyAction(
    'b',
    useCallback(
      function playSpinWheelAudio() {
        if (!hotKeysEnabled) return;
        setAudioState((s) => s === AudioStates.WheelAudio 
          ? AudioStates.Silent 
          : AudioStates.WheelAudio)
      },
      [hotKeysEnabled]
    )
  );

  useKeyAction(
    'f',
    useCallback(
      function playSpinWheelAudio() {
        if (!hotKeysEnabled) return;
        fadingVolDestination.current = 0;
        let i: ReturnType<typeof setInterval> | undefined;
        if (audioState === AudioStates.WheelAudio || audioState === AudioStates.OneOff) {
          i = setInterval(() => {
            setFadeVol((v) => {
              if (fadingVolDestination.current === false) {
                i && clearInterval(i);
                return 0;
              }
              if ((v * (1 - FADE_RATE_MULT)) - FADE_RATE_ABS <= fadingVolDestination.current) {
                i && clearInterval(i);
                if (fadingVolDestination.current === 0)
                  setAudioState(AudioStates.Silent);
                const oFVD = fadingVolDestination.current;
                fadingVolDestination.current = false;
                return oFVD;
              }
              return (v * (1 - FADE_RATE_MULT)) - FADE_RATE_ABS;
            });
          }, 1000/24);
        }
      },
      [audioState, hotKeysEnabled],
    )
  );
  useKeyAction(
    'F',
    useCallback(
      function playSpinWheelAudio() {
        if (!hotKeysEnabled) return;
        fadingVolDestination.current = 0.2;
        let i: ReturnType<typeof setInterval> | undefined;
        if (audioState === AudioStates.WheelAudio) {
          i = setInterval(() => {
            setFadeVol((v) => {
              if (fadingVolDestination.current === false) {
                i && clearInterval(i);
                return v;
              }
              if ((v * (1 - FADE_RATE_MULT)) - FADE_RATE_ABS <= fadingVolDestination.current) {
                i && clearInterval(i);
                if (fadingVolDestination.current === 0)
                  setAudioState(AudioStates.Silent);
                const oFVD = fadingVolDestination.current;
                fadingVolDestination.current = false;
                return oFVD;
              }
              return (v * (1 - FADE_RATE_MULT)) - FADE_RATE_ABS;
            });
          }, 1000/24);
        }
      },
      [audioState, hotKeysEnabled],
    )
  );

  useKeyAction(
    'h',
    useCallback(function goToAmbient() {
      if (!hotKeysEnabled) return;
      if (audioSrc !== 'hey.mp3' || fadeVol < 1) {
        setFadeVol(1);
        setAudioSrc('hey.mp3');
        setAudioState(AudioStates.OneOff);
        return;
      }
      setAudioState(AudioStates.Silent);
      setAudioSrc('benny-hill-1.mp3');
    }, [audioSrc, fadeVol, hotKeysEnabled])
  );

  useKeyAction(
    'w',
    useCallback(function goToOnStage() {
      if (!hotKeysEnabled) return;
      setResetZoomTimestampTrigger(Date.now());
      setScreen(Screens.Wheel);
    }, [hotKeysEnabled])
  );

  useKeyAction(
    '1',
    useCallback(function goToAmbient() {
      if (!hotKeysEnabled) return;
      setScreen(Screens.Ambient);
      setAudioState(AudioStates.Silent);
    }, [hotKeysEnabled])
  );

  useKeyAction(
    '2',
    useCallback(function goToOnStage() {
      if (!hotKeysEnabled) return;
      setScreen(Screens.OnStage);
      setAudioState(AudioStates.Silent);
    }, [hotKeysEnabled])
  );

  useKeyAction(
    '3',
    useCallback(function goToOnStage() {
      if (!hotKeysEnabled) return;
      setScreen(Screens.Break);
      setAudioState(AudioStates.Silent);
    }, [hotKeysEnabled])
  );

  useKeyAction(
    '4',
    useCallback(function goToOnStage() {
      if (!hotKeysEnabled) return;
      setScreen(Screens.End);
      setAudioState(AudioStates.Silent);
    }, [hotKeysEnabled])
  );

  // useKeyAction(
  //   '5',
  //   useCallback(function goToOnStage() {
  //     if (!hotKeysEnabled) return;
  //     setScreen(Screens.OnStage);
  //     setAudioState(AudioStates.Silent);
  //   }, [hotKeysEnabled])
  // );

  useKeyAction(
    '\\',
    useCallback(function goToSettings() {
      if (!hotKeysEnabled) return;
      setScreen(Screens.Settings);
    }, [hotKeysEnabled])
  );

  useKeyAction(
    's',
    useCallback(function onSpin() {
      if (!hotKeysEnabled || screen !== Screens.Wheel) return;
      if (itemToDiscardOnNextSpin) {
        console.log('discarding ', currentItem);
        setItems((items) => items?.filter((item) => item !== currentItem));
        discardItemOnNextSpin(null);
      }
      fadingVolDestination.current = false;
      setFadeVol(1);
      setAudioPlayTime(Date.now());
      setAudioState(AudioStates.WheelAudio);
      setState(WheelStates.Spinning);
    }, [itemToDiscardOnNextSpin, discardItemOnNextSpin, hotKeysEnabled, screen])
  );

  useKeyAction(
    'x',
    useCallback(function discardSelectedItem() {
      if (!hotKeysEnabled) return;
      currentItem && discardItemOnNextSpin(currentItem);
    }, [currentItem, hotKeysEnabled])
  );
  useKeyAction(
    'k',
    useCallback(function discardSelectedItem() {
      if (!hotKeysEnabled) return;
      discardItemOnNextSpin(null);
    }, [currentItem, hotKeysEnabled])
  );
  
  const resetItems = useCallback(() => {
    console.log({ initialItems, items })
    setItems(initialItems?.split("\n").map((s) => s.trim()).filter((s) => !!s.length));
    setState(WheelStates.Rest);
  }, [initialItems, items]);

  useKeyAction('_', useCallback(function() { 
    if (!hotKeysEnabled) return;
    resetItems();
  }, [hotKeysEnabled, resetItems]));

  useKeyAction('-', useCallback(function decreaseWheelScale() {
    if (!hotKeysEnabled) return;
    const newRatio = Math.max(0.1, localWheelCanvasRatioMax - 0.05);
    setLocalWheelCanvasRatioMax(newRatio);
    updateRemoteWheelCanvasRatioMax(newRatio);
    setResetZoomTimestampTrigger(Date.now());
  }, [hotKeysEnabled, localWheelCanvasRatioMax]));

  useKeyAction('=', useCallback(function increaseWheelScale() {
    if (!hotKeysEnabled) return;
    const newRatio = Math.min(0.9, localWheelCanvasRatioMax + 0.05);
    setLocalWheelCanvasRatioMax(newRatio);
    updateRemoteWheelCanvasRatioMax(newRatio);
    setResetZoomTimestampTrigger(Date.now());
  }, [hotKeysEnabled, localWheelCanvasRatioMax]));

  const updateInitialItems = useCallback(
    (textAreaValue: string) => {
      setInitialItems(textAreaValue)
    },
    [],
  );

  return (
    <>
      <AudioPlayer vol={fadeVol} playing={audioSrc === 'hey.mp3' && audioState === AudioStates.OneOff} playTime={audioPlayTime} src={'hey.mp3'}/>
      {/* <AudioPlayer vol={fadeVol} playing={audioSrc === 'benny-hill-1.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'benny-hill-1.mp3'}/>
      <AudioPlayer vol={fadeVol} playing={audioSrc === 'benny-hill-2.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'benny-hill-2.mp3'}/>
      <AudioPlayer vol={fadeVol} playing={audioSrc === 'benny-hill-3.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'benny-hill-3.mp3'}/>
      <AudioPlayer vol={fadeVol} playing={audioSrc === 'benny-hill-4.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'benny-hill-4.mp3'}/>
      <AudioPlayer vol={fadeVol} playing={audioSrc === 'benny-hill-5.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'benny-hill-5.mp3'}/> */}
      <AudioPlayer vol={fadeVol} playing={audioSrc === 'jaja-1.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'jaja-1.mp3'}/>
      <AudioPlayer vol={fadeVol} playing={audioSrc === 'jaja-2.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'jaja-2.mp3'}/>
      <AudioPlayer vol={fadeVol} playing={audioSrc === 'jaja-3.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'jaja-3.mp3'}/>
      <AudioPlayer vol={fadeVol} playing={audioSrc === 'jaja-4.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'jaja-4.mp3'}/>
      <AudioPlayer vol={fadeVol} playing={audioSrc === 'jaja-5.mp3' && audioState === AudioStates.WheelAudio} playTime={audioPlayTime} src={'jaja-5.mp3'}/>
      <div className={getScreenClasses(screen === Screens.Ambient)}>
        <img src="/cr-light.png" style={{ width: '100vw', height: '100vh', objectFit: 'cover' }} />
      </div>
      <div className={getScreenClasses(screen === Screens.Like)}>
        <img src="/cr-like.png" style={{ width: '100vw', height: '100vh', objectFit: 'cover' }} />
      </div>
      <div className={getScreenClasses(screen === Screens.Break)}>
        <img src="/cr-break.png" style={{ width: '100vw', height: '100vh', objectFit: 'cover' }} />
      </div>
      <div className={getScreenClasses(screen === Screens.End)}>
        <img src="/cr-end.png" style={{ width: '100vw', height: '100vh', objectFit: 'cover' }} />
      </div>
      <div className={getScreenClasses(screen === Screens.Social)}>
        <img src="/cr-social.png" style={{ width: '100vw', height: '100vh', objectFit: 'cover' }} />
      </div>
      <div className={getScreenClasses(screen === Screens.OnStage)}>
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
          <img src="/cr-dark.png" style={{ width: '110vw', height: '110vh', objectFit: 'contain', position: 'relative', top: '-6vh', left: '-5vw' }} />
        </div>
      </div>
      <div className={getScreenClasses(screen === Screens.Wheel)}>
        {items?.length && (
          <Wheel
            items={items}
            spinning={state === WheelStates.Spinning}
            onSpinStart={onSpinStart}
            onSpinComplete={onSpinComplete}
            resetZoomTimestampTrigger={resetZoomTimestampTrigger}
            wheelCanvasRatioMax={localWheelCanvasRatioMax}
          />
        )}
      </div>
      { screen === Screens.Settings && (
        <div className={getScreenClasses(screen === Screens.Settings)} style={{ fontFamily: "Poppins", alignItems: "center" }}>
          <h1  style={{ fontFamily: "Poppins", fontWeight: 600 }}>Settings</h1>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <strong>Hotkeys</strong>
              <ul>
                <li>[\] - This Screen</li>
                <li>[1] - Change screen to Ambient: Pink background</li>
                <li>[2] - Change screen to Break: Pink 'Like what you love'</li>
                <li>[3] - Change screen to Break: Instagram / Google review</li>
                <li>[4] - Change screen to Break: Donate / Comedy Festival</li>
                <li>[5] - Change screen to Ambient: Dark background</li>
                <li>[W] - Wheel screen, then:<ul>
                  <li>[S] - Spin wheel, then:<ul>
                    <li>[X] - Remove the selected prompt on next spin</li>
                    <li>[K] - Keep the selected prompt on next spin (this is the default behaviour, if you don't press X first)</li>
                  </ul></li>
                  <li>[Z] - Zoom out</li>
                  <li>[-] - Decrease wheel size</li>
                  <li>[=] - Increase wheel size</li>
                  <li>Shift + [F] - Lower Benny Hill music volume</li>
                  <li>[F] - Fade Benny Hill music out</li>
                  <li>[B] - Stop Benny Hill music (hard stop)</li>
                </ul></li>
                <li>Shift + [-] - Restore all removed wheel segments</li>
              </ul>
            </div>
          </div>
          <div>
            <textarea
              style={{ width: '50%', minWidth: '30em', minHeight: '50vh' }}
              onChange={(e) => updateInitialItems(e.target.value)}
              onFocus={disableHotkeys}
              onBlur={() => {
                enableHotkeys();
                setRemoteItemsFromInitial();
              }}
              value={initialItems}
            />
            <br/>
            <button onClick={resetItems}>Update wheel items</button>
          </div>
        </div>
      )}
    </>
  );
}

const getScreenClasses = (showing: boolean) =>
  `screen _activeState-${showing ? 'showing' : 'hidden'}`;

export default App;
