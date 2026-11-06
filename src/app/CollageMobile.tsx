'use client';
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const CollageMobile = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = [
    { type: 'image', src: '/night in paris 1.jpeg' },
    { type: 'image', src: '/03.jpg' },
    { type: 'image', src: '/Копія _H98A4765.jpg' },
    { type: 'image', src: '/H98A4391.jpg' },
    { type: 'image', src: '/dsc08443.jpeg' },
    { type: 'image', src: '/Копія _H98A3905.jpg' },
    { type: 'image', src: '/DSC09787.jpeg' },
    { type: 'image', src: '/img5.jpg' },
    { type: 'image', src: '/h4.jpg' },
    { type: 'image', src: '/1_кокос БЕЗ ДАТИ.jpg' },
    { type: 'image', src: '/hydrasence_horizontal_1789481454129.jpg' },
    { type: 'image', src: '/DSC00868.jpeg' },
  ];

  const handleCarouselScroll = () => {
    if (!scrollContainerRef.current) return;
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const itemWidth = scrollContainerRef.current.scrollWidth / items.length;
    const newIndex = Math.round(scrollLeft / itemWidth);
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < items.length) {
      setActiveIndex(newIndex);
    }
  };

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
