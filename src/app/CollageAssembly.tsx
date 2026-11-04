'use client';
import React, { useState, useEffect, useRef } from 'react';

const SLIDE_IMAGES = [
  '/night in paris 1.jpeg',
  '/03.jpg',
  '/Копія _H98A4765.jpg',
  '/H98A4391.jpg',
  '/dsc08443.jpeg',
  '/Копія _H98A3905.jpg',
  '/DSC09787.jpeg',
  '/img5.jpg',
  '/h4.jpg',
  '/1_кокос БЕЗ ДАТИ.jpg',
  '/hydrasence_horizontal_1789481454129.jpg',
  '/DSC00868.jpeg',
];

export const CollageAssembly = () => {
  // trackIndex:
  // 0 = Клон Слайда 4 (слева для свайпа назад с 1 на 4)
  // 1..4 = Слайды 1..4
  // 5 = Клон Слайда 1 (справа для свайпа вперед с 4 на 1)
  const [trackIndex, setTrackIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const swipeLockRef = useRef(false);
  const wheelSilenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeTimeRef = useRef(0);
  const pointerStartXRef = useRef<number | null>(null);

  // Предварительно декодируем все 12 фото в память видеокарты, чтобы не было рывков
  useEffect(() => {
    SLIDE_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
      if (img.decode) {
        img.decode().catch(() => {});
      }
    });
  }, []);

  // После мгновенного сброса с клона (5 -> 1 или 0 -> 4) возвращаем плавную анимацию на следующем кадре
  useEffect(() => {
    if ((trackIndex === 1 || trackIndex === 4) && !isTransitioning) {
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
        return () => cancelAnimationFrame(raf2);
      });
      return () => cancelAnimationFrame(raf1);
    }
  }, [trackIndex, isTransitioning]);

  const activeDot = ((trackIndex - 1) % 4 + 4) % 4;

  const handleNext = () => {
    setTrackIndex((prev) => {
      if (prev >= 5) {
        setIsTransitioning(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsTransitioning(true);
            setTrackIndex(2);
          });
        });
        return 1;
      }
      setIsTransitioning(true);
      return prev + 1;
    });
  };

  const handlePrev = () => {
    setTrackIndex((prev) => {
      if (prev <= 0) {
        setIsTransitioning(false);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsTransitioning(true);
            setTrackIndex(3);
          });
        });
        return 4;
      }
      setIsTransitioning(true);
      return prev - 1;
    });
  };

  const handleDotClick = (idx: number) => {
    if (idx === activeDot) return;
    // Переход с 4-го на 1-й вперед по кругу
    if (trackIndex === 4 && idx === 0) {
      setIsTransitioning(true);
      setTrackIndex(5);
      return;
    }
    // Переход с 1-го на 4-й назад по кругу
    if (trackIndex === 1 && idx === 3) {
      setIsTransitioning(true);
      setTrackIndex(0);
      return;
    }
    if (trackIndex === 5) {
      setIsTransitioning(false);
      setTrackIndex(1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
          setTrackIndex(idx + 1);
        });
      });
      return;
    }
    if (trackIndex === 0) {
      setIsTransitioning(false);
      setTrackIndex(4);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
          setTrackIndex(idx + 1);
        });
      });
      return;
    }
    setIsTransitioning(true);
    setTrackIndex(idx + 1);
  };

  // Строго 1 свайп по тачпаду = 1 прокрут карусели (гасим всю инерцию макбука)
  const handleWheel = (e: React.WheelEvent<HTMLElement>) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    if (Math.abs(e.deltaX) < 18) return;

    if (wheelSilenceTimerRef.current) {
      clearTimeout(wheelSilenceTimerRef.current);
    }
    wheelSilenceTimerRef.current = setTimeout(() => {
      swipeLockRef.current = false;
    }, 180);

    const now = Date.now();
    if (swipeLockRef.current || now - swipeTimeRef.current < 1100) {
      return;
    }

    swipeLockRef.current = true;
    swipeTimeRef.current = now;

    if (e.deltaX > 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    pointerStartXRef.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (pointerStartXRef.current === null) return;
    const dx = e.clientX - pointerStartXRef.current;
    pointerStartXRef.current = null;

    if (Math.abs(dx) < 50) return;
    const now = Date.now();
    if (now - swipeTimeRef.current < 900) return;
    swipeTimeRef.current = now;

    if (dx < 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  const translateX = `-${(trackIndex * 100) / 6}%`;

  return (
    <section
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: 'pan-y' }}
      className="w-full h-screen relative z-0 bg-white select-none"
    >
      {/* Изолированный слой с фото-лентой */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ contain: 'layout paint' }}
      >
        <div
          onTransitionEnd={() => {
            if (trackIndex === 5) {
              setIsTransitioning(false);
              setTrackIndex(1);
            } else if (trackIndex === 0) {
              setIsTransitioning(false);
              setTrackIndex(4);
            }
          }}
          style={{
            transform: `translate3d(${translateX}, 0, 0)`,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className={`w-[600%] h-full grid grid-cols-[repeat(18,minmax(0,1fr))] gap-0 p-0 will-change-transform ${
            isTransitioning
              ? 'transition-transform duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)]'
              : 'transition-none'
          }`}
        >
          {/* Клон Слайда 4 слева (для бесшовного свайпа назад с 1 на 4) */}
          <div className="w-full h-full overflow-hidden">
            <img src="/1_кокос БЕЗ ДАТИ.jpg" alt="Product 10" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img src="/hydrasence_horizontal_1789481454129.jpg" alt="Product 11" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img src="/DSC00868.jpeg" alt="Product 12" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>

          {/* Слайд 1: первые 3 фото */}
          <div className="w-full h-full overflow-hidden">
            <img src="/night in paris 1.jpeg" alt="Mermade Night in Paris" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img src="/03.jpg" alt="Hydrasence 16 in 1" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img src="/Копія _H98A4765.jpg" alt="Hydrasence Hair Peeling" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>

          {/* Слайд 2: вторые 3 фото */}
          <div className="w-full h-full overflow-hidden">
            <img src="/H98A4391.jpg" alt="Product 4" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img src="/dsc08443.jpeg" alt="Product 5" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img src="/Копія _H98A3905.jpg" alt="Product 6" draggable={false} loading="eager" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>

          {/* Слайд 3: третьи 3 фото */}
          <div className="w-full h-full overflow-hidden">
            <img src="/DSC09787.jpeg" alt="Product 9" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img src="/img5.jpg" alt="Product 8" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img src="/h4.jpg" alt="Product 7" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>

          {/* Слайд 4: четвертые 3 фото */}
          <div className="w-full h-full overflow-hidden">
            <img src="/1_кокос БЕЗ ДАТИ.jpg" alt="Product 10" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img src="/hydrasence_horizontal_1789481454129.jpg" alt="Product 11" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img src="/DSC00868.jpeg" alt="Product 12" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>

          {/* Клон Слайда 1 справа (для бесшовной прокрутки по кругу с 4 на 1) */}
          <div className="w-full h-full overflow-hidden">
            <img src="/night in paris 1.jpeg" alt="Mermade Night in Paris" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img src="/03.jpg" alt="Hydrasence 16 in 1" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
          <div className="w-full h-full overflow-hidden">
            <img src="/Копія _H98A4765.jpg" alt="Hydrasence Hair Peeling" draggable={false} loading="lazy" decoding="async" className="w-full h-full object-cover transform-gpu" />
          </div>
        </div>
      </div>

      {/* Индикатор-переключатель карусели снизу (в стиле UNICO: белая капсула и точки без серой подложки) */}
      <div className="relative w-full h-full flex flex-col items-center pt-[12vh] pb-6 z-20 pointer-events-none">
        <div className="mt-auto sticky bottom-6 pointer-events-auto select-none">
          <div
            onClick={handleNext}
            className="px-3 py-2 flex items-center justify-center gap-3 cursor-pointer"
          >
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Slide ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDotClick(idx);
                }}
                className={`h-[10px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer shadow-[0_1px_6px_rgba(0,0,0,0.2)] ${
                  activeDot === idx
                    ? 'w-[34px] bg-white'
                    : 'w-[10px] bg-white/65 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
