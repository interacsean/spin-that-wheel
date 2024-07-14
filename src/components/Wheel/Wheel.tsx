import { useEffect, useRef, useState, Ref, useCallback } from 'react';
import { calculateChosenItem } from '../Wheel/calculateChosenItem';
import { useFullScreenCanvas } from './useFullScreenCanvas';

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
  const maxZoomScale = 0.5; // Arbitrary scale value to zoom in fully to one segment
  const zoomScale = 1 + zoom * maxZoomScale;
  // console.log({ zoomScale, zoom })
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(zoomScale, zoomScale);
  ctx.translate(-centerX, -centerY);
  // ctx.translate(maxZoomScale * radius / 2, 0);
  
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
  let spinVelocity = 0.01 + (Math.random() * 0.00003);
  let spinAccelerationAbs = -0.000005;
  let spinAccelerationMult = 0.02;
  // TODO: introduce way to interjecting with keypress to initiate slowdown
  let lastAnimationTime = performance.now();
  let zoom = 0;

  const animateSpin: FrameRequestCallback = (time) => {
    const timeDelta = time - lastAnimationTime;
    lastAnimationTime = time;
    if (spinVelocity > 0) {
      if (spinVelocity < 0.005) {
        // TODO: work on zoom rate and velocity cutoffs, and some easing.  Maybe as a sine ratio of some velocity
        zoom = Math.min(1, zoom + (0.3) * timeDelta/1000);
      }
      const angleMoved = spinVelocity * timeDelta;
      angle = angle + angleMoved;
      spinVelocity =
        spinVelocity * (1 - (spinAccelerationMult * timeDelta) / 60) +
        spinAccelerationAbs;
      drawWheel(canvasRef, angle, items, zoom);
      requestAnimationFrame(animateSpin);
    } else {
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
  
  // const [isSpinning, setIsSpinning] = useState<boolean>(false);
  
  const redrawWheel = useCallback(() => {
    drawWheel(canvasRef, wheelAngle, items, 1);
  }, [wheelAngle, items]);

  useFullScreenCanvas(canvasRef, redrawWheel);

  useEffect(redrawWheel,[redrawWheel]);

  const spin = () => {
    onSpinStart();
    startWheelAnimation(canvasRef, wheelAngle, items, (finishingAngle: number) => {
      const selectedItem = calculateChosenItem(items, finishingAngle);
      // console.log({ finishingAngle, items, selectedItem });
      setWheelAngle(finishingAngle);
      onSpinComplete(`${finishingAngle}`);
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
