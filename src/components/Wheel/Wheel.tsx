import { useEffect, useRef, useState, Ref, useCallback } from 'react';
import { calculateChosenItem } from '../Wheel/calculateChosenItem';
import { useFullScreenCanvas } from './useFullScreenCanvas';
import { useKeyAction } from '../useKeyAction';

const WHEEL_CANVAS_RATIO_MAX = 0.76;
const TEXT_TO_WHEEL_RATIO = 16;

type WheelProps = {
  items: string[];
  spinning: boolean;
  onSpinComplete: (item: string) => void;
  onSpinStart: () => void;
};

function add(toAdd: number, baseNum: string) {
  return (Math.max(0, Math.min(255, parseInt(baseNum, 16) + toAdd))).toString(16)
}

function brighten(hex: string) {
  return [hex.slice(0, 1), `${add(64, hex.slice(1, 3))}`.padStart(2, '0'),
    `${add(64, hex.slice(3, 5))}`.padStart(2, '0'),
    `${add(64, hex.slice(5, 7))}`.padStart(2, '0')].join('');
}
function darken(hex: string, amt: number) {
  const adjustedAmt = Math.round(Math.pow(amt, 1.7) * 20);
  // console.log(`aj ${adjustedAmt}`);
  return [hex.slice(0, 1), `${add(-adjustedAmt, hex.slice(1, 3))}`.padStart(2, '0'),
    `${add(-adjustedAmt, hex.slice(3, 5))}`.padStart(2, '0'),
    `${add(-adjustedAmt, hex.slice(5, 7))}`.padStart(2, '0')].join('');
}

