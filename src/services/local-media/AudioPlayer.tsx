import React, { useRef, useEffect } from 'react';

type AudioPlayerProps = {
  playing: boolean;
  src: string;
}

export const AudioPlayer = ({ playing, src }: AudioPlayerProps) => {
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
    console.log({ playing })
    if (playing) {
      playAudio();
    } else {
      stopAudio();
    }
  }, [playing]);

  return (
    <audio ref={audioRef} src={src} preload="auto" />
  );
};

export default AudioPlayer;
