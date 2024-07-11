import { useEffect, useRef, useState, Ref } from 'react';
import { calculateChosenItem } from '../Wheel/calculateChosenItem';

type WheelProps = {
  items: string[];
  spinning: boolean;
  onSpinComplete: (item: string) => void;
  onSpinStart: () => void;
};

const useWhatsChanged = (props: Record<string, unknown>, prefix = '') => {
  const prevProps = useRef(props);

  useEffect(() => {
    Object.entries(props).forEach(([key, value]) => {
      if (
        !Object.prototype.hasOwnProperty.call(prevProps.current, key) ||
        prevProps.current[key] !== value
      ) {
        // eslint-disable-next-line no-console
        console.log(`${prefix} ${key} has changed ${value}`);
      }
    });

    prevProps.current = props;
  }, [props, prefix]);
};

// function initWheel(canvasRef) {
//   const canvas = canvasRef.current;
//   if (!canvas) return;

//   const ctx = canvas.getContext('2d');
//   if (!ctx) return;

// }
// console.log('UFX');

// const drawWheel = () => {
// };

function drawWheel(canvasRef: any, angle: number) {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 10;
  const segments = 12;
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
  const labels = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
  ];

  ctx.clearRect(0, 0, width, height);
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
    ctx.fillText(labels[i], radius - 10, 10);
    ctx.restore();
  }
}

function startWheelAnimation(
  canvasRef: Ref<HTMLCanvasElement>,
  angle: number = 0,
  callback: (angle: number) => void
) {
  let spinVelocity = 0.0001; // (Math.random() * 0.2 + 0.3) / 60; // todo: convert to
  let spinAccelerationAbs = -0.000000001;
  let spinAccelerationMult = 0.0003;
  let lastAnimationTime = performance.now();

  const animateSpin: FrameRequestCallback = (time) => {
    if (spinVelocity > 0) {
      const timeDelta = time - lastAnimationTime;
      const angleMoved = spinVelocity * timeDelta;
      angle = angle - angleMoved;
      spinVelocity =
        spinVelocity * (1 - (spinAccelerationMult * timeDelta) / 60) +
        spinAccelerationAbs;
      drawWheel(canvasRef, angle);
      requestAnimationFrame(animateSpin);
    } else {
      callback(angle); // calculate item
    }
  };
  animateSpin(lastAnimationTime);
}

export const Wheel = ({
  items,
  spinning,
  onSpinComplete,
  onSpinStart,
  ...rest
}: WheelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  // useWhatsChanged({
  //   angle,
  //   spinVelocity,
  //   spinAcceleration,
  //   items,
  //   spinning,
  //   onSpinComplete,
  //   ...rest,
  // });

  console.log('Draw wheel');
  useEffect(
    function initialDraw() {
      if (canvasRef) drawWheel(canvasRef, wheelAngle);
    },
    [canvasRef]
  );

  const spin = () => {
    onSpinStart();
    startWheelAnimation(canvasRef, wheelAngle, (finishingAngle: number) => {
      const selectedItem = calculateChosenItem(items, finishingAngle);
      // finishng angle -19.91 -> exactly on 8/9
      console.log({ finishingAngle, items, selectedItem });
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
      <canvas ref={canvasRef} width="500" height="500"></canvas>
      <button onClick={spin}>Spin</button>
    </div>
  );

  // useEffect(
  //   function startSpin() {
  //     if (spinning) {
  //       console.log('Start sound');
  //       setTimeout(() => {
  //         console.log('Finish sound');
  //         const selectedItem = items[Math.floor(Math.random() * items.length)];
  //         onSpinComplete(selectedItem);
  //       }, 3000);
  //     }
  //   },
  //   [spinning]
  // );
  // return <div>{items.join(', ')}</div>;
};
