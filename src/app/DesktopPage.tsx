"use client";
import HeroScroll3D from "./HeroScroll3D";
import HeroImageSequence from "./HeroImageSequence";

const USE_3D_HERO = false;

// ПЕРЕКЛЮЧАТЕЛЬ ЗАСТАВКИ: "photo" — статичное фото (/0005.png) | "video" — анимация 200 кадров (/scene_first)
const HERO_MODE: "photo" | "video" = "video";

import AppleScrollSection from './AppleScrollSection';
import BrandsAppleScrollSection from './BrandsAppleScrollSection';

import Link from 'next/link';

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
    <div ref={containerRef} className="text-[clamp(22px,2.5vw,28px)] font-bold tracking-tight leading-[1.3] w-full text-zinc-300">
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
    x: '-30vw',
    y: '-8vh',
    initialX: '30vw',
    initialY: '8vh',
    rotate: -15,
    imgScale: 'scale-125 md:scale-110',
    listX: '-10vw', // Появляется СПРАВА, на месте "Для волосся"
    listY: '-6vh', // ПОДНЯТО ВЫШЕ
    items: ['Гідрогелеві патчі', 'Сироватки', 'Гідрофільна олія', 'Креми', 'Гелі для вмивання', 'Маски', 'Зволожуючі місти', 'Тонери', 'Блиски для губ', 'Тінти', 'Бальзами для губ', 'Точкові засоби']
  },
  {
    id: 'hair',
    title: 'Для волосся',
    img: '/hair.png',
    x: '-8.5vw',
    y: '2vh',
    initialX: '10vw',
    initialY: '-2vh',
    rotate: -5,
    imgScale: '',
    listX: '-30vw', // Появляется СЛЕВА, на месте "Для обличчя"
    listY: '-8vh',
    items: ['Шампуні', 'Бальзами', 'Маски для волосся', 'Сироватки для кінчиків', 'Термозахист', 'Пілінги для шкіри голови', 'Сухі шампуні', 'Олії']
  },
  {
    id: 'body',
    title: 'Для тіла',
    img: '/body.png',
    x: '10vw',
    y: '2vh',
    initialX: '-10vw',
    initialY: '-2vh',
    rotate: 5,
    imgScale: '',
    listX: '30vw', // Появляется СПРАВА, на месте "Парфуми"
    listY: '-8vh',
    items: ['Гелі для душу', 'Скраби для тіла', 'Лосьйони', 'Батери', 'Олії для тіла', 'Креми для рук', 'Антицелюлітні засоби', 'Сіль для ванн']
  },
  {
    id: 'parfume',
    title: 'Парфуми',
    img: '/parfume.png',
    x: '30vw',
    y: '-8vh',
    initialX: '-30vw',
    initialY: '8vh',
    rotate: 15,
    imgScale: '',
    listX: '10vw', // Появляется СЛЕВА, на месте "Для тіла"
    listY: '-6vh', // ПОДНЯТО ВЫШЕ
    items: ['Парфумована вода', 'Туалетна вода', 'Тверді парфуми', 'Місти для тіла', 'Аромадифузори для дому', 'Спреї']
  }
];

// Массив легких наклонов для органичного "раскидывания", без сдвига координат (чтобы не было наслоений)
const ROTATIONS = [-2, 3, -1, 2, -3, 1, 4, -2, -1, 3, 2, -3];