const arrowActiveImg = new Image();
arrowActiveImg.src = '/cr-arrow-active.png';

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
  speed: number,
) {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const wheelWidth = canvas.width * WHEEL_CANVAS_RATIO_MAX;
  const wheelHeight = canvas.height * WHEEL_CANVAS_RATIO_MAX;
  const wheelLeft = (canvas.width - wheelWidth) / 2;
  const wheelTop = (canvas.height - wheelHeight) / 2;
  const centerX = wheelLeft + wheelWidth / 2;
  const centerY = wheelTop + wheelHeight / 2;
  const wheelRadius = Math.min(wheelHeight, wheelWidth) / 2;
  const segments = items.length;
  const segmentAngle = (2 * Math.PI) / segments;

  // Colors that match the screenshot
  // const oldWheelColors = [
  //   '#e03645',
  //   '#55bd6e',
  //   '#f18847',
  //   '#2cb0d1',
  //   '#ca80c9',
  //   '#ddd467',
  // ];
  const rainbowColors = ['#87BA40',
    '#F0F551',
    '#F3C845',
    '#EB8435',
    '#E75328',
    '#E23123',
    '#B3276A',
    '#8D58C0', // '#430D76',
    '#5751D3', // '#110C76',
    '#5593AC',
    '#539B3E'
  ];
  const allColors = rainbowColors;
  const ratioItemsToColors = Math.abs(items.length / allColors.length % 1);
  const numColors = Math.min(ratioItemsToColors, 1 - ratioItemsToColors) < (2 / allColors.length)
    ? rainbowColors.length - 4 : rainbowColors.length;
  const colors = allColors.slice(0, numColors);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const zoomedOutScale = 0.95
  // todo: make relative to screen ratio
  const maxZoomScale = 1.2; // Arbitrary scale value to zoom in fully to one segment
  const zoomScale = zoomedOutScale + zoom * maxZoomScale;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(zoomScale, zoomScale);
  ctx.translate(-centerX, -centerY);
  ctx.translate(zoom * wheelRadius * 0.70, 0);
  
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
  const RINGS_SCREEN_SCALE_RATIO = wheelRadius / 292;
  const fusciaWidth = (30 + 4) * RINGS_SCREEN_SCALE_RATIO;
  const fusciaDarkWidth = fusciaWidth + (10 * RINGS_SCREEN_SCALE_RATIO);
  const lightGreenInnerWidth = (18 * RINGS_SCREEN_SCALE_RATIO) + fusciaDarkWidth;
  const darkGreenWidth = lightGreenInnerWidth + (60 * RINGS_SCREEN_SCALE_RATIO);
  const lightGreenOuterWidth = darkGreenWidth + (15 * RINGS_SCREEN_SCALE_RATIO);
  const darkBlueWidth =  lightGreenOuterWidth + (8 * RINGS_SCREEN_SCALE_RATIO);
  const lightBlueWidth = darkBlueWidth + (28 * RINGS_SCREEN_SCALE_RATIO);
  const darkBlueOuterWidth = lightBlueWidth + (15 * RINGS_SCREEN_SCALE_RATIO);

  ctx.beginPath();
  ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI);
  ctx.lineWidth = darkBlueOuterWidth;
  ctx.strokeStyle = '#304E5B'; // darkish blue
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI);
  ctx.lineWidth = lightBlueWidth;
  ctx.strokeStyle = '#3982AA'; // grey blue
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI);
  ctx.lineWidth = darkBlueWidth;
  ctx.strokeStyle = '#304E5B'; // darkish blue
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI);
  ctx.lineWidth = lightGreenOuterWidth;
  ctx.strokeStyle = '#78EA7B'; // light green
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI);
  ctx.lineWidth = darkGreenWidth;
  ctx.strokeStyle = '#5FBB61'; // dark green
  ctx.stroke();

  const arrowScaleFactor = wheelRadius / 313.5 * 0.75; // Adjust the scale factor to your needs (e.g., 0.5 for 50% size)
  const imgWidth = arrowImg.width * arrowScaleFactor;
  const imgHeight = arrowImg.height * arrowScaleFactor;
  const imgX = centerX - wheelRadius - imgWidth / 2 - (180 * arrowScaleFactor); // Center the image horizontally
  const imgY = centerY - imgHeight / 2 - 3; // Center the image vertically
  const drawArrowActive = !spinning && (zoom > 0);

  if (drawArrowActive) {
    if (arrowActiveImg.complete) {
      ctx.drawImage(arrowActiveImg, imgX, imgY, imgWidth, imgHeight);
    } else {
      arrowActiveImg.onload = () => {
        ctx.drawImage(arrowActiveImg, imgX, imgY, imgWidth, imgHeight);
      };
    }
  } 
  if (!drawArrowActive) {
    if (arrowImg.complete) {
      ctx.drawImage(arrowImg, imgX, imgY, imgWidth, imgHeight);
    } else {
      arrowImg.onload = () => {
        ctx.drawImage(arrowImg, imgX, imgY, imgWidth, imgHeight);
      };
    }
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI);
  ctx.lineWidth = lightGreenInnerWidth;
  ctx.strokeStyle = '#78EA7B'; // light green
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI);
  ctx.lineWidth = fusciaDarkWidth;
  ctx.strokeStyle = '#880033'; // fuscia dark
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI);
  ctx.lineWidth = fusciaWidth;
  ctx.strokeStyle = '#cc0088'; // fuscia
  ctx.stroke();

  // // Scatter white lights around the dark green ring
  const lightCount = 24; // Number of lights to draw
  const lightRadius = wheelRadius + lightGreenInnerWidth - (16 * RINGS_SCREEN_SCALE_RATIO);
  for (let i = 0; i < lightCount; i++) {
    if (i === lightCount / 2) continue;
    const lightAngle = (i * 2 * Math.PI) / lightCount;
    const lightX = centerX + lightRadius * Math.cos(lightAngle);
    const lightY = centerY + lightRadius * Math.sin(lightAngle);
    ctx.beginPath();
    ctx.arc(lightX, lightY, 10 * RINGS_SCREEN_SCALE_RATIO, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();

    const time = Date.now();
    const FLASHSPEED = 25;
    const FLASHSIMULTANEOUSTRACKS = 2;
    const flashIndex = Math.floor(time / FLASHSPEED);
    const flashRating = ((flashIndex + i) % (lightCount / FLASHSIMULTANEOUSTRACKS)) / (lightCount / FLASHSIMULTANEOUSTRACKS);

    if (spinning && flashRating > 0.3) {
      const flashImgX = lightX - flashImgWidth / 2
      const flashImgY = lightY - flashImgHeight / 2
      if (flashRating < 0.6) ctx.globalAlpha = 1;
      else if (flashRating < 0.8) ctx.globalAlpha = 0.7;
      else if (flashRating <= 1) ctx.globalAlpha = 0.3;
      else ctx.globalAlpha = 1;
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

  const FONT_SHRINKABILITY =  (wheelRadius / 100);
  const fontSize = (wheelRadius / TEXT_TO_WHEEL_RATIO) - FONT_SHRINKABILITY;
  const fontSizeAdjusted = fontSize - (FONT_SHRINKABILITY * Math.min(1, Math.max(0, (segments - 10) / 10)));
  for (let i = 0; i < segments; i++) {
    const startAngle = angle + i * segmentAngle;
    const endAngle = startAngle + segmentAngle;
    const active = (endAngle % (2 * Math.PI)) < segmentAngle * 0.9 && (endAngle % (2 * Math.PI)) > segmentAngle * 0.1;
    const segmentColor = !active && zoom < 1
      ? colors[i % colors.length]
      : active 
      ? brighten(colors[i % colors.length]) 
      : darken(colors[i % colors.length], Math.max(0, Math.min(1, 1 - speed * 300)))
    
    // console.log(`dk: ${ Math.max(0, Math.min(1, 1 - speed * 300))}`);

    // Draw segment
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, wheelRadius, startAngle + Math.PI, endAngle + Math.PI);
    ctx.closePath();

    // Fill the segment with colors matching the screenshot
    ctx.fillStyle = segmentColor;
    ctx.fill();

    // Add segment border to match the screenshot
    ctx.strokeStyle = 'black'; // Black border to match the screenshot
    ctx.lineWidth = 3; // Adjust to match the thickness in the screenshot
    ctx.stroke();

    // Draw text
    const characters = items[i].length;
    if (characters > 65) {
      ctx.font = `${fontSizeAdjusted * 0.70}px "Hoss Round"`;
    } else if (characters > 50) {
      ctx.font = `${fontSizeAdjusted * 0.82}px "Hoss Round"`;
    } else {
      ctx.font = `${fontSizeAdjusted}px "Hoss Round"`;
    }
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'black';

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

    const maxTextWidth = wheelRadius * 0.68;
    const lines = wrapText(items[i] || '-', maxTextWidth);
    const yOffset = lines.length === 1 ? -0.6 : lines.length - 2
    const lineHeight = fontSizeAdjusted * 1;
    const totalTextHeight = yOffset * lineHeight;

    lines.forEach((line, index) => {
      ctx.fillText(line, - (wheelRadius * 0.97), -(totalTextHeight / 2) + index * lineHeight);
    });

    ctx.restore();
  }

  // Draw the center-piece (white circle with red pie segments)
  const centerPieceRadius = wheelRadius * 0.15; // Adjust the size to match the screenshot
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
  const slowdownCutoff = 0.0003;
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
      let roughSpeed = spinVelocity;
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
          roughSpeed = 0;
          angle = terminalAngle;
          spinVelocity = 0;
          console.log('hit terminal')
        } else {
          roughSpeed = Math.max(0, Math.min(slowdownCutoff, (terminalAngle - angle) * 0.002))
          angle = angle + Math.max(0, Math.min(slowdownCutoff, (terminalAngle - angle) * 0.002)) * timeDelta + slowSpinVelocityAbs;
        }
      }
      drawWheel(canvasRef, angle, items, zoom, spinVelocity > 0, roughSpeed);
      requestAnimationFrame(animateSpin);
    } else {
      drawWheel(canvasRef, angle, items, zoom, false, 0);
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
    drawWheel(canvasRef, wheelAngle, items, zoom, spinning, 0);
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
