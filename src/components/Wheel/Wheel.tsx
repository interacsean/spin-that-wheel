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

  // Colors that match the screenshot
  const colors = [
    '#FFB6C1', '#ADD8E6', '#90EE90', '#FFD700',
    '#FF69B4', '#87CEEB', '#98FB98', '#FFA07A',
    '#DB7093', '#AFEEEE', '#EE82EE', '#F0E68C',
  ];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const maxZoomScale = 2; // Arbitrary scale value to zoom in fully to one segment
  const zoomScale = 1 + zoom * maxZoomScale;

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

    // Fill the segment with colors matching the screenshot
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();

    // Add segment border to match the screenshot
    ctx.strokeStyle = 'black'; // Black border to match the screenshot
    ctx.lineWidth = 3; // Adjust to match the thickness in the screenshot
    ctx.stroke();

    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    const fontSize = 14;
    ctx.font = `${fontSize}px Arial`;

    // Custom function to wrap text
    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      words.forEach((word) => {
        const testLine = currentLine + word + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && currentLine !== '') {
          lines.push(currentLine);
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      });

      lines.push(currentLine.trim());
      return lines;
    };

    const maxTextWidth = radius * 0.7; // Adjust this value to your desired width
    const lines = wrapText(items[i] || '-', maxTextWidth);
    const lineHeight = fontSize * 1.4; // Adjust based on your font size
    const totalTextHeight = (lines.length - 1) * lineHeight;

    lines.forEach((line, index) => {
      ctx.fillText(line, radius * 0.63, -(totalTextHeight / 2) + index * lineHeight);
    });

    ctx.restore();
  }

  // Draw the center-piece (white circle with red pie segments)
  const centerPieceRadius = radius * 0.15; // Adjust the size to match the screenshot
  const pieSegmentCount = 36; // Number of red pie segments in the circle
  const pieSegmentAngle = (2 * Math.PI) / pieSegmentCount;

  // Draw the white circle with stroke and shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.beginPath();
  ctx.arc(centerX, centerY, centerPieceRadius, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.restore();

  // Draw the red pie segments
  ctx.fillStyle = '#ffaaaa';
  for (let i = 0; i < pieSegmentCount; i++) {
    const startAngle = i * pieSegmentAngle;
    const endAngle = startAngle + pieSegmentAngle / 2; // Adjust for the thickness of the segments
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, centerPieceRadius * 0.85, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
  }
  
  // Draw the inner white circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, centerPieceRadius * 0.25, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();

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
