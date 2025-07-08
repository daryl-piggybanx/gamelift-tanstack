import React, { useEffect, useRef, useState } from 'react';

interface VirtualButtonProps {
  svgName: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  x: number; // X position in viewport width units
  y: number; // Y position in viewport height units
  keyCode?: string;
  keyCodeNum?: number;
  onPress?: () => void;
  onRelease?: () => void;
  visible?: boolean;
}

export const VirtualButton: React.FC<VirtualButtonProps> = ({
  svgName,
  direction,
  x,
  y,
  keyCode,
  keyCodeNum,
  onPress,
  onRelease,
  visible = true
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [moveInterval, setMoveInterval] = useState<NodeJS.Timeout | null>(null);

  const checkIfMobile = () => {
    return window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
  };

  const isDPadButton = () => {
    return ['dPadUp', 'dPadDown', 'dPadLeft', 'dPadRight'].includes(svgName);
  };

  const startContinuousMove = () => {
    if (moveInterval) return;

    const moveSpeed = 16;
    
    const interval = setInterval(() => {
      if (!isPressed) return;
      
      const event = new CustomEvent('dpadMove', {
        detail: {
          direction,
          speed: moveSpeed
        }
      });
      document.dispatchEvent(event);
    }, 16);

    setMoveInterval(interval);
  };

  const stopContinuousMove = () => {
    if (moveInterval) {
      clearInterval(moveInterval);
      setMoveInterval(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    
    setIsPressed(true);
    onPress?.();
    
    // Only start continuous movement for d-pad buttons
    if (isDPadButton()) {
      startContinuousMove();
    }
    
    // Dispatch keyboard event if keyCode is provided
    if (keyCode) {
      const keyEvent = new KeyboardEvent('keydown', {
        key: keyCode,
        code: keyCode,
        keyCode: keyCodeNum,
        which: keyCodeNum,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(keyEvent);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    
    setIsPressed(false);
    onRelease?.();
    
    stopContinuousMove();
    
    // Dispatch keyboard event if keyCode is provided
    if (keyCode) {
      const keyEvent = new KeyboardEvent('keyup', {
        key: keyCode,
        code: keyCode,
        keyCode: keyCodeNum,
        which: keyCodeNum,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(keyEvent);
    }
  };

  useEffect(() => {
    return () => {
      if (moveInterval) {
        clearInterval(moveInterval);
      }
    };
  }, [moveInterval]);

  const getSVGContent = (buttonName: string) => {
    const customSVGs: { [key: string]: string } = {
      buttonA: `
        <svg width="81" height="81" viewBox="0 0 81 81" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40.3496" cy="40.1094" r="37.5" fill="#FFFFFF" fill-opacity="0.2" stroke="#FFFFFF" stroke-width="3"/>
        <path d="M46.59 55.1094L44.63 48.7894H35.15L33.27 55.1094H26.99L36.75 27.3894H43.35L53.11 55.1094H46.59ZM36.43 44.4694H43.39L39.87 32.8694L36.43 44.4694Z" fill="#FFFFFF"/>
        </svg>
      `,
      buttonB: `
        <svg width="81" height="81" viewBox="0 0 81 81" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40.9355" cy="40.0938" r="37.5" fill="#FFFFFF" fill-opacity="0.2" stroke="#FFFFFF" stroke-width="3"/>
        <path d="M31.3348 55.0938V27.3737H41.2948C43.9614 27.3737 46.1081 28.0537 47.7348 29.4137C49.3881 30.7737 50.2148 32.5471 50.2148 34.7337C50.2148 36.0937 49.8948 37.2671 49.2548 38.2537C48.6414 39.2137 47.7214 39.9604 46.4948 40.4937C48.2014 41.0004 49.4948 41.8404 50.3748 43.0137C51.2814 44.1604 51.7348 45.5737 51.7348 47.2537C51.7348 49.6537 50.8414 51.5604 49.0548 52.9737C47.2681 54.3871 44.8681 55.0938 41.8548 55.0938H31.3348ZM37.0148 43.0137V50.8137H41.7348C44.4548 50.8137 45.8148 49.5337 45.8148 46.9737C45.8148 44.3337 44.3614 43.0137 41.4548 43.0137H37.0148ZM37.0148 31.6537V38.9337H40.4948C43.0814 38.9337 44.3748 37.7337 44.3748 35.3337C44.3748 32.8804 43.1881 31.6537 40.8148 31.6537H37.0148Z" fill="#FFFFFF"/>
        </svg>
      `,
      buttonX: `
        <svg width="81" height="81" viewBox="0 0 81 81" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40.5332" cy="40.0938" r="37.5" fill="#FFFFFF" fill-opacity="0.2" stroke="#FFFFFF" stroke-width="3"/>
        <path d="M46.0124 55.0938L40.2124 44.8537L34.4924 55.0938H27.8924L36.8924 40.6937L28.5724 27.3737H35.3324L40.4124 36.3737L45.4924 27.3737H52.0924L43.6524 40.6137L52.7724 55.0938H46.0124Z" fill="#FFFFFF"/>
        </svg>
      `,
      buttonY: `
        <svg width="81" height="81" viewBox="0 0 81 81" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40.3496" cy="40.8281" r="37.5" fill="#FFFFFF" fill-opacity="0.2" stroke="#FFFFFF" stroke-width="3"/>
        <path d="M37.1088 55.8281V45.5881L27.9488 28.1081H34.5488L40.2288 41.0681L46.0688 28.1081H52.3488L43.0288 45.6681V55.8281H37.1088Z" fill="#FFFFFF"/>
        </svg>
      `,
      dPadUp: `
        <svg width="64" height="94" viewBox="0 0 64 94" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M30.2284 88.9199L27.6316 91.7105L2.70477 67.1637L5.49175 64.1688L30.4185 88.7156C31.6926 89.9702 33.7102 89.9389 34.9469 88.6453L58.3584 64.1573C58.9515 63.537 59.2838 62.7017 59.2838 61.8316V8.04873C59.2838 6.21692 57.8403 4.73194 56.0596 4.73194H7.72133C5.94063 4.73194 4.49709 6.21692 4.49709 8.04874V61.7728C4.49709 62.6776 4.8564 63.5431 5.49175 64.1688L2.70477 67.1637C1.27524 65.756 0.466797 63.8086 0.466797 61.7728V8.04874C0.466797 3.92715 3.71476 0.585938 7.72133 0.585938H56.0596C60.0661 0.585938 63.3141 3.92714 63.3141 8.04873V61.8316C63.3141 63.7893 62.5663 65.6687 61.2319 67.0644L58.4565 64.2566L61.2318 67.0645L37.8204 91.5525C35.0378 94.463 30.4982 94.5334 27.6316 91.7105L30.2284 88.9199Z" fill="#FFFFFF"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M7.72228 4.73438H56.0605C57.8412 4.73438 59.2848 6.21936 59.2848 8.05117V61.834C59.2848 62.7041 58.9524 63.5394 58.3593 64.1598L34.9479 88.6478C33.7111 89.9414 31.6935 89.9726 30.4195 88.718L5.4927 64.1712C4.85735 63.5456 4.49805 62.6801 4.49805 61.7753V8.05118C4.49805 6.21936 5.94159 4.73438 7.72228 4.73438ZM32.7888 11.397C31.2307 11.397 29.9676 12.6601 29.9676 14.2182V28.7272C29.9676 30.2853 31.2307 31.5484 32.7888 31.5484C34.347 31.5484 35.6101 30.2853 35.6101 28.7272V14.2182C35.6101 12.6601 34.347 11.397 32.7888 11.397Z" fill="#FFFFFF" fill-opacity="0.2"/>
        </svg>
      `,
      dPadDown: `
        <svg width="64" height="94" viewBox="0 0 64 94" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M33.5528 4.90824L36.1497 2.11761L61.0765 26.6644L58.2895 29.6593L33.3627 5.11256C32.0886 3.85792 30.0711 3.88922 28.8343 5.1828L5.42288 29.6708C4.82979 30.2912 4.49743 31.1264 4.49743 31.9965L4.49743 85.7794C4.49743 87.6112 5.94097 89.0962 7.72167 89.0962L56.0599 89.0962C57.8406 89.0962 59.2842 87.6112 59.2842 85.7794L59.2842 32.0553C59.2842 31.1505 58.9248 30.285 58.2895 29.6593L61.0765 26.6644C62.506 28.0721 63.3144 30.0195 63.3144 32.0553L63.3145 85.7794C63.3145 89.901 60.0665 93.2422 56.0599 93.2422L7.72167 93.2422C3.7151 93.2422 0.467136 89.901 0.467136 85.7794L0.467131 31.9965C0.467131 30.0388 1.21497 28.1595 2.54938 26.7637L5.3247 29.5715L2.54939 26.7637L25.9609 2.27565C28.7435 -0.634915 33.283 -0.705312 36.1497 2.1176L33.5528 4.90824Z" fill="#FFFFFF"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M56.059 89.0938L7.72072 89.0938C5.94002 89.0938 4.49648 87.6088 4.49648 85.777L4.49647 31.9941C4.49647 31.124 4.82884 30.2887 5.42192 29.6684L28.8334 5.18035C30.0701 3.88677 32.0877 3.85548 33.3618 5.11011L58.2885 29.6569C58.9239 30.2825 59.2832 31.1481 59.2832 32.0528L59.2832 85.7769C59.2832 87.6088 57.8397 89.0938 56.059 89.0938ZM30.9924 82.4312C32.5505 82.4312 33.8136 81.1681 33.8136 79.61L33.8136 65.1009C33.8136 63.5428 32.5505 62.2797 30.9924 62.2797C29.4343 62.2797 28.1712 63.5428 28.1712 65.1009L28.1712 79.61C28.1712 81.1681 29.4343 82.4312 30.9924 82.4312Z" fill="#FFFFFF" fill-opacity="0.2"/>
        </svg>
      `,
      dPadLeft: `
        <svg width="94" height="64" viewBox="0 0 94 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M88.4726 33.8165L91.2633 36.4134L66.7165 61.3401L63.7215 58.5532L88.2683 33.6264C89.5229 32.3523 89.4916 30.3347 88.1981 29.098L63.71 5.68655C63.0897 5.09347 62.2544 4.76111 61.3843 4.76111L7.60147 4.7611C5.76965 4.7611 4.28467 6.20464 4.28467 7.98534L4.28467 56.3236C4.28467 58.1043 5.76965 59.5478 7.60147 59.5478L61.3256 59.5478C62.2304 59.5478 63.0959 59.1885 63.7215 58.5532L66.7165 61.3401C65.3087 62.7697 63.3613 63.5781 61.3256 63.5781L7.60147 63.5781C3.47989 63.5781 0.138672 60.3302 0.138672 56.3236L0.138673 7.98534C0.138673 3.97878 3.47988 0.730808 7.60147 0.730808L61.3843 0.730809C63.3421 0.730809 65.2214 1.47865 66.6172 2.81306L63.8094 5.58838L66.6172 2.81307L91.1052 26.2245C94.0158 29.0071 94.0862 33.5467 91.2633 36.4134L88.4726 33.8165Z" fill="#FFFFFF"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.2832 56.3226L4.2832 7.98439C4.2832 6.20369 5.76819 4.76015 7.6 4.76015L61.3829 4.76015C62.253 4.76015 63.0882 5.09252 63.7086 5.6856L88.1966 29.0971C89.4902 30.3338 89.5215 32.3514 88.2668 33.6254L63.7201 58.5522C63.0944 59.1876 62.2289 59.5469 61.3241 59.5469L7.6 59.5469C5.76819 59.5469 4.2832 58.1033 4.2832 56.3226ZM10.9489 31.2592C10.9489 32.8173 12.212 34.0804 13.7701 34.0804L28.2792 34.0804C29.8373 34.0804 31.1004 32.8173 31.1004 31.2592C31.1004 29.7011 29.8373 28.438 28.2792 28.438L13.7701 28.438C12.212 28.438 10.9489 29.7011 10.9489 31.2592Z" fill="#FFFFFF" fill-opacity="0.2"/>
        </svg>
      `,
      dPadRight: `
        <svg width="94" height="64" viewBox="0 0 94 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.12894 30.4882L2.33831 27.8913L26.8851 2.96454L29.88 5.75151L5.33326 30.6783C4.07862 31.9524 4.10991 33.9699 5.4035 35.2067L29.8915 58.6181C30.5119 59.2112 31.3471 59.5436 32.2172 59.5436L86.0001 59.5436C87.8319 59.5436 89.3169 58.1 89.3169 56.3193L89.3169 7.9811C89.3169 6.2004 87.8319 4.75686 86.0001 4.75686L32.276 4.75686C31.3712 4.75686 30.5057 5.11616 29.88 5.75151L26.8851 2.96454C28.2928 1.535 30.2402 0.72656 32.276 0.72656L86.0001 0.726562C90.1217 0.726562 93.4629 3.97452 93.4629 7.9811L93.4629 56.3193C93.4629 60.3259 90.1217 63.5739 86.0001 63.5739L32.2172 63.5739C30.2595 63.5739 28.3802 62.826 26.9844 61.4916L29.7922 58.7163L26.9844 61.4916L2.49635 38.0801C-0.41422 35.2975 -0.484612 30.758 2.3383 27.8913L5.12894 30.4882Z" fill="#FFFFFF"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M89.3184 7.98205L89.3184 56.3203C89.3184 58.101 87.8334 59.5445 86.0016 59.5445L32.2187 59.5445C31.3486 59.5445 30.5133 59.2122 29.893 58.6191L5.40496 35.2076C4.11137 33.9709 4.08008 31.9533 5.33472 30.6792L29.8815 5.75247C30.5072 5.11712 31.3727 4.75781 32.2775 4.75781L86.0016 4.75781C87.8334 4.75781 89.3184 6.20135 89.3184 7.98205ZM82.6526 33.0455C82.6526 31.4873 81.3895 30.2243 79.8314 30.2243L65.3224 30.2242C63.7642 30.2242 62.5011 31.4873 62.5011 33.0455C62.5011 34.6036 63.7642 35.8667 65.3223 35.8667L79.8314 35.8667C81.3895 35.8667 82.6526 34.6036 82.6526 33.0455Z" fill="#FFFFFF" fill-opacity="0.2"/>
        </svg>
      `
    };

    return customSVGs[buttonName] || `
      <svg width="81" height="81" viewBox="0 0 81 81" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40.5" cy="40.5" r="37.5" fill="#FFFFFF" fill-opacity="0.2" stroke="#FFFFFF" stroke-width="3"/>
        <text x="40.5" y="50" text-anchor="middle" fill="#FFFFFF" font-size="20" font-family="Arial">${buttonName}</text>
      </svg>
    `;
  };

  // Don't render if not mobile or not visible
  if (!checkIfMobile() || !visible) {
    return null;
  }

  return (
    <div
      ref={buttonRef}
      className={`fixed pointer-events-auto select-none touch-none z-[9999] w-12 h-12 lg:w-[60px] lg:h-[60px] transition-opacity duration-100 ease-linear ${
        isPressed ? 'opacity-80' : 'opacity-100'
      }`}
      style={{
        left: `${x}vw`,
        bottom: `${y}vh`,
        transform: `scale(${Math.min(window.innerWidth / 2400, window.innerHeight / 1080) * 1.25})`,
        transformOrigin: 'center',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div
          className={`transition-transform duration-100 ease-linear drop-shadow-sm ${
            isPressed ? 'scale-95' : 'scale-100'
          } ${isPressed ? 'drop-shadow-lg brightness-125' : 'hover:drop-shadow-md'}`}
          dangerouslySetInnerHTML={{ __html: getSVGContent(svgName) }}
        />
      </div>
    </div>
  );
};