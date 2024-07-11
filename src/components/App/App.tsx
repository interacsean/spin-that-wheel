import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { Wheel } from '../Wheel/Wheel';
import { Action } from '../Action';
import { useRemoteItems } from '../App/useRemoteItems';
import { useKeyAction } from '../useKeyAction';
import { useOpenTab, playMusic } from '../../services/music/SpotifyTab';

/**
 * - Has multiple slide screens
 * - Items come from async function (external source)
 * - Can spin button from keyboard shortcut
 * - Can fade/hide wheel from keyboard shortcut
 * - Can reset all items from double-keyboard shortcut
 * - Can bring up wheel from kbs
 * - Has sound when spinning
 * -
 */

enum WheelStates {
  Spinning,
  Rest,
}

enum Screens {
  Ambient,
  OnStage,
  Wheel,
  Settings,
}

function App() {
  const initialItems = useRemoteItems();
  const [items, setItems] = useState<string[] | undefined>();
  const [state, setState] = useState<WheelStates>(WheelStates.Rest);
  const [screen, setScreen] = useState<Screens>(Screens.Ambient);
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
    console.log({ selectedItem });
    setState(WheelStates.Rest);
    setItems((items) => (items || []).filter((item) => item !== selectedItem));
  }, []);

  const onSpinStart = useCallback(() => {
    // mute music if playing
  }, []);

  useKeyAction(
    'p',
    useCallback(
      function playMusic_() {
        // @ts-ignore
        playMusic(spotifyTab);
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
    '\\',
    useCallback(function goToSettings() {
      setScreen(Screens.Settings);
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
    'm',
    useCallback(function toggleMusic() {
      // setScreen(Screens.Ambient);
    }, [])
  );

  useKeyAction(
    's',
    useCallback(function onSpin() {
      setState(WheelStates.Spinning);
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

  useEffect(() => {
    console.log({ spotifyTab });
  }, [spotifyTab]);

  return (
    <>
      <div className={getScreenClasses(screen === Screens.Ambient)}>
        <h1>Ambient</h1>
      </div>
      <div className={getScreenClasses(screen === Screens.OnStage)}>
        <h1>On Stage</h1>
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
        {/* <input id="key" /> */}
      </div>
    </>
  );
}

const getScreenClasses = (showing: boolean) =>
  `screen _activeState-${showing ? 'showing' : 'hidden'}`;

export default App;
