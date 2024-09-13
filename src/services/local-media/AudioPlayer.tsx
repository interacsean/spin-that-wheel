import React, { useRef, useEffect } from 'react';

type AudioPlayerProps = {
  playing: boolean;
  src: string;
  playTime: number;
}

export const AudioPlayer = ({ playing, playTime, src }: AudioPlayerProps) => {
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
    console.log({ playTime })
    if (playing) {
      if (audioRef.current)
        audioRef.current.currentTime = 0;
      playAudio();
    } else {
      stopAudio();
    }
  }, [playing, playTime]);

  return (
    <audio ref={audioRef} src={src} preload="auto" />
  );
};

export default AudioPlayer;
