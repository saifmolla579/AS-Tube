
import React, { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  id: string;
  format?: 'banner' | 'social-bar' | 'popunder';
  width?: number;
  height?: number;
  className?: string;
}

const AdsterraAd: React.FC<AdsterraAdProps> = ({ id, format = 'banner', width = 728, height = 90, className = "" }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current || !id) return;

    // Clear previous content
    adRef.current.innerHTML = '';

    if (format === 'banner') {
      const script1 = document.createElement('script');
      script1.type = 'text/javascript';
      script1.innerHTML = `
        atOptions = {
          'key' : '${id}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;
      
      const script2 = document.createElement('script');
      script2.type = 'text/javascript';
      script2.src = `//www.highperformanceformat.com/${id}/invoke.js`;
      
      adRef.current.appendChild(script1);
      adRef.current.appendChild(script2);
    } else if (format === 'social-bar') {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//pl25838421.highperformanceformat.com/${id}/invoke.js`;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      adRef.current.appendChild(script);
    }
  }, [id, format, width, height]);

  return (
    <div 
      ref={adRef} 
      className={`ad-container flex justify-center items-center overflow-hidden my-4 ${className}`}
      style={{ minHeight: height > 0 ? `${height}px` : 'auto' }}
    />
  );
};

export default AdsterraAd;
