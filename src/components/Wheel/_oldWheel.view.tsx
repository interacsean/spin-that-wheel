import React, { useEffect, useRef, useState } from 'react';

type WheelProps = {
  items: string[];
  spinning: boolean;
  onSpinComplete: (item: string) => void;
};

export const Wheel = ({ items, spinning, onSpinComplete }: WheelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [angle, setAngle] = useState<number>(0);
  const [spinVelocity, setSpinVelocity] = useState<number>(0);
  const [spinAcceleration, setSpinAcceleration] = useState<number>(0);

  useEffect(() => {
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

    const drawWheel = () => {
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
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      drawWheel();
    };

    const animateSpin = () => {
      if (spinVelocity > 0) {
        console.log({ spinVelocity });
        setAngle((prev) => prev + spinVelocity);
        setSpinVelocity((prev) => prev + spinAcceleration);
        draw();
        requestAnimationFrame(animateSpin);
      } else {
        setIsSpinning(false);
        setSpinVelocity(0);
        setSpinAcceleration(0);
      }
    };

    draw();
    if (isSpinning) {
      requestAnimationFrame(animateSpin);
    }
  }, [angle, isSpinning, spinVelocity, spinAcceleration]);

  const spin = () => {
    console.log('Spin!');
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinVelocity(Math.random() * 0.2 + 0.3);
    setSpinAcceleration(-0.0005);
  };

  return (
    <div>
      <canvas ref={canvasRef} width="500" height="500"></canvas>
      <button onClick={spin}>Spin</button>
    </div>
  );
};
