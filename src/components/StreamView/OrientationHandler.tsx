import React, { useState, useEffect } from 'react';

interface OrientationHandlerProps {
  children: React.ReactNode;
  forceOrientation?: 'landscape' | 'portrait' | 'auto';
}

export const OrientationHandler: React.FC<OrientationHandlerProps> = ({ 
  children, 
  forceOrientation = 'auto' 
}) => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      const mobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
      
      setIsPortrait(portrait);
      setIsMobile(mobile);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Show rotation message for mobile portrait when landscape is forced
  if (isMobile && isPortrait && forceOrientation === 'landscape') {
    return (
      <div className="fixed inset-0 bg-[#313033] text-white flex flex-col justify-center items-center z-[1000] transform rotate-90 overflow-hidden">
        <h1 className="text-2xl mb-2 text-center">Please rotate your device</h1>
        <p>This game works best in landscape mode</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${isMobile && forceOrientation === 'landscape' ? 'landscape-layout' : ''}`}>
      {children}
    </div>
  );
};