import React, { useEffect, useRef, useState } from 'react';

interface VirtualGamepadJoystickProps {
  x: number; // X position in viewport width units
  y: number; // Y position in viewport height units
  type: 'left' | 'right';
  onMove?: (event: JoystickMoveEvent) => void;
  onStart?: (event: JoystickEvent) => void;
  onStop?: (event: JoystickEvent) => void;
  visible?: boolean;
}

interface JoystickEvent {
  type: 'start' | 'stop';
}

interface JoystickMoveEvent {
  type: 'move';
  x: number;
  y: number;
  direction: Direction | null;
  distance: number;
}

type Direction = 'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT';

interface JoystickCoordinates {
  relativeX: number;
  relativeY: number;
  direction: Direction | null;
  distance: number;
}

export const VirtualGamepadJoystick: React.FC<VirtualGamepadJoystickProps> = ({
  x,
  y,
  type,
  onMove,
  onStart,
  onStop,
  visible = true
}) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [coordinates, setCoordinates] = useState<JoystickCoordinates>({
    relativeX: 0,
    relativeY: 0,
    direction: null,
    distance: 0
  });
  const [pointerId, setPointerId] = useState<number | null>(null);
  const [parentRect, setParentRect] = useState<DOMRect | null>(null);

  const checkIfMobile = () => {
    return window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
  };

  const getDirection = (atan2: number): Direction => {
    const TopRight = 2.35619449;
    const TopLeft = -2.35619449;
    const BottomRight = 0.785398163;
    const BottomLeft = -0.785398163;

    if (atan2 > TopRight || atan2 < TopLeft) {
      return "FORWARD";
    } else if (atan2 < TopRight && atan2 > BottomRight) {
      return "RIGHT";
    } else if (atan2 < BottomLeft) {
      return "LEFT";
    }
    return "BACKWARD";
  };

  const distance = (x: number, y: number): number => {
    return Math.hypot(x, y);
  };

  const distanceToPercentile = (dist: number): number => {
    if (!parentRect) return 0;
    const percentageBaseSize = (dist / (parentRect.width / 2)) * 100;
    return Math.min(percentageBaseSize, 100);
  };

  const handleDirectionalInput = (direction: Direction | null, dist: number) => {
    if (dist < 20) return;

    const keyMapping = {
      'FORWARD': 'ArrowUp',
      'BACKWARD': 'ArrowDown',
      'LEFT': 'ArrowLeft',
      'RIGHT': 'ArrowRight'
    };

    // Release all keys first
    Object.values(keyMapping).forEach(key => {
      const keyUpEvent = new KeyboardEvent('keyup', {
        key: key,
        code: key,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(keyUpEvent);
    });

    // Press the new direction key
    if (direction) {
      const keyCode = keyMapping[direction];
      if (keyCode) {
        const keyDownEvent = new KeyboardEvent('keydown', {
          key: keyCode,
          code: keyCode,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(keyDownEvent);
      }
    }
  };

  const updatePosition = (newCoordinates: JoystickCoordinates) => {
    setCoordinates(newCoordinates);
    
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = 
        `translate(${newCoordinates.relativeX}px, ${newCoordinates.relativeY}px)`;
    }

    handleDirectionalInput(newCoordinates.direction, newCoordinates.distance);

    onMove?.({
      type: "move",
      x: parentRect ? (newCoordinates.relativeX * 2) / parentRect.width : 0,
      y: parentRect ? -((newCoordinates.relativeY * 2) / parentRect.height) : 0,
      direction: newCoordinates.direction,
      distance: newCoordinates.distance
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!baseRef.current) return;

    const rect = baseRef.current.getBoundingClientRect();
    setParentRect(rect);
    setDragging(true);
    setPointerId(e.pointerId);

    if (stickRef.current) {
      stickRef.current.setPointerCapture(e.pointerId);
    }

    onStart?.({ type: "start" });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || e.pointerId !== pointerId || !parentRect) return;

    e.preventDefault();

    const absoluteX = e.clientX;
    const absoluteY = e.clientY;
    let relativeX = absoluteX - parentRect.left - parentRect.width / 2;
    let relativeY = absoluteY - parentRect.top - parentRect.height / 2;
    
    const dist = distance(relativeX, relativeY);
    const radius = parentRect.width / 2;
    
    if (dist > radius) {
      const scale = radius / dist;
      relativeX *= scale;
      relativeY *= scale;
    }

    const atan2 = Math.atan2(relativeX, relativeY);
    const newDirection = getDirection(atan2);

    // Release previous direction keys if direction has changed
    if (coordinates.direction !== newDirection) {
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach(key => {
        const keyEvent = new KeyboardEvent('keyup', {
          key: key,
          code: key,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(keyEvent);
      });
    }

    updatePosition({
      relativeX,
      relativeY,
      distance: distanceToPercentile(dist),
      direction: newDirection
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerId !== pointerId) return;
    
    setDragging(false);
    setPointerId(null);
    
    // Reset position
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = 'translate(0, 0)';
    }
    
    setCoordinates({
      relativeX: 0,
      relativeY: 0,
      direction: null,
      distance: 0
    });

    // Release directional keys
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach(key => {
      const keyEvent = new KeyboardEvent('keyup', {
        key: key,
        code: key,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(keyEvent);
    });

    onStop?.({ type: "stop" });
    onMove?.({
      type: "move",
      x: 0,
      y: 0,
      direction: null,
      distance: 0
    });
  };

  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      if (dragging && e.pointerId === pointerId) {
        handlePointerMove(e as any);
      }
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      if (e.pointerId === pointerId) {
        handlePointerUp(e as any);
      }
    };

    if (dragging) {
      window.addEventListener('pointermove', handleWindowPointerMove);
      window.addEventListener('pointerup', handleWindowPointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, [dragging, pointerId]);

  // Don't render if not mobile or not visible
  if (!checkIfMobile() || !visible) {
    return null;
  }

  return (
    <div
      className="fixed pointer-events-auto touch-none z-[9999] w-20 h-20 lg:w-[120px] lg:h-[120px]"
      style={{
        left: `${x}vw`,
        bottom: `${y}vh`,
      }}
    >
      <div
        ref={baseRef}
        className="relative w-full h-full rounded-full bg-gray-500/20 border-2 border-white/40 flex items-center justify-center shadow-lg shadow-gray-900/20"
      >
        <div
          ref={wrapperRef}
          className={`absolute w-full h-full transition-transform ease-out ${
            dragging ? 'duration-0' : 'duration-100'
          }`}
          style={{ transform: 'translate(0, 0)' }}
        >
          <div
            ref={stickRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[30px] h-[30px] lg:w-[48px] lg:h-[48px] rounded-full bg-white/80 border-2 border-white cursor-pointer touch-none shadow-lg shadow-green-500/20"
            onPointerDown={handlePointerDown}
          />
        </div>
      </div>
    </div>
  );
};