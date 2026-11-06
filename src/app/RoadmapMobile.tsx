"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue, useMotionValueEvent } from "framer-motion";

const roadmapStages = [
  { num: "01", title: "Формування ТЗ", desc: "Аналіз потреб, створення та затвердження зразка" },
  { num: "02", title: "Підписання договору", desc: "Оформлення у \"Вчасно\" або у паперовому вигляді" },
  { num: "03", title: "Оплата", desc: "Виставлення рахунку, передплата 70% вартості" },
  { num: "04", title: "Розробка дизайну", desc: "Виконання нашим або вашим дизайнером" },
  { num: "05", title: "Закупівля", desc: "Друк поліграфії та закупівля комплектуючих" },
  { num: "06", title: "Виготовлення", desc: "Фасування, етикування та відвантаження замовлення" }
];

export const RoadmapMobile = ({ blackBlockRef, phaseOffset }: { blackBlockRef: React.RefObject<HTMLDivElement>, phaseOffset: number }) => {
  
  // НАЧИНАЕМ ОТСЛЕЖИВАТЬ СКРОЛЛ РАНЬШЕ!
  const { scrollYProgress } = useScroll({
    target: blackBlockRef,
    offset: ["start 100%", "end end"] 
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001
  });

  // Завершаем прокрутку всех 6 этапов к 86% высоты секции, чтобы на последних 14%
  // 06 «Виготовлення» уже спокойно стоял на месте перед появлением блока Сертификации GMP.
  const stageProgress = useTransform(smoothProgress, [0, 0.86], [0, 1.08]);

  const [activeStep, setActiveStep] = useState(-1);

  useMotionValueEvent(stageProgress, "change", (p) => {
    let current = -1;
    for (let i = 0; i < roadmapStages.length; i++) {
      const center = 1 / 3 + i * (2 / 15);
      // Считаем пункт "достигнутым", когда скролл дошел до его пика (с небольшой погрешностью)
      if (p >= center - 0.03) {
        current = i;
      }
    }
    if (current !== activeStep) {
      setActiveStep(current);
    }
  });

  // Заголовок ждет, пока черный блок полностью доедет до верха экрана
  const pinPoint = 1 / 3;

  const headingY = useTransform(stageProgress, (p) => {
     if (p <= pinPoint) return 0; 
     const diff = p - pinPoint;
     return -diff * 1200; 
  });

  const headingOpacity = useTransform(stageProgress, (p) => {
     // Изначально заголовок прозрачный
     if (p < 0.11) return 0;
     
     // Плавно проявляется ТОЛЬКО когда "Наші бренди" уже ушло за верхний край (p от 0.11 до 0.14)
     if (p >= 0.11 && p < 0.14) {
       return (p - 0.11) / 0.03;
     }

     // Остается видимым до pinPoint
     if (p >= 0.14 && p <= pinPoint) return 1;

     // Плавно затухает после pinPoint
     const diff = p - pinPoint;
     if (diff > 0.15) return 0;
     return 1 - (diff / 0.15);
  });



  // Переменная для быстрого переключения (меняем на false, чтобы вернуть черную тему)
  const isLightMode = true;

  return (
    <section className="w-full pt-8 overflow-x-clip">

      {/* Липкий заголовок */}
      <motion.div 
        style={{ y: headingY, opacity: headingOpacity }}
        className="w-full max-w-[1150px] mx-auto px-6 md:px-8 sticky top-[90px] z-[100] text-left mix-blend-difference pointer-events-none flex items-center h-12"
      >
        <h2 className="text-[clamp(28px,3vw,36px)] font-bold tracking-tight text-white leading-none m-0">
          Етапи співпраці
        </h2>
      </motion.div>

      {/* Фон секции */}
      <div ref={blackBlockRef} className={`w-full -mt-[48px] ${isLightMode ? 'bg-white' : 'bg-black'} h-[300vh] relative`}>
        
        {/* Залипающий экран внутри секции: высота 62vh с overflow-visible, чтобы следующий блок шел сразу под 06 этапом без рывков */}
        <div className="sticky top-0 w-full h-[62vh] md:h-screen overflow-visible">

           
           {/* ЧАСТЬ 2: ФОНОВЫЕ ВОЛНЫ (Замороженные на черном фоне) */}
           <div className={`absolute inset-0 left-[-30px] md:left-[-50px] lg:left-[-70px] w-[350px] pointer-events-none z-[50] ${isLightMode ? '' : 'mix-blend-difference'} hidden md:block`}>
             <svg 
               style={{ top: `-${phaseOffset}px`, height: `${phaseOffset + 2000}px` }}
               className="absolute w-full overflow-visible" 
               fill="none" 
               xmlns="http://www.w3.org/2000/svg"
             >
               <defs>
                 <pattern id="wavePattern2" width="400" height="900" patternUnits="userSpaceOnUse">
                   <g stroke={isLightMode ? "black" : "white"} strokeWidth="2">
                     <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(0, 0)" />
                     <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(25, 0)" />
                     <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(50, 0)" />
                     <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(75, 0)" />
                     <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(100, 0)" />
                     <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(125, 0)" />
                   </g>
                 </pattern>
               </defs>
               <rect width="100%" height="100%" fill="url(#wavePattern2)" />
             </svg>
           </div>

           <div className="w-full max-w-[1150px] mx-auto px-6 md:px-8 relative h-full z-10 flex">
              {roadmapStages.map((stage, idx) => (
                 <StageNode 
                   key={stage.num} 
                   stage={stage} 
                   index={idx}
                   progress={stageProgress} 
                 />
              ))}
           </div>

           {/* Фейковый белый блок удален по просьбе пользователя, чтобы не было дыры */}

           {/* ЦИФЕРБЛАТ */}
           <Dial activeStep={activeStep} progress={smoothProgress} />

        </div>

      </div>

    </section>
  );
};

