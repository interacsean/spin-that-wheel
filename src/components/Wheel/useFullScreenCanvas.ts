import { MutableRefObject, useEffect } from 'react';

export function useFullScreenCanvas(
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  redraw: () => void,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const setCanvasSize = () => {
      console.log('Resized');
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        redraw();
      }
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return canvasRef;
}
