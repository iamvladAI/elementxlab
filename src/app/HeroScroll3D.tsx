"use client";
import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import Link from 'next/link';

const HeroScroll3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  
  // Состояние: появился ли текст навсегда
  const [isTextRevealed, setIsTextRevealed] = useState(false);

  // Отслеживаем скролл внутри этого 300vh контейнера
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Привязываем индекс кадра (от 7 до 89, то есть начинаем с 8-го кадра) к прогрессу скролла
  const frameIndex = useTransform(scrollYProgress, [0, 1], [7, 89]);

  // ПУНКТ 1: Свет ездит влево-вправо, жестко привязан к скроллу
  const lightX = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

  useEffect(() => {
    // Предзагрузка 90 кадров
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= 90; i++) {
      const img = new Image();
      const frameNum = i.toString().padStart(4, '0');
      img.src = `/bottle_sequence/${frameNum}.png`;
      
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 90) {
          setImages(loadedImages);
          // Отрисовываем 8-й кадр (индекс 7) сразу после загрузки
          const ctx = canvasRef.current?.getContext('2d');
          if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(loadedImages[7], 0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      };
      loadedImages.push(img);
    }
  }, []);

  // Обновляем canvas при скролле и следим за появлением текста
  useMotionValueEvent(frameIndex, "change", (latest) => {
    // ПУНКТ 4 и 5: Если доскроллили до 34 кадра, навсегда показываем текст
    if (latest >= 34 && !isTextRevealed) {
      setIsTextRevealed(true);
    }

    if (images.length === 0 || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const index = Math.min(89, Math.max(0, Math.round(latest)));
    const img = images[index];
    
    if (img && img.complete) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  });

  return (
    <section ref={containerRef} className="relative w-full h-[300vh] bg-black z-0">
      
      {/* Залипший экран (прибит к монитору) */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        
        {/* ФОНОВЫЙ СВЕТ, привязанный к скроллу */}
        <motion.div 
          className="absolute top-0 left-0 w-[200%] h-full z-0 pointer-events-none"
          style={{ 
            x: lightX,
            background: "linear-gradient(90deg, #000000 0%, #000000 30%, #3a3a3a 50%, #000000 70%, #000000 100%)" 
          }}
        />

        {/* ХОЛСТ С БАНКОЙ */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center z-40 pointer-events-none">
          <canvas 
            ref={canvasRef} 
            width={1920} 
            height={1080} 
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Теневой градиент (z-15) */}
        <div className="absolute inset-0 bg-black/20 pointer-events-none z-15" />

        {/* Текст (z-20, чтобы быть под банкой, но над фоном) */}
        <main className="w-full max-w-[1150px] mx-auto px-6 md:px-8 relative z-20 flex items-center">
          {/* Текст медленно выезжает с самого низа экрана (100vh) */}
          <motion.div 
            className="w-full max-w-[700px] flex flex-col items-start gap-6 md:gap-8"
            initial={{ opacity: 0, y: "100vh" }}
            animate={isTextRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: "100vh" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col">
              <h1 className="text-[clamp(28px,3.5vw,42px)] font-bold leading-[1.1] tracking-tight text-white drop-shadow-lg whitespace-nowrap">
                Створіть косметику під своїм брендом
              </h1>
              {/* ПУНКТ 2: Серый текст уменьшен (text-[13px] md:text-[15px]), чтобы влезал в ширину заголовка */}
              <p className="text-[13px] md:text-[15px] mt-2 text-zinc-300 tracking-[0.01em] leading-relaxed drop-shadow-md whitespace-nowrap">
                Виробництво сертифікованих рецептур від технологів із десятилітнім досвідом
              </p>
            </div>
            
            {/* ПУНКТ 3: Кнопка по центру под текстом и чуть длиннее */}
            <Link href="/contact" className="self-center bg-white text-black px-6 py-4 rounded-full text-[16px] font-bold w-[280px] md:w-[340px] text-center hover:scale-105 active:scale-95 transition-transform duration-300 ease-out flex items-center justify-center h-[52px] md:h-[58px] shrink-0">
              Почати співпрацю
            </Link>
          </motion.div>
        </main>

      </div>
    </section>
  );
};

export default HeroScroll3D;