const StageNode = ({ 
  stage, 
  index,
  progress 
}: { 
  stage: any, 
  index: number,
  progress: MotionValue<number>
}) => {
  // Центр для первого пункта ровно 1/3. 
  // Шаг 2/15 означает, что 6-й пункт достигнет максимума (center = 1.0) ровно когда блок начнет отлипать.
  // Это возвращает 100% непрозрачность и белый текст 6-му пункту.
  const center = 1 / 3 + index * (2 / 15);
  const isLastStage = index === roadmapStages.length - 1;

  // Движение по оси Y (последний 6-й этап фиксируется в центре и не улетает вверх при скролле дальше)
  const y = useTransform(progress, (p) => {
    const effectiveP = isLastStage ? Math.min(p, center) : p;
    const diff = effectiveP - center;
    return -diff * 1200; 
  });

  // Переменная для быстрого переключения Светлой/Темной темы (меняем на false, чтобы вернуть как было)
  const isLightMode = true;

  // Базовый серый пункт
  const opacity = useTransform(progress, (p) => {
    const effectiveP = isLastStage ? Math.min(p, center) : p;
    const diff = Math.abs(effectiveP - center);
    if (diff > 0.20) return 0; 
    if (diff > 0.15) return 1 - ((diff - 0.15) / 0.05); 
    return 1;
  });

  // Активный текст 
  const activeOpacity = useTransform(progress, (p) => {
    const effectiveP = isLastStage ? Math.min(p, center) : p;
    const diff = Math.abs(effectiveP - center);
    if (diff > 0.12) return 0; 
    return 1 - (diff / 0.12);
  });

  // Описание (справа)
  const descOpacity = useTransform(progress, (p) => {
    const effectiveP = isLastStage ? Math.min(p, center) : p;
    const diff = Math.abs(effectiveP - center);
    if (diff <= 0.08) return 1; 
    if (diff > 0.15) return 0;
    return 1 - ((diff - 0.08) / 0.07);
  });

  return (
    <motion.div 
      style={{ y, opacity }}
      className="absolute top-[64%] md:top-1/2 left-0 right-0 px-6 md:px-8 w-full"
    >
      <div className="-translate-y-1/2 flex flex-col md:flex-row items-start md:items-center justify-start gap-4 md:gap-12 w-full">
        
        {/* Обертка для заголовка */}
        <div className="relative flex items-center shrink-0 min-w-[280px] md:min-w-[400px]">
          
          {/* Базовый неактивный текст */}
          <div className={`flex items-center gap-4 ${isLightMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
            <span className="text-2xl md:text-4xl font-bold">{stage.num}</span>
            <h3 className="text-2xl md:text-4xl font-bold whitespace-nowrap">
              {stage.title}
            </h3>
          </div>

          {/* Активный текст */}
          <motion.div 
            style={{ opacity: activeOpacity }}
            className={`absolute inset-0 flex items-center gap-4 ${isLightMode ? 'text-black' : 'text-white'}`}
          >
            <span className="text-2xl md:text-4xl font-bold">{stage.num}</span>
            <h3 className="text-2xl md:text-4xl font-bold whitespace-nowrap">
              {stage.title}
            </h3>
          </motion.div>

        </div>

        {/* Описание */}
        <motion.p 
          style={{ opacity: descOpacity }}
          className={`${isLightMode ? 'text-zinc-600' : 'text-zinc-400'} text-sm md:text-lg max-w-[400px] leading-snug m-0`}
        >
          {stage.desc}
        </motion.p>
      </div>
    </motion.div>
  );
};

const Tick = ({ index, litLevel }: { index: number, litLevel: MotionValue<number> }) => {
  const rotate = index * 6;
  // Когда litLevel проходит через индекс этой палочки, она моментально загорается.
  // Это создает эффект непрерывной "заливки" независимо от скорости скролла.
  const tickColor = useTransform(litLevel, [index, index + 1], ["#e4e4e7", "#000000"]);
  
  return (
    <div 
      className="absolute left-1/2 top-0 w-[2.5px] origin-[center_80px] -ml-[1.25px]"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <motion.div 
        style={{ backgroundColor: tickColor }}
        className="w-full h-[12px] rounded-full"
      />
    </div>
  );
};

const Dial = ({ activeStep, progress }: { activeStep: number, progress: MotionValue<number> }) => {
  // Круг начнет плавно появляться из прозрачности
  const dialOpacity = useTransform(progress, [0.15, 0.25], [0, 1]);
  
  const targetTicks = activeStep >= 0 ? (activeStep + 1) * 10 : 0;
  
  // Создаем "уровень жидкости" от 0 до 60 палочек.
  // stiffness и damping задают скорость и плавность заливки.
  const litLevel = useSpring(targetTicks, { stiffness: 80, damping: 15 });

  useEffect(() => {
    litLevel.set(targetTicks);
  }, [targetTicks, litLevel]);

  return (
    <motion.div 
      style={{ opacity: dialOpacity }}
      className="hidden"
    >
      
      {/* ИКОНКА В ЦЕНТРЕ */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {activeStep >= 0 && (
          <motion.img
            key={activeStep}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            src={`/step${activeStep + 1}.svg`}
            alt="Step Icon"
            className="w-12 h-12"
            style={{ filter: activeStep === 1 || activeStep === 3 ? 'none' : 'brightness(0)' }}
          />
        )}
      </div>

      {/* ПАЛОЧКИ */}
      {[...Array(60)].map((_, i) => (
        <Tick key={i} index={i} litLevel={litLevel} />
      ))}
    </motion.div>
  );
};
