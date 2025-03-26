import { useState, useEffect } from 'react';

// Function to preload an image
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

// Function to preload an audio file
const preloadAudio = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.oncanplaythrough = () => resolve();
    audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
    audio.src = src;
  });
};

// Function to preload a font file
const preloadFont = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'font';
    link.crossOrigin = 'anonymous';
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load font: ${src}`));
    
    document.head.appendChild(link);
  });
};

export function usePreloadAssets(assetsList: { 
  images?: string[], 
  audio?: string[],
  fonts?: string[] 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const totalAssets = (assetsList.images || []).length + 
                        (assetsList.audio || []).length +
                        (assetsList.fonts || []).length;
    let loadedAssets = 0;

    const updateProgress = () => {
      loadedAssets++;
      if (isMounted) {
        setProgress(Math.floor((loadedAssets / totalAssets) * 100));
      }
    };

    const preloadAllAssets = async () => {
      try {
        // Preload all images
        const imagePromises = (assetsList.images || []).map(async (src) => {
          await preloadImage(src);
          updateProgress();
        });

        // Preload all audio files
        const audioPromises = (assetsList.audio || []).map(async (src) => {
          await preloadAudio(src);
          updateProgress();
        });
        
        // Preload all font files
        const fontPromises = (assetsList.fonts || []).map(async (src) => {
          await preloadFont(src);
          updateProgress();
        });

        // Wait for all assets to load
        await Promise.all([...imagePromises, ...audioPromises, ...fontPromises]);
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load assets'));
          setIsLoading(false);
        }
      }
    };

    preloadAllAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isLoading, progress, error };
}
