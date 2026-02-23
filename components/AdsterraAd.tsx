
import React, { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  id: string;
  format?: 'banner' | 'social-bar' | 'popunder' | 'smartlink';
  width?: number;
  height?: number;
  className?: string;
  label?: string;
}

const AdsterraAd: React.FC<AdsterraAdProps> = ({ id, format = 'banner', width = 728, height = 90, className = "", label }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    if (format === 'popunder') {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//pl25838421.highperformanceformat.com/${id}/invoke.js`;
      document.body.appendChild(script);
      return;
    }

    if (!adRef.current) return;

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
      script2.src = `//www.highperformanceformat.com/invoke.js`;
      
      adRef.current.appendChild(script1);
      adRef.current.appendChild(script2);
    } else if (format === 'social-bar') {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//pl25838421.highperformanceformat.com/${id}/invoke.js`;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      adRef.current.appendChild(script);
    } else if (format === 'smartlink') {
      const link = document.createElement('a');
      link.href = `https://www.highperformanceformat.com/${id}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all inline-block';
      link.innerText = label || 'Click Here';
      adRef.current.appendChild(link);
    }
  }, [id, format, width, height, label]);

  if (format === 'popunder') return null;

  return (
    <div 
      ref={adRef} 
      className={`ad-container flex flex-col justify-center items-center overflow-hidden my-4 ${className}`}
      style={{ minHeight: format === 'smartlink' ? 'auto' : (height > 0 ? `${height}px` : 'auto') }}
    />
  );
};

export default AdsterraAd;
