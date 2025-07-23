import React from 'react';
import { usePreloadAssets } from '../hooks/usePreloadAssets';
import './AssetLoader.css';

interface AssetLoaderProps {
  children: React.ReactNode;
}

const assetsList = {
  images: [
    '/cr-arrow-active-r.png',
    '/cr-arrow-active.png',
    '/cr-arrow-r.png',
    '/cr-arrow.png',
    '/cr-bg.png',
    '/cr-break.png',
    '/cr-dark.png',
    '/cr-end.png',
    '/cr-flash.png',
    '/cr-light.png',
    '/cr-social.png',
    '/cr-like.png',
  ],
  audio: [
    '/benny-hill-1.mp3',
    '/benny-hill-2.mp3',
    '/benny-hill-3.mp3',
    '/benny-hill-4.mp3',
    '/benny-hill-5.mp3',
    '/wheel-spin-6s.mp3',
    '/hey.mp3',
    // '/bh-01.mp3',
  ],
};

export function AssetLoader({ children }: AssetLoaderProps) {
  const { isLoading, progress, error } = usePreloadAssets(assetsList);

  if (error) {
    return (
      <div className="asset-loader-container">
        <h1>Error loading assets</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="asset-loader-container">
        <h1>Loading Assets...</h1>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <p>{progress}%</p>
      </div>
    );
  }

  return <>{children}</>;
}
