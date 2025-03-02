import { useRef, useEffect } from 'react';

type AudioPlayerProps = {
  playing: boolean;
  src: string;
  playTime: number;
  vol: number;
}

export const AudioPlayer = ({ playing, playTime, src, vol }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const playAudio = () => {
    audioRef?.current?.play();
  };

  // const pauseAudio = () => {
  //   audioRef?.current?.pause();
  // };

  const stopAudio = () => {
    audioRef?.current?.pause();
    if (audioRef.current)
        audioRef.current.currentTime = 0;
  };

  useEffect(function togglePlaying() {
    if (playing) {
      if (audioRef.current)
        audioRef.current.currentTime = 0;
      playAudio();
    } else {
      stopAudio();
    }
  }, [playing, playTime]);

  useEffect(function updateVolume() {
    if (audioRef.current && !isNaN(vol)) {
      audioRef.current.volume = vol;
    }
  }, [vol])

  return (
    <audio ref={audioRef} src={src} preload="auto"  />
  );
};

export default AudioPlayer;
