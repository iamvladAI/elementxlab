"use client";
import Link from 'next/link';
import HeroImageSequence from './HeroImageSequence';

// ПЕРЕКЛЮЧАТЕЛЬ ЗАСТАВКИ: "photo" — статичное фото (/0005.png) | "video" — анимация 200 кадров (/scene_first)
const HERO_MODE: "photo" | "video" = "photo";

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView, animate, useAnimation, useSpring, useMotionValueEvent } from 'framer-motion';

const ScrollRevealText = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 55%"] 
  });

  const color1 = useTransform(scrollYProgress, [0, 0.33], ["#d4d4d8", "#000000"]);
  const color2 = useTransform(scrollYProgress, [0.33, 0.66], ["#d4d4d8", "#000000"]);
  const color3 = useTransform(scrollYProgress, [0.66, 1], ["#d4d4d8", "#000000"]);

  return (
    <div ref={containerRef} className="text-[20px] md:text-[22px] font-bold tracking-tight leading-[1.3] w-full text-zinc-300">
      <motion.span style={{ color: color1 }}>
        Ринок beauty-індустрії оцінюється у $140 мільярдів.{" "}
      </motion.span>
      <motion.span style={{ color: color2 }}>
        Отримайте свою частку разом з Element X Lab{" "}
      </motion.span>
      <motion.span style={{ color: color3 }}>
        — найпростішим способом запустити власний бренд.
      </motion.span>
    </div>
  );
};

const AnimatedCounter = ({ from, to, duration }: { from: number, to: number, duration: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: false, margin: "0px" });

  useEffect(() => {
    if (!inView) {
      if (nodeRef.current) nodeRef.current.textContent = from.toString();
      return;
    }
    const controls = animate(from, to, {
      duration: duration,
      ease: "easeOut",
      onUpdate(value) {
        if (nodeRef.current) {
          nodeRef.current.textContent = Math.round(value).toString();
        }
      },
    });
    return () => controls.stop();
  }, [from, to, duration, inView]);

  return <span ref={nodeRef}>{from}</span>;
};

const WipeText = ({ text }: { text: string }) => {
  return (
    <motion.span
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      whileInView={{ clipPath: "inset(0 0% 0 0)" }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 1.2, ease: "easeInOut", delay: 0.1 }}
      style={{ display: "inline-block", whiteSpace: "nowrap" }}
    >
      {text}
    </motion.span>
  );
};

const IN_VIEW_TRANSITION: any = { duration: 1.2, ease: [0.16, 1, 0.3, 1] };

// Данные для интерактивных баночек и позиций списков
const FORMULA_CATEGORIES = [
  {
    id: 'face',
    title: 'Для обличчя',
    img: '/face.png',
    x: '-22vw', // Top-Left
    y: '-37vh',
    initialX: '-50vw',
    initialY: '-40vh',
    rotate: -10,
    imgScale: 'scale-110',
    listX: '22vw', // СТРОГО В ПРАВОЙ ПОЛОВИНЕ (симметрично баночке)
    listY: '-25vh', // Спустил чуть ниже (-25vh вместо -35vh), чтобы длинный список не бил в заголовок!
    items: ['Гідрогелеві патчі', 'Сироватки', 'Гідрофільна олія', 'Креми', 'Гелі для вмивання', 'Маски', 'Зволожуючі місти', 'Тонери', 'Блиски', 'Тінти']
  },
  {
    id: 'parfume',
    title: 'Парфуми',
    img: '/parfume.png',
    x: '22vw', // Top-Right
    y: '-37vh',
    initialX: '50vw',
    initialY: '-40vh',
    rotate: 10,
    imgScale: 'scale-90',
    listX: '-22vw', // СТРОГО В ЛЕВОЙ ПОЛОВИНЕ
    listY: '-34vh', // ПОДНЯЛ ВЫШЕ, чтобы было ровно напротив, а не по диагонали
    items: ['Парфуми', 'Парфумовані місти для тіла', 'Тверді парфуми', 'Рум-спреї', 'Аромадифузори для дому', 'Ароматизатори']
  },
  {
    id: 'hair',
    title: 'Для волосся',
    img: '/hair.png',
    x: '-22vw', // Bottom-Left
    y: '-7vh',
    initialX: '-50vw',
    initialY: '-10vh',
    rotate: -5,
    imgScale: 'scale-100',
    listX: '22vw', // СТРОГО В ПРАВОЙ ПОЛОВИНЕ
    listY: '-10vh', // СТРОГО НАПРОТИВ (на уровне -7vh / -10vh)
    items: ['Шампуні', 'Бальзами', 'Маски', 'Сироватки', 'Термозахист', 'Пілінги', 'Сухі шампуні', 'Олії']
  },
  {
    id: 'body',
    title: 'Для тіла',
    img: '/body.png',
    x: '22vw', // Bottom-Right
    y: '-7vh',
    initialX: '50vw',
    initialY: '-10vh',
    rotate: 5,
    imgScale: 'scale-100',
    listX: '-22vw', // СТРОГО В ЛЕВОЙ ПОЛОВИНЕ
    listY: '-10vh', // СТРОГО НАПРОТИВ
    items: ['Гелі для душу', 'Скраби', 'Лосьйони', 'Батери', 'Олії для тіла', 'Креми для рук', 'Антицелюлітні', 'Сіль для ванн']
  }
];

// Массив легких наклонов для органичного "раскидывания", без сдвига координат (чтобы не было наслоений)
const ROTATIONS = [-2, 3, -1, 2, -3, 1, 4, -2, -1, 3, 2, -3];

