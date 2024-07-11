import React, { useRef, useEffect } from 'react';

type AudioPlayerProps = {
  playing: boolean;
}

export const AudioPlayer = ({ playing }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const playAudio = () => {
    audioRef?.current?.play();
  };

  const pauseAudio = () => {
    audioRef?.current?.pause();
  };

  const stopAudio = () => {
    audioRef?.current?.pause();
    if (audioRef.current)
        audioRef.current.currentTime = 0;
  };

  useEffect(function togglePlaying() {
    if (playing) {
      playAudio();
    } else {
      stopAudio();
    }
  }, [playing]);

  return (
    <div>
      <audio ref={audioRef} src="/bh-01.mp3" preload="auto" />
      <button onClick={playAudio}>Play</button>
      <button onClick={pauseAudio}>Pause</button>
      <button onClick={stopAudio}>Stop</button>
    </div>
  );
};

export default AudioPlayer;
