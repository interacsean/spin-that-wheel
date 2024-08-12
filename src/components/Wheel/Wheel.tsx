import { useEffect, useRef, useState, Ref, useCallback } from 'react';
import { calculateChosenItem } from '../Wheel/calculateChosenItem';
import { useFullScreenCanvas } from './useFullScreenCanvas';
import { useKeyAction } from '../useKeyAction';

const WHEEL_CANVAS_RATIO_MAX = 0.85;

type WheelProps = {
  items: string[];
  spinning: boolean;
  onSpinComplete: (item: string) => void;
  onSpinStart: () => void;
};

function drawWheel(
  canvasRef: any,
  angle: number,
  items: string[],
  zoom: number = 0,
) {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width * WHEEL_CANVAS_RATIO_MAX;
  const height = canvas.height * WHEEL_CANVAS_RATIO_MAX;
  const wheelLeft = (canvas.width - width) / 2;
  const wheelTop = (canvas.height - height) / 2;
  const centerX = wheelLeft + width / 2;
  const centerY = wheelTop + height / 2;
  const radius = Math.min(height, width) / 2;
  const segments = items.length;
  const segmentAngle = (2 * Math.PI) / segments;
  const colors = [
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#FF33A1',
    '#FFAA33',
    '#33FFAA',
    '#AA33FF',
    '#FF3333',
    '#33FFFF',
    '#FFFF33',
    '#FF33FF',
    '#33FF77',
  ];
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const maxZoomScale = 2; // Arbitrary scale value to zoom in fully to one segment
  const zoomScale = 1 + zoom * maxZoomScale;
  // console.log({ zoomScale, zoom })
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(zoomScale, zoomScale);
  ctx.translate(-centerX, -centerY);
  ctx.translate(zoom * -radius / 2, 0);
  
  for (let i = 0; i < segments; i++) {
    const startAngle = angle + i * segmentAngle;
    const endAngle = startAngle + segmentAngle;

    // Draw segment
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.stroke();

    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(items[i] || '-', radius - 10, 10);
    ctx.restore();
  }
  ctx.restore();
}

function startWheelAnimation(
  canvasRef: Ref<HTMLCanvasElement>,
  angle: number = 0,
  items: string[],
  callback: (angle: number) => void
) {
  const slowdownCutoff = 0.0005;
  const spinAccelerationAbs = -0.000005;
  const slowSpinVelocityAbs = 0.0001;
  const spinAccelerationMult = 0.02;
  let spinVelocity = 0.01 + (Math.random() * 0.00003);
  let terminalAngle: number | undefined = undefined;
  // TODO: introduce way to interjecting with keypress to initiate slowdown
  let lastAnimationTime = performance.now();
  let zoom = 0;

  const animateSpin: FrameRequestCallback = (time) => {
    const timeDelta = time - lastAnimationTime;
    lastAnimationTime = time;
    if (spinVelocity > 0) {
      if (spinVelocity < 0.005) {
        // TODO: work on zoom rate and velocity cutoffs, and some easing.  Maybe as a sine ratio of some velocity
        zoom = Math.min(1, zoom + (0.5) * timeDelta/1000);
      }
      if (spinVelocity > slowdownCutoff) {
        const angleMoved = spinVelocity * timeDelta;
        angle = angle + angleMoved;
        spinVelocity =
          spinVelocity * (1 - (spinAccelerationMult * timeDelta) / 60) +
          spinAccelerationAbs;
      } else {
        spinVelocity = slowdownCutoff;
        if (!terminalAngle) {
          const segmentWedgeAngle = (Math.PI * 2 / items.length);
          terminalAngle = Math.round(angle / segmentWedgeAngle) * segmentWedgeAngle + (0.5 * segmentWedgeAngle);
        }
        if (angle > terminalAngle) {
          angle = terminalAngle;
          spinVelocity = 0;
          console.log('hit terminal')
        } else {
          angle = angle + Math.max(0, Math.min(slowdownCutoff, (terminalAngle - angle) * 0.002)) * timeDelta + slowSpinVelocityAbs;
        }
      }
      drawWheel(canvasRef, angle, items, zoom);
      requestAnimationFrame(animateSpin);
    } else {
      console.log('calling cb');
      callback(angle);
    }
  };
  animateSpin(lastAnimationTime);
}

export const Wheel = ({
  items,
  spinning,
  onSpinComplete,
  onSpinStart,
}: WheelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wheelAngle, setWheelAngle] = useState(0);
  
  const redrawWheel = useCallback((zoom: number = 0) => {
    drawWheel(canvasRef, wheelAngle, items, zoom);
  }, [wheelAngle, items]);

  useKeyAction(
    'z',
    useCallback(function resetZoom() {
      redrawWheel()
    }, [redrawWheel])
  );

  useFullScreenCanvas(canvasRef, redrawWheel);
  
  useEffect(redrawWheel,[items]);

  const spin = () => {
    onSpinStart();
    startWheelAnimation(canvasRef, wheelAngle, items, (finishingAngle: number) => {
      const selectedItem = calculateChosenItem(items, finishingAngle);
      setWheelAngle(finishingAngle);
      onSpinComplete(selectedItem);
    });
  };
  useEffect(
    function spinThatWheel() {
      if (spinning) {
        spin();
      }
    },
    [spinning]
  );

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
      {/* <button onClick={spin}>Spin</button> */}
    </div>
  );
};
