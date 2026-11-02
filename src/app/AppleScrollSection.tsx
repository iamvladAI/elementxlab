'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, MotionValue, useSpring, useInView, animate } from 'framer-motion';

const AnimatedCounter = ({ from, to, duration }: { from: number; to: number; duration: number }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: false, margin: "0px" });

  useEffect(() => {
    if (!inView) {
      if (nodeRef.current) nodeRef.current.textContent = from.toString();
      return;
    }
    const controls = animate(from, to, {
      duration,
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

// --- ДАННЫЕ ---
const products = [
  {
    id: 'face',
    title: 'Для обличчя',
    tags: [
      'Гідрогелеві патчі', 'Сироватки', 'Гідрофільна олія', 'Креми', 
      'Гелі для вмивання', 'Маски', 'Зволожуючі місти', 'Тонери', 
      'Блиски для губ', 'Тінти', 'Бальзами для губ', 'Точкові засоби'
    ],
    is3D: true, 
    videoFolder: 'patch_video',
    totalFrames: 200,
    staticImage: null,
    scrollMap: [0, 0.20, 0.20, 0.38]
  },
  {
    id: 'hair',
    title: 'Для волосся',
    tags: ['Шампуні', 'Бальзами', 'Маски для волосся', 'Сироватки для кінчиків', 'Термозахист', 'Пілінги для шкіри голови', 'Сухі шампуні', 'Олії'],
    is3D: true,
    videoFolder: 'for_head_video',
    totalFrames: 180,
    staticImage: null, 
    scrollMap: [0.18, 0.37, 0.37, 0.56]
  },
  {
    id: 'body',
    title: 'Для тіла',
    tags: ['Гелі для душу', 'Скраби для тіла', 'Лосьйони', 'Батери', 'Олії для тіла', 'Креми для рук', 'Антицелюлітні засоби', 'Сіль для ванн'],
    is3D: true,
    videoFolder: 'cream_video',
    totalFrames: 180,
    staticImage: null,
    scrollMap: [0.40, 0.59, 0.59, 0.78]
  },
  {
    id: 'perfume',
    title: 'Парфуми',
    tags: ['Парфумована вода', 'Туалетна вода', 'Тверді парфуми', 'Місти для тіла', 'Аромадифузори для дому', 'Спреї'],
    is3D: true,
    videoFolder: 'parfume_video/parfume',
    totalFrames: 180,
    staticImage: null,
    scrollMap: [0.62, 0.96, 1.0, 1.0] 
  }
];

// --- ЕДИНАЯ «ЛЕНТА» (КОНВЕЙЕР) В СТИЛЕ MACBOOK NEO ---
// Все баночки стоят на одной ленте с фиксированным шагом BOTTLE_GAP (vh), поэтому физически
// не могут наехать друг на друга: следующая появляется снизу только когда предыдущая уходит вверх.
// Лента не останавливается полностью — у каждой баночки в центре лишь мягко замедляется (~45% скорости).
const BOTTLE_GAP = 125; // vh между центрами соседних баночек
// Моменты скролла (earlyScroll), когда баночка i ровно в центре экрана
const CENTER_KNOTS = [0.18, 0.455, 0.73, 1.0];

const easeSoft = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  const s = c * c * (3 - 2 * c);
  return 0.45 * c + 0.55 * s;
};

// Позиция ленты (в vh): 0 = первая баночка в центре, BOTTLE_GAP * i = баночка i в центре
const conveyorAt = (p: number) => {
  if (p <= 0) return -10;
  if (p < CENTER_KNOTS[0]) return -10 + 10 * easeSoft(p / CENTER_KNOTS[0]);
  for (let i = 1; i < CENTER_KNOTS.length; i++) {
    if (p < CENTER_KNOTS[i]) {
      const t = (p - CENTER_KNOTS[i - 1]) / (CENTER_KNOTS[i] - CENTER_KNOTS[i - 1]);
      return BOTTLE_GAP * (i - 1) + BOTTLE_GAP * easeSoft(t);
    }
  }
  return BOTTLE_GAP * (CENTER_KNOTS.length - 1);
};

// Положение баночки i на экране (vh): >0 ниже центра, <0 выше центра
const bottleY = (p: number, i: number) => BOTTLE_GAP * i - conveyorAt(p);

// Текст привязан к положению СВОЕЙ баночки: появляется, только когда баночка почти доехала до центра,
// и уходит вверх строго вместе с ней (никогда раньше и никогда позже)
const textOpacityFromY = (y: number) => {
  if (y > 0) return 1 - easeSoft((y - 6) / 30); // полностью виден при y < 6vh, исчезает к 36vh
  return 1 - easeSoft(-y / 40); // уходит вместе с баночкой, исчезает к -40vh
};
const textYFromY = (y: number) => (y > 0 ? 2 + y * 0.4 : 2 + y * 0.65);

interface AppleScrollSectionProps {
  appleY?: number;
}

export default function AppleScrollSection({ appleY = 0 }: AppleScrollSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // НОВЫЙ СКРОЛЛ: Начинает отсчет за 40% до того, как секция прилипнет к верху экрана
  const { scrollYProgress: earlyScroll } = useScroll({
    target: containerRef,
    offset: ["start 40%", "end end"]
  });

  // ДОБАВЛЯЕМ ОТЗЫВЧИВУЮ АМОРТИЗАЦИЮ (СГЛАЖИВАНИЕ)
  const springConfig = { stiffness: 260, damping: 35, mass: 0.35, restDelta: 0.001 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);
  const smoothEarly = useSpring(earlyScroll, springConfig);

  // Заголовок «500+ перевірених формул» стоит замороженным на линии логотипа (top-10 h-12)
  // и уезжает вверх синхронно с текстом 1-й баночки («Для обличчя»)
  const headingY = useTransform(smoothEarly, (p) => {
    const y = bottleY(p, 0);
    if (y >= 0) return "0vh";
    return `${y * 0.65}vh`;
  });
  const headingOpacity = useTransform(smoothEarly, (p) => {
    const y = bottleY(p, 0);
    if (y >= 0) return 1;
    return textOpacityFromY(y);
  });

  return (
    <div ref={containerRef} className="relative w-full h-[430vh] bg-transparent z-20">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        
        {/* ЗАГОЛОВОК 500+ ФОРМУЛ (ровняется с логотипом на top-10 h-12, замораживается и уезжает вверх вместе с «Для обличчя») */}
        <motion.div
          style={{ y: headingY, opacity: headingOpacity }}
          className="absolute top-10 inset-x-0 h-12 flex items-center justify-center z-30 pointer-events-none px-6 md:px-8 will-change-transform"
        >
          <h2 className="text-[clamp(28px,3.2vw,42px)] font-bold tracking-tight text-black leading-none flex justify-center items-center drop-shadow-sm m-0">
            <span className="inline-flex justify-end w-[2.2em] md:w-[2.4em] tabular-nums">
              <AnimatedCounter from={1} to={500} duration={1.5} />
            </span>
            <span className="ml-1 mr-2 md:mr-3">+</span>
            <WipeText text="перевірених формул" />
          </h2>
        </motion.div>
        
        {/* ЗАМОРОЖЕННАЯ ВОЛНА СЛЕВА (НАСТОЯЩАЯ СТИКИ ВОЛНА ДЛЯ ПЛАВНОСТИ) */}
        <div className="absolute top-0 bottom-0 left-[-30px] md:left-[-50px] lg:left-[-70px] w-[350px] pointer-events-none hidden md:block z-10">
          <svg className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="wavePatternAppleFrozen" width="400" height="900" patternUnits="userSpaceOnUse" patternTransform={`translate(0, -${appleY})`}>
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
            <rect width="100%" height="100%" fill="url(#wavePatternAppleFrozen)" />
          </svg>
        </div>

        {products.map((product, i) => (
          <ProductLayer 
            key={product.id} 
            product={product} 
            scrollYProgress={smoothProgress} 
            earlyScroll={smoothEarly}
            index={i} 
          />
        ))}
      </div>
    </div>
  );
}

function ProductLayer({ product, scrollYProgress, earlyScroll, index }: { 
  product: any, 
  scrollYProgress: MotionValue<number>, 
  earlyScroll: MotionValue<number>,
  index: number 
}) {
  const [inStart, inEnd, outStart, outEnd] = product.scrollMap;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnFrameRef = useRef<number>(-1);

  // ОБЪЕДИНЕННАЯ ЛОГИКА ДЛЯ ИДЕАЛЬНОЙ СИНХРОНИЗАЦИИ
  // Используем ОДИН И ТОТ ЖЕ scrollSource для всех банок, чтобы их скорости и тайминги ИДЕАЛЬНО совпадали!
  const scrollSource = earlyScroll;

  // Отзывчивая кривая с мгновенным откликом на движение тачпада (без «вязкого» старта)
  const smoothStep = (t: number) => {
    const c = Math.max(0, Math.min(1, t));
    const s = c * c * (3 - 2 * c);
    return 0.45 * c + 0.55 * s;
  };

  // КАРТИНКА: позиция берётся с общей ленты — баночки идут друг за другом с шагом BOTTLE_GAP и не наезжают
  const yImage = useTransform(scrollSource, (p) => {
    const y = Math.max(-140, Math.min(140, bottleY(p, index)));
    return `${y}vh`;
  });

  const opacityImage = useTransform(scrollSource, (p) => {
    const y = bottleY(p, index);
    return y < -135 || y > 135 ? 0 : 1;
  });

  // ТЕКСТ: привязан к положению своей баночки (появляется, когда баночка доехала, и уходит вместе с ней)
  const tTextInStart = 0.02;
  const tTextInEnd = 0.14;

  const yText = useTransform(scrollSource, (p) => {
    const y = bottleY(p, index);
    if (index === 0 && y >= 0) {
      // Первая баночка уже на экране с самого начала — текст плавно выезжает по скроллу
      const t = smoothStep((p - tTextInStart) / (tTextInEnd - tTextInStart));
      return `${14 - 12 * t}vh`;
    }
    return `${textYFromY(y)}vh`;
  });

  const opacityText = useTransform(scrollSource, (p) => {
    const y = bottleY(p, index);
    if (index === 0 && y >= 0) {
      return smoothStep((p - tTextInStart) / (tTextInEnd - tTextInStart));
    }
    return textOpacityFromY(y);
  });

  // АНИМАЦИЯ КАДРОВ: проигрывается пока баночка подъезжает снизу к центру и заканчивается ровно в центре
  const firstFrame = product.id === 'perfume' ? 36 : 1;
  const lastFrame = product.totalFrames || (product.id === 'face' ? 200 : 180);
  const frameFloat = useTransform(scrollSource, (p) => {
    let t: number;
    if (index === 0) {
      t = p / CENTER_KNOTS[0];
    } else {
      const y = bottleY(p, index);
      t = (95 - y) / 95; // от y = 95vh (въезд снизу) до y = 0 (центр)
    }
    t = Math.max(0, Math.min(1, t));
    return firstFrame + (lastFrame - firstFrame) * t;
  });

  const drawFrame = (frameNum: number) => {
    const clamped = Math.max(firstFrame, Math.min(lastFrame, frameNum));
    if (clamped === lastDrawnFrameRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = imagesRef.current[clamped];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    lastDrawnFrameRef.current = clamped;
  };

  // Предзагрузка и сохранение ссылок на кадры в памяти (последовательно по индексу банки),
  // чтобы сборщик мусора не выгружал текстуры и не вызывал фризы при переходе между банками
  useEffect(() => {
    if (!product.is3D) return;
    let cancelled = false;
    const arr: HTMLImageElement[] = new Array(lastFrame + 1);
    imagesRef.current = arr;

    const startDelay = 400 + index * 350;
    const timer = setTimeout(() => {
      if (cancelled) return;
      for (let i = firstFrame; i <= lastFrame; i++) {
        const img = new Image();
        img.decoding = 'async';
        img.src = `/${product.videoFolder}/${String(i).padStart(4, '0')}.png`;
        if (i === firstFrame) {
          img.onload = () => {
            if (!cancelled) drawFrame(firstFrame);
          };
        }
        arr[i] = img;
      }
    }, startDelay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [product.is3D, product.videoFolder, firstFrame, lastFrame, index]);

  // Обновляем canvas напрямую без вызовов setState (ноль ререндеров React при скролле)
  useMotionValueEvent(frameFloat, "change", (latest) => {
    if (product.is3D) {
      drawFrame(Math.round(latest));
    }
  });

  // Когда секция банки приближается по скроллу, заранее декодируем первые кадры в GPU
  const predecodedRef = useRef(false);
  useMotionValueEvent(scrollSource, "change", (p) => {
    if (!predecodedRef.current && p >= Math.max(0, inStart - 0.18) && p <= outEnd) {
      predecodedRef.current = true;
      const arr = imagesRef.current;
      for (let i = firstFrame; i <= lastFrame; i++) {
        const img = arr[i];
        if (img && img.complete && typeof img.decode === 'function') {
          img.decode().catch(() => {});
        }
      }
    }
  });

  return (
    <motion.div 
      className="absolute inset-0 flex flex-row items-center justify-center px-4 md:px-10 pointer-events-none"
    >
      {/* ЛЕВАЯ ЧАСТЬ: Текст списком (сдвинут вправо) */}
      <motion.div 
        className="w-1/2 flex flex-col items-start gap-3 pl-[8vw] md:pl-[12vw] z-30 will-change-transform"
        style={{ y: yText, opacity: opacityText }}
      >
        <h2 className="text-[clamp(28px,3.5vw,48px)] font-bold text-black tracking-tight drop-shadow-sm">
          {product.title}
        </h2>
        
        {/* Чистый список в 2 столбика с плотным прилеганием */}
        <ul className="grid grid-cols-[auto_auto] gap-x-6 md:gap-x-10 gap-y-2 mt-2 w-max">
          {product.tags.map((tag: string) => (
            <li 
              key={tag} 
              className="text-[clamp(13px,1.1vw,17px)] text-zinc-600 font-medium tracking-tight leading-snug"
            >
              &bull; {tag}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* ПРАВАЯ ЧАСТЬ: Огромная Картинка/3D на аппаратном Canvas */}
      <motion.div 
        className="w-1/2 flex items-center justify-center relative z-20 mb-[10vh] will-change-transform"
        style={{ y: yImage, opacity: opacityImage }}
      >
        {product.is3D ? (
          <canvas
            ref={canvasRef}
            width={1440}
            height={810}
            className={`w-[140%] max-w-[800px] xl:max-w-[1000px] origin-center object-contain drop-shadow-2xl translate-x-[-10%] ${
              product.id === 'face'
                ? 'scale-[1.0] md:scale-[1.12]'
                : product.id === 'perfume'
                ? 'scale-[1.08] md:scale-[1.2]'
                : product.id === 'body'
                ? 'scale-[1.15] md:scale-[1.3]'
                : product.id === 'hair'
                ? 'scale-[1.22] md:scale-[1.4]'
                : 'scale-[1.3] md:scale-[1.5]'
            } ${
              product.id === 'hair' ? 'translate-y-[8%]' : ''
            }`}
          />
        ) : (
          <img 
            src={product.staticImage} 
            alt={product.title}
            className="w-[140%] max-w-[800px] xl:max-w-[1000px] scale-[1.3] md:scale-[1.5] origin-center object-contain drop-shadow-2xl translate-x-[-10%]"
          />
        )}
      </motion.div>
    </motion.div>
  );
}