export default function Home() {
  const videoRef = useRef<HTMLDivElement>(null!);
  const roadmapRef = useRef<HTMLDivElement>(null!); // Это будет указывать на черный блок в RoadmapAssembly
  
  const [activeId, setActiveId] = useState<string | null>(null);


  const [isFlownIn, setIsFlownIn] = useState(false);
  const flightTimeout = useRef<any>(null);

  const [blackBlockY, setBlackBlockY] = useState(100000);
  const [phaseOffset, setPhaseOffset] = useState(0);
  const [phaseOffset3, setPhaseOffset3] = useState(0);
  const [isHoveringBrand, setIsHoveringBrand] = useState(false);
  const [hoveredBrandIdx, setHoveredBrandIdx] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      if (roadmapRef.current) {
        // Абсолютная позиция черного блока
        const rect1 = roadmapRef.current.getBoundingClientRect();
        const absoluteY1 = rect1.top + window.scrollY;
        const vh = window.innerHeight;
        
        setBlackBlockY(absoluteY1);
        setPhaseOffset(absoluteY1);
        
        // Смещение волн белого фона теперь = (absoluteY1 + vh) % 900
        // Наш фейковый белый блок съедает 25vh черного экрана, но он находится ВНУТРИ липкого контейнера (100vh).
        // Значит, настоящий белый блок начинается ровно на отметке окончания липкого контейнера!
        // Волны идеально состыкуются пиксель в пиксель.
        setPhaseOffset3((absoluteY1 + vh) % 900);
      }
    };
    
    const tId = setTimeout(measure, 300);
    window.addEventListener('resize', measure);
    
    let observer: ResizeObserver | null = null;
    if (typeof window !== 'undefined') {
      observer = new ResizeObserver(() => {
        measure();
      });
      observer.observe(document.body);
    }

    return () => {
      clearTimeout(tId);
      window.removeEventListener('resize', measure);
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[200vh] bg-white text-zinc-900 font-sans relative w-full">
      
      
      {/* ЧАСТЬ 1: ФОНОВЫЕ ВОЛНЫ СЛЕВА (Скролляться на белом фоне) */}
      <div 
        className="absolute inset-0 left-[-30px] md:left-[-50px] lg:left-[-70px] w-[350px] pointer-events-none z-40 mix-blend-difference hidden md:block"
        style={{ 
          clipPath: `polygon(0 0, 100% 0, 100% ${blackBlockY}px, 0 ${blackBlockY}px)`
        }}
      >
        <svg className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wavePattern" width="400" height="900" patternUnits="userSpaceOnUse">
              <g stroke="white" strokeWidth="2">
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(0, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(25, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(50, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(75, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(100, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(125, 0)" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wavePattern)" />
        </svg>
      </div>


      
      {/* 1. ГЛОБАЛЬНЫЙ ЛЕТАЮЩИЙ ЛОГОТИП */}
      <div className="fixed top-10 z-[100] left-4 md:left-4 xl:left-6 h-12 w-fit flex items-center mix-blend-difference text-white pointer-events-auto">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={IN_VIEW_TRANSITION}
        >
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              const start = window.scrollY;
              const startTime = performance.now();
              
              document.body.classList.add('is-scrolling-top');
              
              setTimeout(() => {
                const start = window.scrollY;
                const speedPxPerSecond = 4000;
                const duration = Math.max(800, (start / speedPxPerSecond) * 1000);
                const startTime = performance.now();
                
                const scroll = (currentTime: number) => {
                  const elapsed = currentTime - startTime;
                  const progress = Math.min(elapsed / duration, 1);
                  
                  window.scrollTo(0, start * (1 - progress));
                  
                  if (progress < 1) {
                    requestAnimationFrame(scroll);
                  } else {
                    document.body.classList.remove('is-scrolling-top');
                  }
                };
                
                requestAnimationFrame(scroll);
              }, 10);
            }}
            className="hover:scale-105 transition-transform duration-300 block"
          >
            <svg viewBox="46 128 208 28" className="h-[22px] w-auto" fill="white" stroke="white" strokeWidth="0.9" strokeLinejoin="round">
              <polygon points="46.9 138.9 46.9 154.1 61.9 154.1 61.9 151.83 49.7 151.83 49.7 147.5 61.3 147.5 61.3 145.3 49.63 145.3 49.63 141.1 61.63 141.1 61.63 138.83 46.9 138.9"/>
              <polygon points="65.43 139.03 65.43 154.17 79.77 154.17 79.77 151.77 68.17 151.77 68.17 139.03 65.43 139.03"/>
              <polygon points="83.42 138.9 83.42 154.1 98.42 154.1 98.42 151.83 86.22 151.83 86.22 147.5 97.82 147.5 97.82 145.3 86.15 145.3 86.15 141.1 98.15 141.1 98.15 138.83 83.42 138.9"/>
              <polyline points="101.83 154.27 101.83 138.83 106.03 138.83 111.47 149.97 117.53 138.83 121.6 138.83 121.6 154.27 118.83 154.27 118.83 143.97 117.9 143.97 112.77 154.27 110.57 154.27 105.43 144.07 104.5 144.07 104.5 154.27 101.83 154.27"/>
              <polygon points="125.67 138.9 125.67 154.1 140.67 154.1 140.67 151.83 128.47 151.83 128.47 147.5 140.07 147.5 140.07 145.3 128.4 145.3 128.4 141.1 140.4 141.1 140.4 138.83 125.67 138.9"/>
              <polygon points="144.17 154.1 144.17 138.83 148.2 138.83 157.13 150.47 158.1 150.5 158.1 138.83 160.5 138.83 160.5 154.1 156.63 154.1 147.7 142.57 146.7 142.57 146.7 154.1 144.17 154.1"/>
              <polygon points="163.9 138.83 163.9 141.27 170.6 141.27 170.6 154.1 173.8 154.1 173.8 141.12 180.8 141.12 180.8 138.83 163.9 138.83"/>
              <polygon points="190.95 138.87 194.95 138.87 198.95 144.02 199.65 144.02 204.05 138.87 207.55 138.87 201.25 145.77 201.25 146.67 207.95 154.07 204.85 154.07 199.95 148.57 199.03 148.57 194.07 154.13 190.5 154.13 197.88 146.62 197.88 145.72 190.95 138.87"/>
              <rect x="214.9" y="129.2" width="38.4" height="17.13" rx="4.68" />
              <g fill="black" stroke="black" strokeWidth="0.75" strokeLinejoin="round">
                <polygon points="220.4 134.17 220.4 141.33 227.47 141.33 227.47 140.23 221.83 140.23 221.83 134.17 220.4 134.17"/>
                <polygon points="229.37 141.33 233.4 134.17 235.33 134.17 239.2 141.33 237.5 141.33 236.77 139.73 231.87 139.73 231.07 141.33 229.37 141.33"/>
                <path d="M241.3,134.17v7.16h6.9a.68.68,0,0,0,.39-.11,2.79,2.79,0,0,0,1.14-1.45c.34-1.07-1.2-2-1.2-2l0-.45a1.76,1.76,0,0,0,1.1-1.1c.23-.63-.37-1.38-.75-1.77a.9.9,0,0,0-.64-.26Z"/>
              </g>
              <g fill="white" stroke="white" strokeWidth="0.75">
                <path d="M247.65,135.88a.78.78,0,0,0-.66-.74v0h-3.84v1.53H247v0A.76.76,0,0,0,247.65,135.88Z"/>
                <path d="M247.65,139.18a.77.77,0,0,0-.66-.74v0h-3.84V140H247v0A.78.78,0,0,0,247.65,139.18Z"/>
                <polygon points="234.1 135.88 232.82 138.67 235.93 138.67 234.57 135.88 234.1 135.88"/>
              </g>
            </svg>
          </a>
        </motion.div>
      </div>

      {/* TRACK 1: Видео и Главный Текст */}
      <div className="relative w-full h-[100vh] bg-black flex flex-col justify-end pb-8 overflow-hidden">
        <div ref={videoRef} className="absolute inset-0 w-full h-full z-0 bg-black">
          {HERO_MODE === "video" ? (
            <HeroImageSequence totalFrames={200} fps={30} folder="/scene_first" />
          ) : (
            <img
              src="/0005.png"
              alt="Element X Lab"
              className="w-full h-full object-cover object-center select-none pointer-events-none"
            />
          )}
          {/* Теневой градиент снизу, чтобы белый текст всегда хорошо читался */}
          <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
        </div>

        <main className="w-full max-w-[1150px] mx-auto px-5 relative z-30 mb-4">
          <motion.div 
            className="w-full flex flex-col gap-6 px-4"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={IN_VIEW_TRANSITION}
          >
            <div className="flex flex-col">
              <h1 className="text-[26px] sm:text-[32px] font-bold leading-[1.15] tracking-tight text-white drop-shadow-lg break-words w-full">
                Створіть косметику<br />під своїм брендом
              </h1>
              <p className="text-[14px] sm:text-[16px] mt-2 text-zinc-300 tracking-[0.01em] leading-relaxed drop-shadow-md pr-4">
                Виробництво сертифікованих рецептур від технологів із десятилітнім досвідом
              </p>
            </div>
            
            <Link href="/contact" className="bg-white text-black w-full max-w-[280px] rounded-full text-[15px] font-bold text-center hover:scale-105 active:scale-95 transition-transform duration-300 ease-out flex items-center justify-center h-[44px] self-start mt-2">
              Почати співпрацю
            </Link>
          </motion.div>
        </main>
      </div>

      {/* 4. АНИМИРОВАННЫЙ ТЕКСТ-ВОЛНА */}
      <section className="max-w-[1150px] mx-auto px-6 md:px-8 mt-6 pb-7">
        <ScrollRevealText />
      </section>

      {/* 5. СТАТИСТИКА */}
      <section className="max-w-[1150px] mx-auto px-6 md:px-8 pb-10 border-t border-zinc-200 pt-7 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-row items-start justify-between gap-2 w-full"
        >
          <div className="flex-1 pr-1">
            <h3 className="text-[20px] font-bold text-black mb-1 tracking-tight whitespace-nowrap">10+</h3>
            <p className="text-[9px] text-zinc-500 leading-snug">Років експертизи в індустрії краси</p>
          </div>
          <div className="flex-1 px-1">
            <h3 className="text-[20px] font-bold text-black mb-1 tracking-tight whitespace-nowrap">3,6+ млн</h3>
            <p className="text-[9px] text-zinc-500 leading-snug">Одиниць продукції виготовляємо щорічно</p>
          </div>
          <div className="flex-1 pl-1">
            <h3 className="text-[20px] font-bold text-black mb-1 tracking-tight whitespace-nowrap">500+</h3>
            <p className="text-[9px] text-zinc-500 leading-snug">Реалізованих проєктів та крос-промо</p>
          </div>
        </motion.div>
      </section>

      {/* 6. ФОРМУЛЫ (АВТОМАТИЧЕСКАЯ РАСПАКОВКА + ИНТЕРАКТИВ ПО НАВЕДЕНИЮ) */}
      <section 
        className="w-full bg-white relative pt-10 flex flex-col items-center justify-between h-[74vh]"
        onClick={() => setActiveId(null)}
      >
        
        {/* Заголовок */}
        <div className="absolute top-4 md:top-8 w-full max-w-[1150px] px-6 md:px-8 flex justify-center z-30">
          <h2 className="text-[clamp(28px,4.5vw,50px)] font-bold tracking-tight text-black leading-tight flex justify-center items-center drop-shadow-md">
            <span className="inline-flex justify-end w-[2.2em] md:w-[2.5em] tabular-nums">
              <AnimatedCounter from={1} to={500} duration={1.5} />
            </span>
            <span className="ml-1 mr-2 md:mr-3">+</span>
            <WipeText text="перевірених формул" />
          </h2>
        </div>

        {/* Интерактивная зона с баночками и списками */}
        <motion.div 
          className="relative flex items-end justify-center w-full h-[74vh] z-20 mt-auto pointer-events-none"
          onViewportEnter={() => {
            if (flightTimeout.current) clearTimeout(flightTimeout.current);
            setIsFlownIn(false);
            flightTimeout.current = setTimeout(() => setIsFlownIn(true), 1200);
          }}
          onViewportLeave={() => {
            if (flightTimeout.current) clearTimeout(flightTimeout.current);
            setIsFlownIn(false);
          }}
          viewport={{ once: false, amount: 0.15 }}
        >
          
          {/* ОБЛАКА ТЕГОВ (СПИСКИ), появляются строго на местах X и Y других баночек */}
          {FORMULA_CATEGORIES.map(cat => (
            <motion.div
              key={`list-${cat.id}`}
              className="absolute flex flex-wrap justify-center content-center gap-2 md:gap-3 w-[46vw] max-w-[400px] h-fit z-40 pointer-events-none"
              // ВАЖНО: передаем координаты напрямую во Framer Motion, чтобы он их не стер при анимации scale!
              initial={{ opacity: 0, scale: 0.9, x: cat.listX, y: cat.listY, filter: "blur(4px)" }}
              animate={{
                opacity: activeId === cat.id ? 1 : 0,
                scale: activeId === cat.id ? 1 : 0.9,
                x: cat.listX, // Удерживаем список на правильном месте (слева или справа от активной банки)
                y: cat.listY,
                filter: activeId === cat.id ? "blur(0px)" : "blur(4px)"
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {cat.items.map((item, idx) => {
                const rotation = ROTATIONS[idx % ROTATIONS.length];
                return (
                  <div 
                    key={item} 
                    className="bg-[#1a1a1a] text-white px-[clamp(12px,1.2vw,16px)] py-[clamp(6px,0.6vw,8px)] rounded-full text-[clamp(12px,1.1vw,15px)] font-medium shadow-xl text-center leading-tight whitespace-nowrap transition-transform duration-300 hover:scale-105"
                    style={{ transform: `rotate(${rotation}deg)` }} // Только наклон, без сдвига координат
                  >
                    {item}
                  </div>
                );
              })}
            </motion.div>
          ))}

          {/* БАНОЧКИ */}
          {FORMULA_CATEGORIES.map(cat => (
            <div 
              key={cat.id}
              className="absolute flex flex-col items-center justify-end h-[45vh] pointer-events-none"
              style={{ transform: `translate(${cat.x}, ${cat.y})` }}
            >
              {/* Надпись категории */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                className="mb-6 z-10 w-full flex justify-center"
              >
                <motion.span
                  animate={{
                    opacity: activeId === null || activeId === cat.id ? 1 : 0.2,
                    filter: activeId === null || activeId === cat.id ? "blur(0px)" : "blur(4px)"
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-black font-bold text-[clamp(14px,1.5vw,20px)] whitespace-nowrap drop-shadow-md text-center pointer-events-none"
                >
                  {cat.title}
                </motion.span>
              </motion.div>

              {/* Картинка: Анимация выезда (whileInView) + Анимация наведения (animate) */}
              <motion.div
                onClick={(e) => {
                  e.stopPropagation(); // Чтобы клик не улетел в фон и не закрыл банку сразу же
                  if (isFlownIn) {
                    setActiveId(prev => (prev === cat.id ? null : cat.id));
                  }
                }}
                className="relative cursor-pointer pointer-events-auto origin-bottom"
                animate={{
                  opacity: activeId === null || activeId === cat.id ? 1 : 0.15,
                  filter: activeId === null || activeId === cat.id ? "blur(0px)" : "blur(6px)",
                  scale: activeId === cat.id ? 1.1 : 1
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <motion.img 
                  initial={{ x: cat.initialX, y: cat.initialY, rotate: cat.rotate }}
                  animate={{ x: 0, y: 0, rotate: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  src={cat.img} 
                  alt={cat.title} 
                  className={`h-[22vh] w-auto object-contain drop-shadow-2xl origin-bottom ${cat.imgScale}`} 
                />
              </motion.div>
            </div>
          ))}
        </motion.div>
      </section>



      {/* БРЕНДЫ В СТОЛБИК НА МОБИЛКЕ */}
      <section className="w-full bg-white relative z-20 flex flex-col pt-2 pb-0">
        
        <div className="w-full flex justify-center z-30 mb-0 px-5">
          <h2 className="text-[clamp(28px,4vw,42px)] font-bold tracking-tight text-center text-black">
            Наші бренди
          </h2>
        </div>

        <div className="w-full flex flex-col z-20">
          
          {/* 1. Replique */}
          <div 
            className="w-full h-[35vh] relative flex flex-col items-center justify-center p-6 border-b border-zinc-200 cursor-pointer overflow-hidden"
            onMouseEnter={() => { setIsHoveringBrand(true); setHoveredBrandIdx(0); }}
            onMouseLeave={() => { setIsHoveringBrand(false); setHoveredBrandIdx(null); }}
          >
            <img 
              src="/DSC09625.jpg" 
              alt="Replique" 
              className={`absolute inset-0 w-full h-full object-cover object-bottom transition-opacity duration-300 ease-in-out z-10 pointer-events-none rounded-[24px] ${hoveredBrandIdx === 0 ? 'opacity-100' : 'opacity-0'}`} 
            />
            
            <div className="relative z-40 w-[60%] max-w-[250px] mb-4 flex justify-center items-center">
              <img 
                src="/replique.svg" 
                alt="Replique Logo" 
                className={`w-full h-auto object-contain transition-all duration-300 pointer-events-none ${hoveredBrandIdx === 0 ? 'scale-110 drop-shadow-lg' : ''}`} 
              />
            </div>
            
            <div className="relative z-40 w-full text-center max-w-[350px]">
              <p className={`text-[13px] sm:text-[15px] transition-opacity duration-300 leading-relaxed text-zinc-600 ${hoveredBrandIdx === 0 ? 'opacity-0' : 'opacity-100'}`}>
                Колекція концептуальних парфумерних композицій, що охоплює широку палітру ароматів — від легких свіжих та квіткових до глибоких гурманських.
              </p>
            </div>
          </div>

          {/* 2. Mermade */}
          <div 
            className="w-full h-[35vh] relative flex flex-col items-center justify-center p-6 border-b border-zinc-200 cursor-pointer overflow-hidden"
            onMouseEnter={() => { setIsHoveringBrand(true); setHoveredBrandIdx(1); }}
            onMouseLeave={() => { setIsHoveringBrand(false); setHoveredBrandIdx(null); }}
          >
            <img 
              src="/brand1.jpg" 
              alt="Mermade" 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-in-out z-10 pointer-events-none rounded-[24px] ${hoveredBrandIdx === 1 ? 'opacity-100' : 'opacity-0'}`} 
            />
            
            <div className="relative z-40 w-[60%] max-w-[250px] mb-4 flex justify-center items-center">
              <img 
                src="/marmade.svg" 
                alt="Mermade Logo" 
                className={`w-full h-auto object-contain transition-all duration-300 pointer-events-none ${hoveredBrandIdx === 1 ? 'scale-110 drop-shadow-lg' : ''}`} 
              />
            </div>
            
            <div className="relative z-40 w-full text-center max-w-[350px]">
              <p className={`text-[13px] sm:text-[15px] transition-opacity duration-300 leading-relaxed text-zinc-600 ${hoveredBrandIdx === 1 ? 'opacity-0' : 'opacity-100'}`}>
                Яскраві засоби для догляду за собою та подорожей, що створюють настрій, дарують емоції та перетворюють б'юті-рутину на справжнє задоволення.
              </p>
            </div>
          </div>

          {/* 3. Hydrasence */}
          <div 
            className="w-full h-[35vh] relative flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden"
            onMouseEnter={() => { setIsHoveringBrand(true); setHoveredBrandIdx(2); }}
            onMouseLeave={() => { setIsHoveringBrand(false); setHoveredBrandIdx(null); }}
          >
            <img 
              src="/brand3_v2.jpg" 
              alt="Hydrasence" 
              className={`absolute inset-0 w-full h-full object-cover object-[center_30%] transition-opacity duration-300 ease-in-out z-10 pointer-events-none rounded-[24px] ${hoveredBrandIdx === 2 ? 'opacity-100' : 'opacity-0'}`} 
            />
            
            <div className="relative z-40 w-[60%] max-w-[250px] mb-4 flex justify-center items-center">
              <img 
                src="/hydrasence.svg" 
                alt="Hydrasence Logo" 
                className={`w-full h-auto object-contain transition-all duration-300 pointer-events-none ${hoveredBrandIdx === 2 ? 'scale-125 drop-shadow-lg' : 'scale-110'}`} 
              />
            </div>
            
            <div className="relative z-40 w-full text-center max-w-[350px]">
              <p className={`text-[13px] sm:text-[15px] transition-opacity duration-300 leading-relaxed text-zinc-600 ${hoveredBrandIdx === 2 ? 'opacity-0' : 'opacity-100'}`}>
                Інноваційні рішення для базового догляду за шкірою та волоссям, серед яких — спеціалізована серія стимуляторів росту волосся з екстрактом розмарину.
              </p>
            </div>
          </div>
          
        </div>
      </section>

      {/* НОВЫЙ ДИЗАЙН ROADMAP (СБОРКА ФЛАКОНА) */}
      <RoadmapMobile blackBlockRef={roadmapRef} phaseOffset={phaseOffset} />

      {/* 2) БЛОК "О ПРОИЗВОДСТВЕ" + ЕДИНАЯ ВОЛНА */}
      <div className="w-full bg-white relative">
        
        {/* ЕДИНАЯ ВОЛНА СЛЕВА ДЛЯ ВСЕХ НИЖНИХ СЕКЦИЙ */}
        <div className="absolute top-0 bottom-0 left-[-30px] md:left-[-50px] lg:left-[-70px] w-[350px] pointer-events-none mix-blend-difference hidden md:block z-10">
          <svg key={phaseOffset3} className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="wavePatternBottom" width="400" height="900" patternUnits="userSpaceOnUse" patternTransform={`translate(0, -${phaseOffset3})`}>
                <g stroke="white" strokeWidth="2">
                  <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(0, 0)" />
                  <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(25, 0)" />
                  <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(50, 0)" />
                  <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(75, 0)" />
                  <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(100, 0)" />
                  <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(125, 0)" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wavePatternBottom)" />
          </svg>
        </div>

        {/* 7. СЕРТИФИКАЦИЯ GMP (ПЕРЕНЕСЕНО СЮДА) */}
        <section className="w-full pt-4 md:pt-6 pb-8 md:pb-12 relative z-20 overflow-hidden">
          <div className="max-w-[1150px] mx-auto px-6 md:px-8 flex flex-col md:grid md:grid-cols-2 items-start gap-8 md:gap-x-20 relative z-20">
            
            {/* Title & Text */}
            <div className="w-full order-1 flex flex-col">
              <h2 className="text-[clamp(28px,3vw,36px)] font-bold tracking-tight text-black mb-4">
                Сертифікація GMP
              </h2>
              <p className="text-[clamp(14px,1.2vw,15px)] text-zinc-500 leading-relaxed max-w-[500px]">
                Наше виробництво сертифіковане за міжнародним стандартом <span className="underline underline-offset-4 decoration-zinc-300">GMP (Good Manufacturing Practice)</span>. Це «золотий стандарт» індустрії, який гарантує суворий контроль на кожному етапі: від відбору сировини та умов зберігання до лабораторних випробувань готового продукту.
              </p>
            </div>

            {/* Certificate (Mobile: middle, Desktop: right column) */}
            <div className="w-full flex justify-center md:justify-end order-2 md:col-start-2 md:row-span-2">
              <motion.img 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                src="https://cdn.prod.website-files.com/69b2957a534625d1beb1cce7/69c4f72e83b4b8e066fcd250_GMP%20Certificate.jpg" 
                alt="GMP Certificate" 
                className="w-full max-w-[400px] md:max-w-full rounded-2xl shadow-xl border border-black/5" 
              />
            </div>

            {/* Accordion (Mobile: bottom, Desktop: left column) */}
            <div className="w-full flex flex-col gap-2 md:gap-3 order-3 md:col-start-1 md:mt-8">
                 <AccordionItem title="Нотифікація продуктів" content="Надаємо повний пакет документів відповідно до технічного регламенту для легальної реалізації продукції." />
                 <AccordionItem title="Вхідний контроль сировини" content="Кожна партія інгредієнтів проходить лабораторну перевірку на відповідність сертифікатам безпеки та фізико-хімічним показникам." />
                 <AccordionItem title="Аудит постачальників" content="Ми працюємо лише з перевіреними партнерами, які регулярно підтверджують високу якість своєї продукції та етичність виробництва." />
                 <AccordionItem title="Розробка та тестування формули" content="Створюємо ефективні рецептури та проводимо серію стрес-тестів, щоб гарантувати стабільність і дієвість продукту протягом усього терміну придатності." />
                 <AccordionItem title="Контроль якості готової продукції" content="Фінальний зразок з кожного замісу тестується на відповідність еталону за кольором, ароматом, текстурою та рівнем pH." />
                 <AccordionItem title="Перевірка паковання та маркування" content="Ми інспектуємо герметичність тари та точність інформації на етикетках, щоб ви отримали надійний і зрозумілий у використанні продукт." />
            </div>

          </div>
        </section>

        {/* ЗАГОЛОВОК ДЛЯ КОЛЛАЖА */}
        <section className="w-full relative z-20 pt-0 pb-4">
          <div className="max-w-[1150px] mx-auto px-6 md:px-8 w-full">
            <motion.h2 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-[clamp(28px,3vw,36px)] font-bold tracking-tight text-black"
            >
              Надихніться готовими продуктами
            </motion.h2>
          </div>
        </section>

        {/* ПАЗЛ-ГРИД С ВИДЕО И ФОТО */}
        <CollageMobile />

        {/* ЗАЗИРНІТЬ ЗА ЛАШТУНКИ */}
        <section className="w-full pt-2 pb-4 relative z-20 flex flex-col items-center">
          <div className="max-w-[1150px] mx-auto px-6 md:px-8 w-full">
            <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="flex flex-col max-w-[700px]"
              >
                <h2 className="text-[clamp(28px,3vw,36px)] font-bold tracking-tight text-black mb-1">
                  Зазирніть за лаштунки
                </h2>
                <p className="text-[clamp(14px,1.2vw,16px)] text-zinc-500 leading-relaxed max-w-[600px]">
                  Прозорість — основа нашого партнерства. Запрошуємо вас на індивідуальну екскурсію нашим виробництвом у Вишгороді, де ми покажемо обладнання, процеси та познайомимо з командою.
                </p>
              </motion.div>
              
            </div>

            {/* ЧЕТЫРЕ ВИДЕО (2x2) */}
            <div className="grid grid-cols-2 gap-3 mt-4 w-full">
              {[
                "/video1.mp4",
                "/video2.mp4",
                "/video3.mp4",
                "/video4.mov"
              ].map((src, idx) => (
                <div key={idx} className="w-full aspect-[4/5] relative overflow-hidden rounded-[16px]">
                  <video 
                    suppressHydrationWarning
                    src={src} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover scale-[1.02]" 
                  />
                </div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="mt-6 w-full"
            >
              <Link href="/contact" className="bg-black text-white px-6 py-4 rounded-full text-[15px] font-bold w-full text-center hover:scale-105 active:scale-95 transition-transform duration-300 ease-out flex items-center justify-center h-[44px]">
                Запланувати візит
              </Link>
            </motion.div>

          </div>
        </section>

        {/* ОТЗЫВЫ (КАРТОТЕКА - ЗАМОРОЗКА) */}
        <ReviewsAssembly phaseOffset3={phaseOffset3} />
      </div>

    </div>
  );
}

const ReviewsAssembly = ({ phaseOffset3 }: { phaseOffset3: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetTop, setOffsetTop] = useState(0);
  const [vh, setVh] = useState(0);
  const [logoExpanded, setLogoExpanded] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  
  


  useEffect(() => {
    if (!containerRef.current) return;
    
    // Встановлюємо початкове значення
    setOffsetTop(containerRef.current.offsetTop);
    
    // Слідкуємо за змінами висоти батьківського контейнера (якщо завантажаться картинки/відео)
    const parent = containerRef.current.parentElement;
    if (!parent) return;
    
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        setOffsetTop(containerRef.current.offsetTop);
      }
    });
    
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setVh(window.innerHeight);
    const handleResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Вычисляем сдвиг, чтобы волна совпадала с глобальной сеткой
  const patternShift = offsetTop % 900;
  
  // Фаза для новой волны в футере (чтобы бесшовно состыковаться с концом липкого экрана)
  // В липком контейнере волна имеет сдвиг -(phaseOffset3 + patternShift).
  // Нижний край липкого контейнера находится на расстоянии vh от его верха.
  // Значит, чтобы футер начался точно с этого же места, его волну нужно сдвинуть еще на vh вверх:
  const footerWavePhase = -((phaseOffset3 || 0) + patternShift + vh);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Карточка 1 (Черная, самая большая) уменьшается
  const scale1 = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  // Карточка 2 (Серый мет) выезжает и тоже чуть уменьшается
  const y2 = useTransform(scrollYProgress, [0, 0.5], ["100vh", "0vh"]);
  const scale2 = useTransform(scrollYProgress, [0.5, 1], [1, 0.95]);

  // Карточка 3 просто выезжает
  const y3 = useTransform(scrollYProgress, [0.5, 1], ["100vh", "0vh"]);
  
  return (
    <>
    <section ref={containerRef} className="w-full h-[300vh] relative z-20 bg-white">
      {/* Прибиваем экран (заморозка) */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center">

        {/* ЗАГОЛОВОК ВІДГУКІВ */}
        <div className="absolute top-[90px] w-full px-6 md:px-8 text-center z-30 pointer-events-none">
          <h2 className="text-[clamp(28px,3vw,36px)] font-bold tracking-tight text-black">
            Від ідеї до полиць: досвід наших партнерів
          </h2>
        </div>
        
        {/* ЗАМОРОЖЕННАЯ ВОЛНА СЛЕВА (z-10, чтобы бегущая строка пряталась ПОД ней) */}
        <div className="absolute inset-0 left-[-30px] md:left-[-50px] lg:left-[-70px] w-[350px] pointer-events-none hidden md:block z-10">
          <svg className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="wavePatternFrozen" width="400" height="900" patternUnits="userSpaceOnUse" patternTransform={`translate(0, -${(phaseOffset3 || 0) + patternShift})`}>
                <g stroke="black" strokeWidth="2">
                  <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(0, 0)" />
                  <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(25, 0)" />
                  <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(50, 0)" />
                  <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(75, 0)" />
                  <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(100, 0)" />
                  <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(125, 0)" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wavePatternFrozen)" />
          </svg>
        </div>

        {/* БЕГУЩАЯ СТРОКА ЛОГОТИПОВ (z-index 0, под волной) */}
        <div className="absolute bottom-0 md:bottom-[4vh] w-full overflow-hidden z-0">
          <style>{`
            @keyframes marquee-infinite-right {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(0%); }
            }
            .marquee-track {
              display: flex;
              width: max-content;
            }
            .marquee-content {
              display: flex;
              align-items: center;
              animation: marquee-infinite-right 30s linear infinite;
            }
          `}</style>
          
          <div className="marquee-track opacity-100">
            {[1, 2, 3, 4].map((blockIdx) => (
              <div key={blockIdx} className="marquee-content gap-12 md:gap-24 pr-12 md:pr-24">
                {[
                  "/eva.png",       // Короткий
                  "/meteora.png",   // Длинный
                  "/lovit.png",     // Короткий
                  "/avrora.png",    // Длинный
                  "/makeup.png",    // Короткий (квадрат)
                  "/topbeauty.png", // Длинный
                  "/joinup.png",    // Длинный
                ].map((logo, i) => (
                  <img 
                    key={i} 
                    src={logo} 
                    alt="Partner Logo" 
                    className="h-6 md:h-10 object-contain"
                    style={{ 
                      filter: logo.includes('makeup')
                        ? 'invert(100%) grayscale(100%) brightness(0.65) contrast(1000%)'
                        : 'grayscale(100%) brightness(0.65) contrast(1000%)', 
                      mixBlendMode: 'multiply' 
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Карточка 1 (Make Up) - ЧЕРНАЯ (z-20) */}
        <motion.div 
          style={{ scale: scale1, top: '190px', transformOrigin: 'top center' }}
          className="absolute w-full px-6 md:px-8 flex justify-center z-20" 
        >
          <div className="w-full max-w-[1000px] h-[55vh] md:h-[450px] py-10 px-8 md:px-16 bg-black rounded-[40px] shadow-md flex flex-col items-center justify-center gap-6 md:gap-8 border border-white/10">
            <p className="text-[clamp(14px,1.5vw,18px)] font-bold text-center leading-relaxed text-white max-w-[850px]">
              "Ми тривалий час співпрацюємо з ElementXLab у напрямку контрактного виробництва косметики й можемо впевнено назвати їх надійним виробничим партнером. Команда демонструє високий рівень сервісу, експертність і гнучкість на всіх етапах — від розробки до відвантаження продукції. ElementX Lab стабільно забезпечує якість, дотримання термінів і оптимальне співвідношення ціни та результату."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl flex flex-col items-center justify-center shadow-sm border border-zinc-200">
                <div className="w-[4px] h-[4px] md:w-[6px] md:h-[6px] bg-black mb-[2px] rounded-full"></div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="scale-75">
                   <path d="M6 4v8a6 6 0 0 0 12 0V4" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-white text-base md:text-lg">Максим Богдюк</span>
                <span className="text-zinc-400 text-xs md:text-sm">Make Up</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Карточка 2 (Eva) - #474A51 (z-30) */}
        <motion.div 
          style={{ y: y2, scale: scale2, top: '230px', transformOrigin: 'top center' }}
          className="absolute w-full px-6 md:px-8 flex justify-center z-30"
        >
          <div className="w-full max-w-[1000px] h-[55vh] md:h-[450px] py-10 px-8 md:px-16 bg-[#474A51] rounded-[40px] shadow-2xl flex flex-col items-center justify-center gap-6 md:gap-8 border border-white/10">
            <p className="text-[clamp(16px,1.8vw,22px)] font-bold text-center leading-relaxed text-white max-w-[850px]">
              "За що мені подобається працювати з вами? Бо ви профі, в яких завжди є рішення, за те що ви динамічні і шукаєте нові шляхи! За ваші перевірені формули та знання трендів ринку"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl flex items-center justify-center text-lg md:text-xl font-bold shadow-sm">
                <span className="text-[#FF8C00]">é</span><span className="text-[#00B050]">va</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-white text-base md:text-lg">Катерина Кучер</span>
                <span className="text-zinc-400 text-xs md:text-sm">Eva</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Карточка 3 (Avrora) - #E5E4E2 (Светлая) (z-40) */}
        <motion.div 
          style={{ y: y3, top: '270px', transformOrigin: 'top center' }}
          className="absolute w-full px-6 md:px-8 flex justify-center z-40"
        >
          <div className="w-full max-w-[1000px] h-[55vh] md:h-[450px] py-10 px-8 md:px-16 bg-[#E5E4E2] rounded-[40px] shadow-2xl flex flex-col items-center justify-center gap-6 md:gap-8">
            <p className="text-[clamp(16px,1.8vw,22px)] font-bold text-center leading-relaxed text-black max-w-[850px]">
              "Від імені компанії хочу подякувати вам за співпрацю! Ми цінуємо ваше розуміння ринку і системний підхід до виконання задач. Окремо дякую за те, що ми на одній хвилі в плані розвитку і трендів. Дуже рада мати змогу працювати з вами."
            </p>
            <div className="flex items-center gap-4">
              <img src="/avrora-logo.jpg" alt="Avrora" className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-2xl shadow-sm" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-black text-base md:text-lg">Дарина Малиновська</span>
                <span className="text-zinc-700 text-xs md:text-sm">Avrora</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
    
    {/* 6. БЛОК FAQ + ДОПОЛНИТЕЛЬНАЯ СТРАНИЦА */}
    <div className="w-full relative bg-white overflow-hidden z-20">
      
      {/* ВОЛНА НА ОБЕ СЕКЦИИ (ТЕПЕРЬ ПОВЕРХ ВСЕГО) */}
      <div className="absolute top-0 bottom-0 left-[-30px] md:left-[-50px] lg:left-[-70px] w-[350px] pointer-events-none hidden md:block z-40 mix-blend-difference">
        <svg className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wavePatternFooter" width="400" height="900" patternUnits="userSpaceOnUse" patternTransform={`translate(0, ${footerWavePhase})`}>
              <g stroke="white" strokeWidth="2">
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(0, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(25, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(50, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(75, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(100, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(125, 0)" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wavePatternFooter)" />
        </svg>
      </div>

      <section className="w-full h-auto pt-8 md:pt-12 relative z-20">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:pl-[240px] lg:pl-[280px] md:pr-12 lg:pr-24">
          <div className="flex flex-col mb-6 md:mb-8">
            <h2 className="text-[clamp(28px,3vw,36px)] font-bold tracking-tight text-black">
              FAQs
            </h2>
          </div>
          <div className="flex flex-col w-full border-t border-zinc-200">
            {faqData.map((faq, idx) => (
              <FaqAccordionItem key={idx} title={faq.title} content={faq.content} />
            ))}
          </div>
        </div>
      </section>

      {/* ПУСТАЯ СТРАНИЦА ВНИЗУ */}
      <section className="w-full relative z-20 flex flex-col md:flex-row justify-between items-center md:items-end px-6 md:px-24 pt-8 pb-0">
        
        {/* Мобильный заголовок и первое предложение (только для мобилок) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="md:hidden flex flex-col w-full pb-4"
        >
          <h2 className="text-[clamp(36px,4vw,56px)] leading-[1.1] font-bold tracking-tight text-left w-full pb-2 text-black">
            <motion.span 
              initial={{ backgroundPosition: "0% 100%" }}
              whileInView={{ backgroundPosition: ["0% 100%", "0% 25%", "0% 0%"] }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 2.2, times: [0, 0.75, 1], ease: "easeInOut", delay: 0.2 }}
              style={{
                backgroundImage: "linear-gradient(180deg, #000000 0%, #000000 25%, #9f1239 35%, #ff0080 45%, #7928ca 55%, #0ABAB5 65%, #d4d4d8 75%, #d4d4d8 100%)",
                backgroundSize: "100% 400%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitBoxDecorationBreak: "clone",
                boxDecorationBreak: "clone",
                display: "inline"
              }}
            >
              Ваші ідеї стануть реальністю!
            </motion.span>
          </h2>
        </motion.div>

        {/* Контейнер для текста и фото (мобильный: flex-row, десктоп: contents или просто flex-row) */}
        <div className="flex flex-row w-full justify-between items-end md:w-auto md:contents">
          
          {/* Текст слева */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6 md:gap-8 max-w-[600px] pb-6 md:pb-20 z-10 text-left self-end md:self-center w-[55%] md:w-auto md:ml-12 lg:ml-24"
          >
            {/* Десктопный заголовок */}
            <h2 className="hidden md:block text-[clamp(36px,4vw,56px)] leading-[1.1] font-bold tracking-tight text-black">
              <motion.span 
                initial={{ backgroundPosition: "0% 100%" }}
                whileInView={{ backgroundPosition: ["0% 100%", "0% 25%", "0% 0%"] }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 2.2, times: [0, 0.75, 1], ease: "easeInOut", delay: 0.2 }}
                style={{
                  backgroundImage: "linear-gradient(180deg, #000000 0%, #000000 25%, #9f1239 35%, #ff0080 45%, #7928ca 55%, #0ABAB5 65%, #d4d4d8 75%, #d4d4d8 100%)",
                  backgroundSize: "100% 400%",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitBoxDecorationBreak: "clone",
                  boxDecorationBreak: "clone",
                  display: "inline"
                }}
              >
                Ваші ідеї стануть реальністю!
              </motion.span>
            </h2>
            <div className="flex flex-col gap-0 text-[clamp(14px,1.2vw,18px)] text-zinc-600 font-medium pr-2 md:pr-0">
              <p>Element X Lab бере на себе всі виробничі процеси, щоб ви могли зосередитися на головному — зростанні бренду.</p>
            </div>
          </motion.div>

          {/* Девушка справа */}
          <motion.img 
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            src="/girl2.png" 
            alt="Girl" 
            className="w-[45%] md:w-[35vw] max-w-[600px] h-auto object-contain pointer-events-none self-end scale-[1.25] origin-bottom-right md:scale-100 md:origin-center" 
            style={{ marginBottom: '-2px' }} 
          />

        </div>
      </section>

      {/* FOOTER */}
                  <section 
        ref={footerRef}
        className="w-full relative z-30 bg-black rounded-t-[32px] md:rounded-t-[64px] flex flex-col pt-2 md:pt-4 overflow-hidden pb-[2.7vw] md:pb-[1.8vw]"
      >
          {/* Контентный слой */}
          <div className="flex flex-col md:flex-row w-full px-6 md:px-12 z-10 relative pb-10 md:pb-8 mt-4 md:mt-0 items-center md:items-start gap-6 md:gap-0">
             
             {/* Left: Button */}
             <div className="flex-1 w-full flex items-center justify-center md:justify-start md:ml-[20%] mt-2 md:mt-16 z-20">
                <Link href="/contact" className="relative group flex animate-pulse-sync-v2">
                  <span className="relative overflow-hidden flex items-center gap-3 bg-zinc-200 text-black px-8 py-4 rounded-[32px] font-bold text-[clamp(16px,1vw,18px)] uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform duration-300 ease-out">
                    <span className="absolute top-0 bottom-0 left-0 w-[150%] bg-gradient-to-r from-transparent via-white to-transparent animate-shine-v2 pointer-events-none z-0 opacity-100"></span>
                    <span className="relative z-10 flex items-center gap-3">
                      Почати співпрацю
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </span>
                  </span>
                </Link>
             </div>

             {/* Right: Contact info & Socials */}
             <div className="flex-none flex flex-col text-white text-center md:text-left items-center md:items-start gap-1 pt-0 md:pt-4 z-20">
               
               {/* Social Icons + Phone (В один ряд, по центру) */}
               <div className="flex items-center justify-center md:justify-start gap-4 mb-2 md:mb-6">
                 
                 <a href="https://www.instagram.com/elementxlab/" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80 transition-opacity">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                     <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                     <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                   </svg>
                 </a>
                 <a href="tel:+380689316478" className="group relative w-fit text-white text-[clamp(14px,1.2vw,16px)] font-medium">
                   +38 (068) 931 64 78
                   <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
                 </a>
               </div>

               {/* Email */}
               <a href="mailto:hello@elementxlab.com" className="group relative w-fit text-[clamp(24px,3vw,36px)] font-bold mb-1 pb-1">
                 hello@elementxlab.com
                 <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
               </a>
               
               {/* Address */}
               <a href="https://maps.google.com/?q=Вишгород,+Борисо-Глібська+57Б" target="_blank" rel="noopener noreferrer" className="group relative w-fit text-zinc-300 text-[clamp(12px,1.2vw,16px)] pb-1 mt-1">
                 Вишгород, Борисо-Глібська 57Б
                 <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-zinc-300 transition-all duration-300 ease-out group-hover:w-full"></span>
               </a>
             </div>
          </div>

          {/* Абсолютный слой логотипа (привязан ко дну) */}
          <div className="absolute bottom-0 left-0 w-full flex justify-start px-4 md:px-8 pointer-events-none z-0">
             <svg 
                style={{ transform: 'translateY(0%)', marginBottom: '-1.5vw' }} 
                viewBox="46 128 208 28" 
                className="w-[100%] md:w-[65%] h-auto transition-transform duration-700 ease-in-out" 
                fill="white" stroke="white" strokeWidth="0.9" strokeLinejoin="round"
             >
                <polygon points="46.9 138.9 46.9 154.1 61.9 154.1 61.9 151.83 49.7 151.83 49.7 147.5 61.3 147.5 61.3 145.3 49.63 145.3 49.63 141.1 61.63 141.1 61.63 138.83 46.9 138.9"/>
                <polygon points="65.43 139.03 65.43 154.17 79.77 154.17 79.77 151.77 68.17 151.77 68.17 139.03 65.43 139.03"/>
                <polygon points="83.42 138.9 83.42 154.1 98.42 154.1 98.42 151.83 86.22 151.83 86.22 147.5 97.82 147.5 97.82 145.3 86.15 145.3 86.15 141.1 98.15 141.1 98.15 138.83 83.42 138.9"/>
                <polyline points="101.83 154.27 101.83 138.83 106.03 138.83 111.47 149.97 117.53 138.83 121.6 138.83 121.6 154.27 118.83 154.27 118.83 143.97 117.9 143.97 112.77 154.27 110.57 154.27 105.43 144.07 104.5 144.07 104.5 154.27 101.83 154.27"/>
                <polygon points="125.67 138.9 125.67 154.1 140.67 154.1 140.67 151.83 128.47 151.83 128.47 147.5 140.07 147.5 140.07 145.3 128.4 145.3 128.4 141.1 140.4 141.1 140.4 138.83 125.67 138.9"/>
                <polygon points="144.17 154.1 144.17 138.83 148.2 138.83 157.13 150.47 158.1 150.5 158.1 138.83 160.5 138.83 160.5 154.1 156.63 154.1 147.7 142.57 146.7 142.57 146.7 154.1 144.17 154.1"/>
                <polygon points="163.9 138.83 163.9 141.27 170.6 141.27 170.6 154.1 173.8 154.1 173.8 141.12 180.8 141.12 180.8 138.83 163.9 138.83"/>
                <polygon points="190.95 138.87 194.95 138.87 198.95 144.02 199.65 144.02 204.05 138.87 207.55 138.87 201.25 145.77 201.25 146.67 207.95 154.07 204.85 154.07 199.95 148.57 199.03 148.57 194.07 154.13 190.5 154.13 197.88 146.62 197.88 145.72 190.95 138.87"/>
                <rect x="214.9" y="129.2" width="38.4" height="17.13" rx="4.68" />
                <g fill="black" stroke="black" strokeWidth="0.75" strokeLinejoin="round">
                  <polygon points="220.4 134.17 220.4 141.33 227.47 141.33 227.47 140.23 221.83 140.23 221.83 134.17 220.4 134.17"/>
                  <polygon points="229.37 141.33 233.4 134.17 235.33 134.17 239.2 141.33 237.5 141.33 236.77 139.73 231.87 139.73 231.07 141.33 229.37 141.33"/>
                  <path d="M241.3,134.17v7.16h6.9a.68.68,0,0,0,.39-.11,2.79,2.79,0,0,0,1.14-1.45c.34-1.07-1.2-2-1.2-2l0-.45a1.76,1.76,0,0,0,1.1-1.1c.23-.63-.37-1.38-.75-1.77a.9.9,0,0,0-.64-.26Z"/>
                </g>
                <g fill="white" stroke="white" strokeWidth="0.75">
                  <path d="M247.65,135.88a.78.78,0,0,0-.66-.74v0h-3.84v1.53H247v0A.76.76,0,0,0,247.65,135.88Z"/>
                  <path d="M247.65,139.18a.77.77,0,0,0-.66-.74v0h-3.84V140H247v0A.78.78,0,0,0,247.65,139.18Z"/>
                  <polygon points="234.1 135.88 232.82 138.67 235.93 138.67 234.57 135.88 234.1 135.88"/>
                </g>
             </svg>
          </div>
      </section>

    </div>
    </>
  );
};

const faqData = [
  {
    title: "Який мінімальний обсяг випуску продукції?",
    content: "Мінімальний обсяг у контрактному виробництві косметики за готовими рецептурами становить від 100 кг. Для продукції з унікальною формулою мінімальний стартовий обсяг — від 200 кг."
  },
  {
    title: "Чи надаєте послугу розробки рецептури та яка її вартість?",
    content: (
      <>
        Створення унікальної рецептури косметичного засобу з нуля здійснюється відповідно до технічного завдання, вимог і побажань Замовника.<br />
        Процес включає:<br />
        — підбір сировинних компонентів;<br />
        — розробку технологічного процесу виготовлення;<br />
        — створення та тестування дослідного зразка продукції.<br />
        Вартість розробки залежить від складності рецептури та кількості активних інгредієнтів у складі.<br />
        Послуга передбачає до 3 доопрацювань рецептури на етапі узгодження.<br />
        У разі запуску виробництва вартість розробки може бути зарахована у вартість першої партії.
      </>
    )
  },
  {
    title: "Чи можливе коригування існуючої формули?",
    content: (
      <>
        Так, можливі два варіанти коригування:<br />
        <b>1) Модифікація рецептури:</b> Внесення змін до існуючої формули з метою покращення властивостей продукту (заміна або додавання компонентів).<br />
        <b>2) Адаптація формули:</b> Зміна кольору та/або віддушки без зміни складу та функціональних характеристик продукту.<br />
        Кожна послуга включає до 3 варіантів доопрацювання на етапі узгодження.
      </>
    )
  },
  {
    title: "Чи можливе виготовлення продукції за рецептурою замовника?",
    content: (
      <>
        Так, ми можемо виготовляти косметичну продукцію за рецептурою Замовника.<br />
        Перед запуском виробництва наша технологічна команда проводить експертний аналіз формули, щоб перевірити технологічність, доступність компонентів та відповідність законодавству.<br />
        За потреби ми можемо адаптувати рецептуру, підібрати альтернативні інгредієнти та провести тестування.<br />
        Ми гарантуємо конфіденційність рецептури та можемо працювати на умовах NDA.
      </>
    )
  },
  {
    title: "Які терміни запуску продукту у контрактному виробництві косметики?",
    content: (
      <>
        Терміни залежать від формату виробництва.<br />
        <b>Готова формула:</b> Орієнтовний термін запуску — 45–60 днів. Входить підготовка зразка, підбір упаковки, підготовка макетів та партії до виробництва.<br />
        <b>Унікальна формула:</b> Орієнтовний термін запуску — від 120 днів. Процес включає розробку рецептури, лабораторні випробування, challenge-test, тестування стабільності та підготовку документації.
      </>
    )
  },
  {
    title: "Чи сертифіковане виробництво?",
    content: "Виробництво працює відповідно до міжнародного стандарту GMP ISO 22716, який регламентує всі процеси: від приймання та зберігання сировини до виготовлення, фасування та контролю якості готової продукції."
  },
  {
    title: "Який пакет документів надаєте при випуску продукції?",
    content: "Кожна партія косметичної продукції супроводжується якісним посвідченням, яке підтверджує відповідність продукції заявленим характеристикам."
  },
  {
    title: "Чи допомагаєте з нотифікацією продукції?",
    content: (
      <>
        Так. Ми можемо підготувати повний пакет документів відповідно до Технічного регламенту України та Регламенту ЄС №1223/2009 (PIF, CPSR, перевірка етикетки).<br />
        Послуга надання пакета документів є платною та залежить від кількості SKU.
      </>
    )
  },
  {
    title: "Чи допомагаєте з розробкою дизайну?",
    content: (
      <>
        Так, ми надаємо комплексні послуги дизайну, зокрема розробка етикетки/коробки, логотипу, створення бренду, розробка BrandBook та підготовка текстової частини для етикетки.
      </>
    )
  },
  {
    title: "Чи надаєте послуги фасування?",
    content: (
      <>
        Так, ми надаємо послуги фасування косметичної продукції у флакони, туби та саше.<br />
        Вартість розраховується індивідуально та залежить від типу продукту, виду упаковки та обсягів виробництва.
      </>
    )
  }
];

const roadmapStages = [
  { num: "01", title: "Формування ТЗ", desc: "Аналіз потреб, створення та затвердження зразка" },
  { num: "02", title: "Підписання договору", desc: "Оформлення у \"Вчасно\" або у паперовому вигляді" },
  { num: "03", title: "Оплата", desc: "Виставлення рахунку, передплата 70% вартості" },
  { num: "04", title: "Розробка дизайну", desc: "Виконання нашим або вашим дизайнером" },
  { num: "05", title: "Закупівля", desc: "Друк поліграфії та закупівля комплектуючих" },
  { num: "06", title: "Виготовлення", desc: "Фасування, етикування та відвантаження замовлення" }
];



import { RoadmapMobile } from './RoadmapMobile';
import { CollageMobile } from './CollageMobile';

// Компонент аккордеона для секции GMP
const AccordionItem = ({ title, content, defaultOpen = false }: { title: string, content: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="w-full border-b border-zinc-200 py-1 last:border-0 group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 md:py-3 flex items-center justify-between text-left focus:outline-none"
      >
        <h3 className={`text-[clamp(14px,1.1vw,16px)] font-medium transition-colors duration-300 pr-8 ${isOpen ? 'text-black' : 'text-zinc-600 group-hover:text-black'}`}>
          {title}
        </h3>
        
        <div className="text-zinc-400 relative w-4 h-4 flex items-center justify-center flex-shrink-0 group-hover:text-black transition-colors">
          <motion.span 
            animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }} 
            transition={{ duration: 0.2 }}
            className="absolute w-[1.5px] h-3 bg-current"
          />
          <motion.span className="absolute w-3 h-[1.5px] bg-current" />
        </div>
      </button>
      
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="pb-4 pr-4">
          <div className="text-[13px] md:text-[14px] leading-relaxed text-zinc-500 flex flex-col gap-3">
            {content}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Стандартный аккордеон для секції FAQs
const FaqAccordionItem = ({ title, content }: { title: string, content: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full border-b border-zinc-200 py-1 last:border-0 group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 md:py-3 flex items-center justify-between text-left focus:outline-none"
      >
        <h3 className={`text-[clamp(14px,1.1vw,16px)] font-bold transition-colors duration-300 pr-8 ${isOpen ? 'text-black' : 'text-zinc-500 group-hover:text-black'}`}>
          {title}
        </h3>
        
        <div className="text-zinc-400 relative w-4 h-4 flex items-center justify-center flex-shrink-0 group-hover:text-black transition-colors">
          <motion.span 
            animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }} 
            transition={{ duration: 0.2 }}
            className="absolute w-[2px] h-3 bg-current"
          />
          <motion.span className="absolute w-3 h-[2px] bg-current" />
        </div>
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden w-full md:w-[85%]"
      >
        <div className="pb-5 pt-1 text-[clamp(13px,1vw,15px)] leading-relaxed text-zinc-500 flex flex-col gap-3">
          {content}
        </div>
      </motion.div>
    </div>
  );
};

