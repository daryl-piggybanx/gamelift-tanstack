import React, { useEffect, useRef } from 'react';

interface TouchToMouseProps {
  children: React.ReactNode;
  enabled?: boolean;
  allowedElement?: HTMLElement | null;
}

export const TouchToMouse: React.FC<TouchToMouseProps> = ({ 
  children, 
  enabled = true, 
  allowedElement 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchDataRef = useRef<{
    activeTouchIdentifier: number | null;
    activeTouchClientX: number;
    activeTouchClientY: number;
    activeTouchScreenX: number;
    activeTouchScreenY: number;
  }>({
    activeTouchIdentifier: null,
    activeTouchClientX: 0,
    activeTouchClientY: 0,
    activeTouchScreenX: 0,
    activeTouchScreenY: 0
  });

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const element = containerRef.current;
    const touchData = touchDataRef.current;

    const syntheticEvent = (
      type: string, 
      event: TouchEvent, 
      additionalInitOpts: MouseEventInit
    ): MouseEvent => {
      const initOpts: MouseEventInit = {
        bubbles: false,
        view: event.view,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        ...additionalInitOpts
      };

      // Handle modifier states if available
      // getModifierState on TouchEvent is in W3C spec, but currently no browser implements it.
      if ((event as any).getModifierState) {
        (initOpts as any).modifierAltGraph = (event as any).getModifierState("AltGraph");
        (initOpts as any).modifierCapsLock = (event as any).getModifierState("CapsLock");
        (initOpts as any).modifierFn = (event as any).getModifierState("Fn");
        (initOpts as any).modifierFnLock = (event as any).getModifierState("FnLock");
        (initOpts as any).modifierHyper = (event as any).getModifierState("Hyper");
        (initOpts as any).modifierNumLock = (event as any).getModifierState("NumLock");
        (initOpts as any).modifierScrollLock = (event as any).getModifierState("ScrollLock");
        (initOpts as any).modifierSuper = (event as any).getModifierState("Super");
        (initOpts as any).modifierSymbol = (event as any).getModifierState("Symbol");
        (initOpts as any).modifierSymbolLock = (event as any).getModifierState("SymbolLock");
      }

      return new MouseEvent(type, initOpts);
    };

    const handleTouchStart = (event: TouchEvent) => {
      // Only process touch if it's on the allowed element or its children
      if (allowedElement && !allowedElement.contains(event.target as Node)) {
        return;
      }

      event.preventDefault();
      
      if (touchData.activeTouchIdentifier !== null || event.targetTouches.length === 0) {
        return;
      }

      const touch = event.targetTouches[0];
      touchData.activeTouchIdentifier = touch.identifier;
      touchData.activeTouchClientX = touch.clientX;
      touchData.activeTouchClientY = touch.clientY;
      touchData.activeTouchScreenX = touch.screenX;
      touchData.activeTouchScreenY = touch.screenY;

      element.dispatchEvent(syntheticEvent('mousemove', event, {
        clientX: touch.clientX,
        clientY: touch.clientY,
        screenX: touch.screenX,
        screenY: touch.screenY,
        buttons: 0,
      }));

      element.dispatchEvent(syntheticEvent('mousedown', event, {
        clientX: touch.clientX,
        clientY: touch.clientY,
        screenX: touch.screenX,
        screenY: touch.screenY,
        button: 0,
        buttons: 1,
      }));
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (allowedElement && !allowedElement.contains(event.target as Node)) {
        return;
      }

      event.preventDefault();

      if (touchData.activeTouchIdentifier === null || event.targetTouches.length === 0) {
        return;
      }

      let touch = event.targetTouches[0];
      for (const iter of event.targetTouches) {
        if (iter.identifier === touchData.activeTouchIdentifier) {
          touch = iter;
          break;
        }
      }

      const movementX = touch.clientX - touchData.activeTouchClientX;
      const movementY = touch.clientY - touchData.activeTouchClientY;

      touchData.activeTouchIdentifier = touch.identifier;
      touchData.activeTouchClientX = touch.clientX;
      touchData.activeTouchClientY = touch.clientY;
      touchData.activeTouchScreenX = touch.screenX;
      touchData.activeTouchScreenY = touch.screenY;

      element.dispatchEvent(syntheticEvent('mousemove', event, {
        clientX: touch.clientX,
        clientY: touch.clientY,
        screenX: touch.screenX,
        screenY: touch.screenY,
        movementX: movementX,
        movementY: movementY,
        buttons: 1,
      }));
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      
      if (touchData.activeTouchIdentifier === null || event.targetTouches.length !== 0) {
        return;
      }

      touchData.activeTouchIdentifier = null;
      
      element.dispatchEvent(syntheticEvent('mouseup', event, {
        clientX: touchData.activeTouchClientX,
        clientY: touchData.activeTouchClientY,
        screenX: touchData.activeTouchScreenX,
        screenY: touchData.activeTouchScreenY,
        button: 0,
        buttons: 0,
      }));
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, allowedElement]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {children}
    </div>
  );
};