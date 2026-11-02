'use client';
import React, { useEffect, useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

export default function AppleTestPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Количество кадров (картинок) в нашей анимации
  const frameCount = 147;
  
  // Мы используем публичные кадры AirPods Pro с сайта Apple для теста!
  // (На их месте потом могут быть 147 кадров твоего макбука или крема)
  const currentFrame = (index: number) => 
    `https://www.apple.com/105/media/us/airpods-pro/2019/1299e2f5_9206_4470_b28e_08307a42f19b/anim/sequence/large/01-hero-lightpass/${index.toString().padStart(4, '0')}.jpg`;

  // Подключаем хук скролла
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Превращаем процент скролла (от 0 до 1) в номер кадра (от 1 до 147)
  // Когда scrollYProgress = 0, frame = 1. Когда 1, frame = 147.
  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, frameCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Загружаем в память все 147 картинок, чтобы они отрисовывались моментально
    const images: HTMLImageElement[] = [];
    let loadedImages = 0;
    
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
      
      // Отрисуем первый кадр сразу, как только он загрузится
      if (i === 1) {
        img.onload = () => {
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }
    }

    // Слушаем изменение скролла и меняем картинку
    const unsubscribe = frameIndex.onChange((latestFrame) => {
      // Округляем до целого числа (кадры не бывают дробными)
      const currentImageIndex = Math.round(latestFrame) - 1;
      
      const img = images[currentImageIndex];
      // Если картинка уже загрузилась — рисуем её поверх канваса
      if (img && img.complete) {
        // Очищаем старый кадр
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Рисуем новый
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    });

    return () => unsubscribe();
  }, [frameIndex]);

  return (
    // Делаем контейнер длинным (300vh), чтобы было пространство для скролла
    <main ref={containerRef} className="w-full h-[300vh] bg-black">
      
      {/* Липкий блок (Sticky), который всегда держится на экране */}
      <div className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* Заголовок, который появляется по мере скролла */}
        <motion.h1 
          className="absolute top-10 text-white text-3xl font-bold z-10"
          style={{ opacity: scrollYProgress }}
        >
          Магия Apple: Скролл вниз 👇
        </motion.h1>

        {/* Тот самый холст (canvas), на котором мы как мультик быстро перерисовываем картинки */}
        <canvas 
          ref={canvasRef}
          width={1158} 
          height={770}
          className="max-w-full object-contain"
        />
        
      </div>
    </main>
  );
}