export default function Home() {
  const videoRef = useRef<HTMLDivElement>(null!);
  const roadmapRef = useRef<HTMLDivElement>(null!); // Это будет указывать на черный блок в RoadmapAssembly
  const appleRef = useRef<HTMLDivElement>(null!); // Для 4 товаров (Apple Scroll)
  
  const [activeId, setActiveId] = useState<string | null>(null);


  const [isFlownIn, setIsFlownIn] = useState(false);
  const flightTimeout = useRef<any>(null);

  const [blackBlockY, setBlackBlockY] = useState(100000);
  const [appleY, setAppleY] = useState(100000);
  const [appleBottom, setAppleBottom] = useState(100000);
  const [lostScroll, setLostScroll] = useState(7000);
  const brandsRef = useRef<HTMLDivElement>(null!);
  const [brandsY, setBrandsY] = useState(100000);
  const [brandsBottom, setBrandsBottom] = useState(100000);
  const [brandsLost, setBrandsLost] = useState(0);
  const [vh, setVh] = useState(1000);

  const [phaseOffset, setPhaseOffset] = useState(0);
  const [phaseOffset3, setPhaseOffset3] = useState(0);
  const [heroReady, setHeroReady] = useState(HERO_MODE === "photo");

  // Состояние и смещение для центрирования сертификата GMP по клику
  const certWrapRef = useRef<HTMLDivElement>(null);
  const [isCertHovered, setIsCertHovered] = useState(false);
  const [isCertElevated, setIsCertElevated] = useState(false);
  const [certTransform, setCertTransform] = useState({ x: 0, y: 0, scale: 1 });
  const certElevationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCertClose = () => {
    setIsCertHovered(false);
    setCertTransform({ x: 0, y: 0, scale: 1 });
    if (certElevationTimer.current) clearTimeout(certElevationTimer.current);
    certElevationTimer.current = setTimeout(() => setIsCertElevated(false), 750);
  };

  const handleCertToggle = () => {
    if (isCertHovered) {
      handleCertClose();
      return;
    }
    if (!certWrapRef.current) return;
    if (certElevationTimer.current) clearTimeout(certElevationTimer.current);
    const rect = certWrapRef.current.getBoundingClientRect();
    const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
    const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);
    const maxScaleByHeight = (window.innerHeight * 0.88) / Math.max(rect.height, 1);
    const scale = Math.min(1.22, Math.max(1.08, maxScaleByHeight));
    setCertTransform({ x: dx, y: dy, scale });
    setIsCertElevated(true);
    setIsCertHovered(true);
  };

  useEffect(() => {
    if (!isCertHovered) return;
    const onScrollOrKey = (e: Event) => {
      if (e.type === 'keydown' && (e as KeyboardEvent).key !== 'Escape') return;
      handleCertClose();
    };
    window.addEventListener('scroll', onScrollOrKey, { passive: true });
    window.addEventListener('keydown', onScrollOrKey);
    return () => {
      window.removeEventListener('scroll', onScrollOrKey);
      window.removeEventListener('keydown', onScrollOrKey);
    };
  }, [isCertHovered]);

  // Прорисовка волны сверху вниз за 0.5 c при загрузке напрямую через DOM без единого моргания или React re-render
  const topWaveRef = useRef<HTMLDivElement>(null);
  const waveDoneRef = useRef(false);
  const blackBlockYRef = useRef(blackBlockY);
  blackBlockYRef.current = blackBlockY;

  useEffect(() => {
    if (waveDoneRef.current && topWaveRef.current) {
      topWaveRef.current.style.clipPath = `polygon(0 0, 100% 0, 100% ${blackBlockY}px, 0 ${blackBlockY}px)`;
    }
  }, [blackBlockY]);

  useEffect(() => {
    if (!heroReady) return;
    const el = topWaveRef.current;
    if (!el) return;
    const anim = el.animate(
      [
        { clipPath: "polygon(0 0, 100% 0, 100% 0vh, 0 0vh)" },
        { clipPath: "polygon(0 0, 100% 0, 100% 100vh, 0 100vh)" },
      ],
      { duration: 500, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" }
    );
    anim.onfinish = () => {
      waveDoneRef.current = true;
      el.style.clipPath = `polygon(0 0, 100% 0, 100% ${blackBlockYRef.current}px, 0 ${blackBlockYRef.current}px)`;
      anim.cancel();
    };
    return () => anim.cancel();
  }, [heroReady]);

  const { scrollY } = useScroll();
  const [vh200, setVh200] = useState(2000);
  useEffect(() => {
    setVh200(window.innerHeight * 2);
  }, []);
  const waveOffset = useTransform(scrollY, [0, vh200], [0, vh200], { clamp: true });

  useEffect(() => {
    const measure = () => {
      setVh(window.innerHeight);
      
      let currentLostScroll = 5 * window.innerHeight;
      
      if (appleRef.current) {
        const rect = appleRef.current.getBoundingClientRect();
        const absoluteY = rect.top + window.scrollY;
        setAppleY(absoluteY);
        setAppleBottom(absoluteY + rect.height);
        
        // Точный расчет замороженного скролла (высота контейнера минус 100vh sticky-экрана)
        currentLostScroll = rect.height - window.innerHeight;
        setLostScroll(currentLostScroll);
      }

      let currentBrandsLost = 0;
      if (brandsRef.current) {
        const rectB = brandsRef.current.getBoundingClientRect();
        const absoluteYB = rectB.top + window.scrollY;
        setBrandsY(absoluteYB);
        setBrandsBottom(absoluteYB + rectB.height);
        currentBrandsLost = rectB.height - window.innerHeight;
        setBrandsLost(currentBrandsLost);
      }

      if (roadmapRef.current) {
        // Абсолютная позиция черного блока
        const rect1 = roadmapRef.current.getBoundingClientRect();
        const absoluteY1 = rect1.top + window.scrollY;
        
        setBlackBlockY(absoluteY1);
        
        // Так как глобальная волна была "заморожена" на 700vh внутри секции с банками,
        // все последующие блоки должны быть смещены на эти 700vh, чтобы волна совпала.
        setPhaseOffset(absoluteY1 - currentLostScroll - currentBrandsLost);
        
        // Смещение волн белого фона теперь = (absoluteY1 - currentLostScroll + vh) % 900
        // Нижний блок (сертификаты и далее) поднят на 18vh, поэтому фазу волны сдвигаем на ту же величину
        const certPull = window.innerHeight * 0.18;
        setPhaseOffset3((((absoluteY1 - currentLostScroll - currentBrandsLost + window.innerHeight - certPull) % 900) + 900) % 900);
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
    <div className="min-h-[200vh] bg-white text-zinc-900 font-sans relative">
      
      {/* ЧАСТЬ 1: ФОНОВЫЕ ВОЛНЫ СЛЕВА (Скролляться на белом фоне) */}
      {USE_3D_HERO ? (
        <div className="absolute top-0 left-0 w-full h-[300vh] pointer-events-none z-40 hidden md:block">
          <div className="sticky top-0 w-full h-screen">
            <div 
              className="absolute top-0 left-[-30px] md:left-[-50px] lg:left-[-70px] w-[350px] mix-blend-difference"
              style={{ height: `${blackBlockY}px` }}
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
          </div>
        </div>
      ) : (
        <div 
          ref={topWaveRef}
          className="absolute inset-0 left-[-30px] md:left-[-50px] lg:left-[-70px] w-[350px] pointer-events-none z-40 mix-blend-difference hidden md:block"
          style={{ 
            clipPath: `polygon(0 0, 100% 0, 100% 0vh, 0 0vh)`,
            opacity: heroReady ? 1 : 0,
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
              <pattern id="wavePatternAfterApple" width="400" height="900" patternUnits="userSpaceOnUse" patternTransform={`translate(0, ${lostScroll})`}>
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
            <rect y="0" width="100%" height={appleY} fill="url(#wavePattern)" />
            <pattern id="wavePatternAfterBrands" width="400" height="900" patternUnits="userSpaceOnUse" patternTransform={`translate(0, ${lostScroll + brandsLost})`}>
              <g stroke="white" strokeWidth="2">
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(0, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(25, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(50, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(75, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(100, 0)" />
                <path d="M 30, 0 C 130, 270, 130, 360, 30, 450 C -70, 540, -70, 630, 30, 900" transform="translate(125, 0)" />
              </g>
            </pattern>
            <rect y={appleBottom} width="100%" height={Math.max(0, brandsY - appleBottom)} fill="url(#wavePatternAfterApple)" />
            <rect y={brandsBottom} width="100%" height={Math.max(0, blackBlockY - brandsBottom)} fill="url(#wavePatternAfterBrands)" />
          </svg>
        </div>
      )}

      {/* 1. ГЛОБАЛЬНЫЙ ЛЕТАЮЩИЙ ЛОГОТИП */}
      <div className="fixed top-10 z-[100] left-4 md:left-4 xl:left-6 h-12 w-fit flex items-center mix-blend-difference text-white pointer-events-auto">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={heroReady ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
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

      {USE_3D_HERO ? <HeroScroll3D /> : (
        <div className="relative w-full h-[100vh] bg-black flex flex-col justify-end pb-6 md:pb-8">
          <div ref={videoRef} className="absolute inset-0 w-full h-full z-0 bg-black">
            {HERO_MODE === "video" ? (
              <HeroImageSequence
                totalFrames={200}
                fps={30}
                folder="/scene_first"
                onReady={() => setHeroReady(true)}
              />
            ) : (
              <img
                src="/0005.png"
                alt="Element X Lab"
                onLoad={() => setHeroReady(true)}
                className="w-full h-full object-cover object-center select-none pointer-events-none"
              />
            )}
          {/* Теневой градиент снизу, чтобы белый текст всегда хорошо читался */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        </div>

        <main className="w-full max-w-[1150px] mx-auto px-6 md:px-8 relative z-30">
          <motion.div 
            className="w-full flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 lg:gap-8"
            initial={{ y: 60, opacity: 0 }}
            animate={heroReady ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
            transition={IN_VIEW_TRANSITION}
          >
            <div className="flex flex-col">
              <h1 className="text-[clamp(28px,3.5vw,42px)] font-bold leading-[1.1] tracking-tight text-white whitespace-nowrap drop-shadow-lg">
                Створіть косметику під своїм брендом
              </h1>
              <p className="text-[clamp(14px,1.75vw,21px)] mt-1.5 text-zinc-300 tracking-[0.01em] leading-relaxed whitespace-nowrap drop-shadow-md">
                Виробництво сертифікованих рецептур від технологів із десятилітнім досвідом
              </p>
            </div>
            
            <Link href="/contact" className="bg-white text-black px-6 py-4 rounded-full text-[16px] font-bold flex-1 md:flex-none md:w-auto md:px-10 text-center hover:scale-105 active:scale-95 transition-transform duration-300 ease-out flex items-center justify-center h-[52px] md:h-[58px]">
              Почати співпрацю
            </Link>
          </motion.div>
        </main>
      </div>
      )}

      {/* 4. АНИМИРОВАННЫЙ ТЕКСТ-ВОЛНА */}
      <section className="max-w-[1150px] mx-auto px-6 md:px-8 mt-14 pb-10">
        <ScrollRevealText />
      </section>

      {/* 5. СТАТИСТИКА */}
      <section className="max-w-[1150px] mx-auto px-6 md:px-8 pb-10 border-t border-zinc-200 pt-7 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-start justify-between gap-10"
        >
          <div>
            <h3 className="text-[clamp(32px,3.5vw,42px)] font-bold text-black mb-2 tracking-tight">10+</h3>
            <p className="text-[clamp(13px,1vw,14px)] text-zinc-500 max-w-[180px] leading-relaxed">Років експертизи в індустрії краси</p>
          </div>
          <div>
            <h3 className="text-[clamp(32px,3.5vw,42px)] font-bold text-black mb-2 tracking-tight">3,6+ млн</h3>
            <p className="text-[clamp(13px,1vw,14px)] text-zinc-500 max-w-[180px] leading-relaxed">Одиниць продукції виготовляємо щорічно</p>
          </div>
          <div>
            <h3 className="text-[clamp(32px,3.5vw,42px)] font-bold text-black mb-2 tracking-tight">500+</h3>
            <p className="text-[clamp(13px,1vw,14px)] text-zinc-500 max-w-[180px] leading-relaxed">Реалізованих проєктів та крос-промо кампаній</p>
          </div>
        </motion.div>
      </section>

      {/* 6. ФОРМУЛЫ (APPLE SCROLL С ЗАМОРАЖИВАЕМЫМ ЗАГОЛОВКОМ 500+ ФОРМУЛ) */}
      <div ref={appleRef} className="relative z-[50]">
        <AppleScrollSection appleY={appleY} />
      </div>



      {/* НАШІ БРЕНДИ (APPLE SCROLL EXPANSION) */}
      <div ref={brandsRef}>
        <BrandsAppleScrollSection waveShift={brandsY - lostScroll} />
      </div>

      {/* НОВЫЙ ДИЗАЙН ROADMAP (СБОРКА ФЛАКОНА) */}
      <RoadmapAssembly blackBlockRef={roadmapRef} phaseOffset={phaseOffset} />

      {/* 2) БЛОК "О ПРОИЗВОДСТВЕ" + ЕДИНАЯ ВОЛНА */}
      <div className="w-full relative -mt-[18vh]">
        <div className="w-full relative">
        
        {/* ЕДИНАЯ ВОЛНА СЛЕВА ДЛЯ СЕКЦИЙ ДО ОТЗЫВОВ (верхние 18vh обрезаны — там видна волна этапов) */}
        <div
          className="absolute top-0 bottom-0 left-[-30px] md:left-[-50px] lg:left-[-70px] w-[350px] pointer-events-none mix-blend-difference hidden md:block z-[85]"
          style={{ clipPath: 'inset(18vh 0 0 0)' }}
        >
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
        <section className="w-full pt-4 md:pt-6 pb-8 md:pb-12 relative">
          {/* Затемнение всего экрана при открытии сертификата (клик по фону закрывает его) */}
          <motion.div
            initial={false}
            animate={{ opacity: isCertHovered ? 1 : 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            onClick={handleCertClose}
            className={`fixed inset-0 bg-black/65 backdrop-blur-[3px] z-[80] ${
              isCertHovered ? 'pointer-events-auto cursor-zoom-out' : 'pointer-events-none'
            }`}
          />

          <div className="max-w-[1150px] mx-auto px-6 md:px-8 flex flex-col md:flex-row items-start justify-between gap-12 md:gap-20 relative">
            
            {/* Левая колонка (Текст и Аккордеон) */}
            <div className="w-full md:w-1/2 flex flex-col relative z-20">
              <div className="flex-shrink-0">
                <h2 className="text-[clamp(28px,3vw,36px)] font-bold tracking-tight text-black mb-4">
                  Сертифікація GMP
                </h2>
                <p className="text-[clamp(14px,1.2vw,15px)] text-zinc-500 leading-relaxed mb-8 max-w-[500px]">
                  Наше виробництво сертифіковане за міжнародним стандартом <span className="underline underline-offset-4 decoration-zinc-300">GMP (Good Manufacturing Practice)</span>. Це «золотий стандарт» індустрії, який гарантує суворий контроль на кожному етапі: від відбору сировини та умов зберігання до лабораторних випробувань готового продукту.
                </p>
              </div>
              
              <div className="flex flex-col w-full gap-2 md:gap-3">
                 <AccordionItem title="Нотифікація продуктів" content="Надаємо повний пакет документів відповідно до технічного регламенту для легальної реалізації продукції." />
                 <AccordionItem title="Вхідний контроль сировини" content="Кожна партія інгредієнтів проходить лабораторну перевірку на відповідність сертифікатам безпеки та фізико-хімічним показникам." />
                 <AccordionItem title="Аудит постачальників" content="Ми працюємо лише з перевіреними партнерами, які регулярно підтверджують високу якість своєї продукції та етичність виробництва." />
                 <AccordionItem title="Розробка та тестування формули" content="Створюємо ефективні рецептури та проводимо серію стрес-тестів, щоб гарантувати стабільність і дієвість продукту протягом усього терміну придатності." />
                 <AccordionItem title="Контроль якості готової продукції" content="Фінальний зразок з кожного замісу тестується на відповідність еталону за кольором, ароматом, текстурою та рівнем pH." />
                 <AccordionItem title="Перевірка паковання та маркування" content="Ми інспектуємо герметичність тари та точність інформації на етикетках, щоб ви отримали надійний і зрозумілий у використанні продукт." />
              </div>
            </div>

            {/* Правая колонка (Сертификат) */}
            <div className={`w-full md:w-1/2 flex justify-center md:justify-end relative ${isCertElevated ? 'z-[90]' : 'z-20'}`}>
              <motion.div
                ref={certWrapRef}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                onClick={handleCertToggle}
                className={`relative w-full max-w-[450px] ${isCertHovered ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              >
                <motion.img 
                  animate={{
                    x: certTransform.x,
                    y: certTransform.y,
                    scale: certTransform.scale,
                  }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  src="https://cdn.prod.website-files.com/69b2957a534625d1beb1cce7/69c4f72e83b4b8e066fcd250_GMP%20Certificate.jpg" 
                  alt="GMP Certificate" 
                  className="relative z-20 w-full object-contain drop-shadow-2xl"
                />
              </motion.div>
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
        <CollageAssembly />

        {/* ЗАЗИРНІТЬ ЗА ЛАШТУНКИ */}
        <section className="w-full pt-8 md:pt-12 pb-20 relative z-20 flex flex-col items-center">
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
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                className="mt-4 md:mt-7"
              >
                <Link href="/contact" className="bg-black text-white px-6 py-4 rounded-full text-[16px] font-bold w-full md:w-auto md:px-10 text-center hover:scale-105 active:scale-95 transition-transform duration-300 ease-out flex items-center justify-center h-[52px] md:h-[58px] whitespace-nowrap">
                  Запланувати візит
                </Link>
              </motion.div>
            </div>

            {/* ТРИ ВИДЕО РАЗДЕЛЕННЫЕ С ЗАКРУГЛЕНИЕМ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 lg:mt-10 w-full">
              {[1, 2, 3].map((num) => (
                <div key={num} className="w-full h-[350px] sm:h-[400px] md:h-[45vw] lg:h-[450px] xl:h-[500px] relative overflow-hidden rounded-[24px]">
                  <video 
                    suppressHydrationWarning
                    src={`/video${num}.mp4`} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover scale-[1.02]" 
                  />
                </div>
              ))}
            </div>

          </div>
        </section>
        </div>

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

  // Без пружины: карточки жестко привязаны к скроллу, поэтому в момент отлипания секции они уже стоят на месте и не "догоняют" страницу
  const smoothProgress = scrollYProgress;

  const smoothStep = (t: number) => {
    const c = Math.max(0, Math.min(1, t));
    return c * c * (3 - 2 * c);
  };

  // Карточка 1 уменьшается, а её текст уходит в блюр ТОЛЬКО когда секция уже закреплена и поднимается Карточка 2
  const scale1 = useTransform(smoothProgress, (p) => {
    const t = smoothStep((p - 0.02) / (0.48 - 0.02));
    return 1 - t * 0.1;
  });
  const contentOpacity1 = useTransform(smoothProgress, (p) => {
    if (containerRef.current && containerRef.current.getBoundingClientRect().top > 5) return 1;
    if (p <= 0.05) return 1;
    const t = smoothStep((p - 0.05) / (0.46 - 0.05));
    return 1 - t * 0.45;
  });
  const contentBlur1 = useTransform(smoothProgress, (p) => {
    if (containerRef.current && containerRef.current.getBoundingClientRect().top > 5) return "blur(0px)";
    if (p <= 0.05) return "blur(0px)";
    const t = smoothStep((p - 0.05) / (0.46 - 0.05));
    return `blur(${(t * 4.5).toFixed(2)}px)`;
  });

  // Карточка 2 выезжает и уменьшается, а её текст уходит в блюр по мере подъема Карточки 3
  const y2 = useTransform(smoothProgress, (p) => {
    const t = smoothStep((p - 0.02) / (0.48 - 0.02));
    return `${(1 - t) * 100}vh`;
  });
  const scale2 = useTransform(smoothProgress, (p) => {
    const t = smoothStep((p - 0.5) / (0.97 - 0.5));
    return 1 - t * 0.05;
  });
  const contentOpacity2 = useTransform(smoothProgress, (p) => {
    if (containerRef.current && containerRef.current.getBoundingClientRect().top > 5) return 1;
    if (p <= 0.53) return 1;
    const t = smoothStep((p - 0.53) / (0.95 - 0.53));
    return 1 - t * 0.45;
  });
  const contentBlur2 = useTransform(smoothProgress, (p) => {
    if (containerRef.current && containerRef.current.getBoundingClientRect().top > 5) return "blur(0px)";
    if (p <= 0.53) return "blur(0px)";
    const t = smoothStep((p - 0.53) / (0.95 - 0.53));
    return `blur(${(t * 4.5).toFixed(2)}px)`;
  });

  // Карточка 3 встает на место почти в самом конце закрепления (0.97) — без лишней паузы, секция отлипает сразу
  const y3 = useTransform(smoothProgress, (p) => {
    const t = smoothStep((p - 0.5) / (0.97 - 0.5));
    return `${(1 - t) * 100}vh`;
  });
  
  return (
    <>
    <section ref={containerRef} className="w-full h-[300vh] relative z-20 bg-white">
      {/* Прибиваем экран (заморозка) */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center">

        {/* ЗАГОЛОВОК ВІДГУКІВ */}
        <div className="absolute top-[4vh] w-full px-6 md:px-8 text-center z-30 pointer-events-none">
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
        <div className="absolute bottom-[2vh] md:bottom-[4vh] w-full overflow-hidden z-0">
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

        {/* Карточка 1 (Make Up) - Теплое матовое стекло (z-20) */}
        <motion.div 
          style={{ scale: scale1, top: '15vh', transformOrigin: 'top center' }}
          className="absolute w-full px-6 md:px-8 flex justify-center z-20" 
        >
          <div
            style={{
              backgroundColor: 'rgba(252, 251, 249, 0.65)',
            }}
            className="w-full max-w-[1000px] h-[60vh] md:h-[450px] py-10 px-8 md:px-16 backdrop-blur-md rounded-[40px] shadow-[0_24px_60px_rgba(28,25,23,0.07),inset_0_1.5px_1px_rgba(255,255,255,0.98),inset_0_-1px_1px_rgba(0,0,0,0.03)] border border-[#E5E2DC]/80 flex flex-col items-center justify-center"
          >
            <motion.div
              style={{ opacity: contentOpacity1, filter: contentBlur1 }}
              className="flex flex-col items-center justify-center gap-6 md:gap-8 w-full"
            >
              <p className="text-[clamp(14px,1.5vw,18px)] font-normal text-center leading-relaxed text-zinc-900 max-w-[850px]">
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
                  <span className="font-bold text-black text-base md:text-lg">Максим Богдюк</span>
                  <span className="text-zinc-600 text-xs md:text-sm">Make Up</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Карточка 2 (Eva) - Теплое матовое стекло (z-30) */}
        <motion.div 
          style={{ y: y2, scale: scale2, top: '20vh', transformOrigin: 'top center' }}
          className="absolute w-full px-6 md:px-8 flex justify-center z-30"
        >
          <div
            style={{
              backgroundColor: 'rgba(252, 251, 249, 0.65)',
            }}
            className="w-full max-w-[1000px] h-[60vh] md:h-[450px] py-10 px-8 md:px-16 backdrop-blur-md rounded-[40px] shadow-[0_28px_70px_rgba(28,25,23,0.08),inset_0_1.5px_1px_rgba(255,255,255,0.98),inset_0_-1px_1px_rgba(0,0,0,0.03)] border border-[#E5E2DC]/80 flex flex-col items-center justify-center"
          >
            <motion.div
              style={{ opacity: contentOpacity2, filter: contentBlur2 }}
              className="flex flex-col items-center justify-center gap-6 md:gap-8 w-full"
            >
              <p className="text-[clamp(14px,1.5vw,18px)] font-normal text-center leading-relaxed text-zinc-900 max-w-[850px]">
                "За що мені подобається працювати з вами? Бо ви профі, в яких завжди є рішення, за те що ви динамічні і шукаєте нові шляхи! За ваші перевірені формули та знання трендів ринку"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl flex items-center justify-center text-lg md:text-xl font-bold shadow-sm border border-zinc-200">
                  <span className="text-[#FF8C00]">é</span><span className="text-[#00B050]">va</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-black text-base md:text-lg">Катерина Кучер</span>
                  <span className="text-zinc-600 text-xs md:text-sm">Eva</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Карточка 3 (Avrora) - Теплое матовое стекло (z-40) */}
        <motion.div 
          style={{ y: y3, top: '25vh', transformOrigin: 'top center' }}
          className="absolute w-full px-6 md:px-8 flex justify-center z-40"
        >
          <div
            style={{
              backgroundColor: 'rgba(252, 251, 249, 0.65)',
            }}
            className="w-full max-w-[1000px] h-[60vh] md:h-[450px] py-10 px-8 md:px-16 backdrop-blur-md rounded-[40px] shadow-[0_32px_80px_rgba(28,25,23,0.09),inset_0_1.5px_1px_rgba(255,255,255,0.98),inset_0_-1px_1px_rgba(0,0,0,0.03)] border border-[#E5E2DC]/80 flex flex-col items-center justify-center gap-6 md:gap-8"
          >
            <p className="text-[clamp(14px,1.5vw,18px)] font-normal text-center leading-relaxed text-zinc-900 max-w-[850px]">
              "Від імені компанії хочу подякувати вам за співпрацю! Ми цінуємо ваше розуміння ринку і системний підхід до виконання задач. Окремо дякую за те, що ми на одній хвилі в плані розвитку і трендів. Дуже рада мати змогу працювати з вами."
            </p>
            <div className="flex items-center gap-4">
              <img src="/avrora-logo.jpg" alt="Avrora" className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-2xl shadow-sm border border-zinc-200" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-black text-base md:text-lg">Дарина Малиновська</span>
                <span className="text-zinc-600 text-xs md:text-sm">Avrora</span>
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
            <section className="w-full min-h-[60vh] md:h-[60vh] relative z-20 flex flex-col md:flex-row justify-between items-center md:items-end px-6 md:px-24 pt-16 md:pt-0">
        
        {/* Текст слева */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-6 md:gap-8 max-w-[600px] pb-10 md:pb-20 z-10 text-left self-start md:self-center mt-auto md:mt-8 md:ml-12 lg:ml-24"
        >
          <h2 className="text-[clamp(36px,4vw,56px)] leading-[1.1] font-bold tracking-tight w-full text-black">
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
          <div className="flex flex-col gap-4 text-[clamp(16px,1.2vw,18px)] text-zinc-600 font-medium">
            <p>Від розробки формули до підготовки сертифікації.</p>
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
          className="w-[85vw] md:w-[35vw] max-w-[600px] h-auto object-contain pointer-events-none self-end" 
          style={{ marginBottom: '-2px' }} 
        />
      </section>

      
      {/* FOOTER */}
                  <section 
        ref={footerRef}
        className="w-full relative z-30 bg-black rounded-t-[32px] md:rounded-t-[64px] flex flex-col pt-2 md:pt-4 overflow-hidden pb-[2.7vw] md:pb-[1.8vw]"
      >
          {/* Контентный слой */}
          <div className="flex flex-col md:flex-row w-full px-6 md:px-12 z-10 relative pb-6 md:pb-8 mt-4 md:mt-0 items-center md:items-start gap-12 md:gap-0">
             
             {/* Left: Button */}
             <div className="flex-1 w-full flex items-center justify-start md:ml-[20%] mt-6 md:mt-16 z-20">
                <Link href="/contact" className="relative group flex animate-pulse-sync-v2">
                  
                  <span className="relative overflow-hidden flex items-center justify-center bg-zinc-200 text-black px-8 py-4 rounded-[32px] font-semibold text-[clamp(16px,1vw,18px)] uppercase hover:scale-105 active:scale-95 transition-transform duration-300 ease-out">
                    
                    {/* Эффект постоянного блика */}
                    <span className="absolute top-0 bottom-0 left-0 w-[150%] bg-gradient-to-r from-transparent via-white to-transparent animate-shine-v2 pointer-events-none z-0 opacity-100"></span>
                    
                    {/* Текст поверх блика */}
                    <span className="relative z-10 flex items-center justify-center">
                      Почати співпрацю
                    </span>
                  </span>
                </Link>
             </div>

             {/* Right: Contact info & Socials */}
             <div className="flex-none flex flex-col text-white text-left gap-2 pt-0 md:pt-4">
               {/* Social Icons */}
               <div className="flex items-center gap-4 mb-4 md:mb-6">
                 
                 <a href="https://www.instagram.com/elementxlab/" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-80 transition-opacity">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                     <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                     <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                   </svg>
                 </a>
               </div>

               {/* Text */}
               <a href="mailto:hello@elementxlab.com" className="group relative w-fit text-[clamp(24px,3vw,36px)] font-bold mb-2 pb-1">
                 hello@elementxlab.com
                 <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
               </a>
               <a href="tel:+380689316478" className="group relative w-fit text-white text-[clamp(14px,1.2vw,16px)] font-medium pb-1 mt-1">
                 +38 (068) 931 64 78
                 <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
               </a>
               <a href="https://maps.google.com/?q=Вишгород,+Борисо-Глібська+57Б" target="_blank" rel="noopener noreferrer" className="group relative w-fit text-zinc-300 text-[clamp(14px,1.2vw,16px)] pb-1 mt-1">
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



import { RoadmapAssembly } from './RoadmapAssembly';
import { CollageAssembly } from './CollageAssembly';

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

// Спеціальний двоколонковий аккордеон для секції FAQs
const FaqAccordionItem = ({ title, content }: { title: string, content: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="w-full border-b border-zinc-200 py-4 md:py-5 last:border-0 group cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between w-full gap-4 md:gap-8">
        {/* Left column: Question */}
        <div className="w-full md:w-[45%] pr-4">
          <h3 className={`text-[clamp(15px,1.1vw,18px)] font-bold transition-colors duration-300 ${isOpen ? 'text-black' : 'text-zinc-500 group-hover:text-black'}`}>
            {title}
          </h3>
        </div>
        
        {/* Right column: Answer + Plus Icon */}
        <div className="w-full md:w-[50%] flex flex-row items-start justify-end md:justify-between">
          <div className="w-[90%] text-left">
            <motion.div
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              className="overflow-hidden"
            >
              <div className="pb-4 text-[clamp(14px,1vw,15px)] leading-relaxed text-zinc-500 flex flex-col gap-3">
                {content}
              </div>
            </motion.div>
          </div>
          
          {/* Plus icon */}
          <div className="text-zinc-400 relative w-4 h-4 flex items-center justify-center flex-shrink-0 group-hover:text-black transition-colors md:mt-1">
            <motion.span 
              animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }} 
              transition={{ duration: 0.2 }}
              className="absolute w-[2px] h-3 bg-current"
            />
            <motion.span className="absolute w-3 h-[2px] bg-current" />
          </div>
        </div>
      </div>
    </div>
  );
};


