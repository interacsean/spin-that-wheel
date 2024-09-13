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

const arrowImg = new Image();
arrowImg.src = '/cr-arrow.png';

const wheelBgImg = new Image();
wheelBgImg.src = '/cr-bg.png';

const flashImg = new Image();
flashImg.src = '/cr-flash.png';
let flashImgWidth = flashImg.width;
let flashImgHeight = flashImg.height;
flashImg.onload = () => {
  flashImgWidth = flashImg.width;
  flashImgHeight = flashImg.height;
}

function drawWheel(
  canvasRef: any,
  angle: number,
  items: string[],
  zoom: number = 0,
  spinning: boolean = false,
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

  const zoomedOutScale = 0.95
  const maxZoomScale = 1.9; // Arbitrary scale value to zoom in fully to one segment
  const zoomScale = zoomedOutScale + zoom * maxZoomScale;

  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(zoomScale, zoomScale);
  ctx.translate(-centerX, -centerY);
  ctx.translate(zoom * -radius * 0.65, 0);
  
  const minBgScale = Math.max(
    canvas.width / wheelBgImg.width, canvas.height / wheelBgImg.height
  );

  const bgImgWidth = wheelBgImg.width * minBgScale / zoomedOutScale;
  const bgImgHeight = wheelBgImg.height * minBgScale / zoomedOutScale;
  const bgImgX = centerX - bgImgWidth / 2
  const bgImgY = centerY - bgImgHeight / 2
  if (wheelBgImg.complete) {
    ctx.drawImage(wheelBgImg, bgImgX, bgImgY, bgImgWidth, bgImgHeight);
  } else {
    wheelBgImg.onload = () => {
      ctx.drawImage(wheelBgImg, bgImgX, bgImgY, bgImgWidth, bgImgHeight);
    };
  }
  const fusciaWidth = 30 + 4;
  const fusciaDarkWidth = fusciaWidth + 10;
  const lightGreenInnerWidth = 18 + fusciaDarkWidth;
  const darkGreenWidth = lightGreenInnerWidth + 60;
  const lightGreenOuterWidth = darkGreenWidth + 15;
  const darkBlueWidth =  lightGreenOuterWidth + 8;
  const lightBlueWidth = darkBlueWidth + 28;
  const darkBlueOuterWidth = lightBlueWidth + 15;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.lineWidth = darkBlueOuterWidth;
  ctx.strokeStyle = '#304E5B'; // darkish blue
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.lineWidth = lightBlueWidth;
  ctx.strokeStyle = '#3982AA'; // grey blue
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.lineWidth = darkBlueWidth;
  ctx.strokeStyle = '#304E5B'; // darkish blue
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.lineWidth = lightGreenOuterWidth;
  ctx.strokeStyle = '#78EA7B'; // light green
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.lineWidth = darkGreenWidth;
  ctx.strokeStyle = '#5FBB61'; // dark green
  ctx.stroke();

  const arrowScaleFactor = 0.75; // Adjust the scale factor to your needs (e.g., 0.5 for 50% size)
  const imgWidth = arrowImg.width * arrowScaleFactor;
  const imgHeight = arrowImg.height * arrowScaleFactor;
  const imgX = centerX + radius + imgWidth / 2 - (104 * arrowScaleFactor); // Center the image horizontally
  const imgY = centerY - imgHeight / 2 - 3; // Center the image vertically
  if (arrowImg.complete) {
    ctx.drawImage(arrowImg, imgX, imgY, imgWidth, imgHeight);
  } else {
    arrowImg.onload = () => {
      ctx.drawImage(arrowImg, imgX, imgY, imgWidth, imgHeight);
    };
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.lineWidth = lightGreenInnerWidth;
  ctx.strokeStyle = '#78EA7B'; // light green
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.lineWidth = fusciaDarkWidth;
  ctx.strokeStyle = '#880033'; // fuscia dark
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.lineWidth = fusciaWidth;
  ctx.strokeStyle = '#cc0088'; // fuscia
  ctx.stroke();

  // // Scatter white lights around the dark green ring
  const lightCount = 24; // Number of lights to draw
  const lightRadius = radius + lightGreenInnerWidth - 16;
  for (let i = 0; i < lightCount; i++) {
    if (i === 0) continue;
    const lightAngle = (i * 2 * Math.PI) / lightCount;
    const lightX = centerX + lightRadius * Math.cos(lightAngle);
    const lightY = centerY + lightRadius * Math.sin(lightAngle);
    ctx.beginPath();
    ctx.arc(lightX, lightY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();

    const time = Date.now();
    const FLASHSPEED = 25;
    const FLASHSIMULTANEOUSTRACKS = 2;
    const flashIndex = Math.floor(time / FLASHSPEED);
    const flashRating = ((flashIndex + i) % (lightCount / FLASHSIMULTANEOUSTRACKS)) / (lightCount / FLASHSIMULTANEOUSTRACKS);
    console.log({ spinning, flashRating, flashImgWidth, flashImgHeight })
    if (spinning && flashRating > 0.3) {
      const flashImgX = lightX - flashImgWidth / 2
      const flashImgY = lightY - flashImgHeight / 2
      // console.log({ flashRating} )
      if (flashRating < 0.6) ctx.globalAlpha = 1;
      else if (flashRating < 0.8) ctx.globalAlpha = 0.7;
      else if (flashRating <= 1) ctx.globalAlpha = 0.3;
      else ctx.globalAlpha = 1;
      // console.log( {flashImgComplete: flashImg.complete })
      if (flashImg.complete) {
        ctx.drawImage(flashImg, flashImgX, flashImgY, flashImgWidth, flashImgHeight);
      } else {
        flashImg.onload = () => {
          ctx.drawImage(flashImg, flashImgX, flashImgY, flashImgWidth, flashImgHeight);
        };
      }
    }
    ctx.globalAlpha = 1;
  }

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
    const fontSize = 20;
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

    const maxTextWidth = radius * 0.78; // Adjust this value to your desired width
    const lines = wrapText(items[i] || '-', maxTextWidth);
    const lineHeight = fontSize * 1.4; // Adjust based on your font size
    const totalTextHeight = (lines.length - 1) * lineHeight;

    lines.forEach((line, index) => {
      ctx.fillText(line, radius * 0.6, -(totalTextHeight / 2) + index * lineHeight);
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
  console.log({ fic: flashImg.complete });

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
      drawWheel(canvasRef, angle, items, zoom, spinVelocity > 0);
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
    drawWheel(canvasRef, wheelAngle, items, zoom, spinning);
  }, [wheelAngle, items, spinning]);

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
