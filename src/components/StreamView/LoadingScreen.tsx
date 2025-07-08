import React, { useEffect, useRef, useState } from 'react';

interface LoadingScreenProps {
  onInteraction?: () => void;
  visible?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onInteraction, 
  visible = true 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date>(new Date());

  const aspectRatio = 16 / 9;

  useEffect(() => {
    if (!visible) {
      setIsLoading(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    startTimeRef.current = new Date();
    setIsLoading(true);

    const animate = () => {
      try {
        // Update canvas dimensions
        canvas.width = Math.min(Math.max(window.innerWidth, 300), 4096);
        canvas.height = Math.min(Math.max(canvas.width / aspectRatio, 200), 2160);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate pulsing animation
        const currentTime = new Date();
        const elapsedTime = Math.max(0, currentTime.getTime() - startTimeRef.current.getTime());
        const pulsePeriodMs = 3000;
        const triangleWave = Math.abs((elapsedTime % pulsePeriodMs) - pulsePeriodMs / 2) / pulsePeriodMs;

        // Draw pulsing text
        const fontSize = Math.min(Math.max(canvas.width / 12, 32), 96);
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = Math.min(Math.max(0.2 + 2.0 * triangleWave, 0), 1.0);
        ctx.fillStyle = "white";
        ctx.fillText("Tap Here", canvas.width / 2, canvas.height * 0.4);

        // Draw touch area indicator
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        const touchRadius = Math.min(canvas.width, canvas.height) / 2;
        ctx.arc(canvas.width / 2, canvas.height * 0.4, touchRadius, 0, 2 * Math.PI);
        ctx.fill();

        if (isLoading) {
          animationFrameRef.current = window.requestAnimationFrame(animate);
        }
      } catch (error) {
        console.error('Animation error:', error);
        setIsLoading(false);
      }
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visible, isLoading]);

  const handleInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x = 0, y = 0;

    try {
      if ('touches' in event && event.touches?.[0]) {
        x = Math.max(0, event.touches[0].clientX - rect.left);
        y = Math.max(0, event.touches[0].clientY - rect.top);
      } else {
        const mouseEvent = event as React.MouseEvent;
        x = Math.max(0, mouseEvent.clientX - rect.left);
        y = Math.max(0, mouseEvent.clientY - rect.top);
      }

      // Validate coordinates are within bounds
      x = Math.min(x, canvas.width);
      y = Math.min(y, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height * 0.4;
      const radius = Math.min(canvas.width, canvas.height) / 2;

      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

      if (distance <= radius) {
        console.log("Interaction within the touch area");
        onInteraction?.();
      }
    } catch (error) {
      console.error('Error handling interaction:', error);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      onTouchStart={handleInteraction}
      onMouseDown={handleInteraction}
      className="w-full h-full block relative z-[4] pointer-events-auto"
      style={{ aspectRatio: aspectRatio.toString() }}
    />
  );
};