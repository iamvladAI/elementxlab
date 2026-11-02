'use client';
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const CollageMobile = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleCarouselScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const itemWidth = scrollContainerRef.current.scrollWidth / 6;
    const newIndex = Math.round(scrollLeft / itemWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < 6) {
      setActiveIndex(newIndex);
    }
  };

  const items = [
    { type: 'video', src: '/-P28vNB0ww8gJAHythAA_Dropshot.mp4' },
    { type: 'image', src: '/opt/carousel_4.webp' }, 
    { type: 'image', src: '/opt/carousel_2.webp' }, 
    { type: 'image', src: '/opt/carousel_3.webp' }, 
    { type: 'image', src: '/opt/carousel_1.webp' }, 
    { type: 'image', src: '/opt/carousel_5.webp' }, 
  ];

  return (
    <section className="w-full bg-white flex flex-col justify-start relative z-20 pb-2">
      
      <div 
        ref={scrollContainerRef}
        onScroll={handleCarouselScroll}
        className="w-full flex items-center overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar pl-6 md:pl-8 py-2"
      >
        <div className="flex gap-3 pr-6 h-full items-center">
          {items.map((item, idx) => (
            <div 
              key={idx}
              className="relative shrink-0 snap-center overflow-hidden bg-zinc-100 shadow-sm rounded-[24px]"
              style={{ width: '85vw', height: '70vh', maxWidth: '500px', maxHeight: '800px' }}
            >
              {item.type === 'video' ? (
                <video 
                  src={item.src} 
                  autoPlay loop muted playsInline
                  suppressHydrationWarning
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <img 
                  src={item.src} 
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                  alt={`Carousel ${idx}`} 
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Пагинация */}
      <div className="w-full flex justify-center items-center gap-2 mt-4">
        {items.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-7 bg-black' : 'w-2 bg-zinc-300'}`}
          />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
};
