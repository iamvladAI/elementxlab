"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

interface BrandItem {
  id: string;
  name: string;
  category: string;
  tagline: string;
  logo: string;
  description: string;
  logoScale: string;
  logoMaxW: string;
}

const BRANDS: BrandItem[] = [
  {
    id: "replique",
    name: "Replique",
    category: "Концептуальна парфумерія",
    tagline: "Нішеві композиції",
    logo: "/replique.svg",
    description:
      "Колекція концептуальних парфумерних композицій, що охоплює широку палітру ароматів — від легких свіжих та квіткових до глибоких гурманських.",
    logoScale: "scale-100",
    logoMaxW: "max-w-[240px] lg:max-w-[280px]",
  },
  {
    id: "mermade",
    name: "Mermade",
    category: "Догляд та подорожі",
    tagline: "Travel & lifestyle beauty",
    logo: "/marmade.svg",
    description:
      "Яскраві засоби для догляду за собою та подорожей, що створюють настрій, дарують емоції та перетворюють б'юті-рутину на справжнє задоволення.",
    logoScale: "scale-100",
    logoMaxW: "max-w-[250px] lg:max-w-[290px]",
  },
  {
    id: "hydrasence",
    name: "Hydrasence",
    category: "Дерматокосметика",
    tagline: "Цільовий догляд",
    logo: "/hydrasence.svg",
    description:
      "Інноваційні рішення для базового догляду за шкірою та волоссям, серед яких — спеціалізована серія стимуляторів росту волосся з екстрактом розмарину.",
    logoScale: "scale-[1.3] translate-y-[4px]",
    logoMaxW: "max-w-[270px] lg:max-w-[320px]",
  },
];

export default function BrandsAppleScrollSection({ waveShift = 0 }: { waveShift?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start start"],
  });
  // Фаза выхода: 0 — верх секции у верха экрана, 1 — секция полностью ушла вверх
  const { scrollYProgress: exitProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // t: 0 — маленький островок, 1 — на весь экран. Растёт при входе, уменьшается при выходе.
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
  const t = useTransform([scrollYProgress, exitProgress], (latest) => {
    const [e, x] = latest as number[];
    return clamp01((e - 0.32) / 0.4) - clamp01((x - 0.3) / 0.55);
  });

  // 1. Вводный верхний заголовок секции: плавно уходит вверх при скролле
  const headerOpacity = useTransform(scrollYProgress, [0.0, 0.2], [1, 0]);
  const headerY = useTransform(scrollYProgress, [0.0, 0.2], [0, -35]);

  // 2. Интерактивная карточка (эффект MacBook Neo):
  // От закругленного островка в центре до 100% ширины и высоты экрана с прямыми углами
  const cardWidth = useTransform(t, (v) => `${88 + 12 * v}vw`);
  const cardHeight = useTransform(t, (v) => `${74 + 26 * v}vh`);
  const cardRadius = useTransform(t, (v) => `${36 * (1 - v)}px`);

  // Заголовок «выталкивается» растущим фото и всегда стоит ровно над его верхним краем
  const headingBottom = useTransform(
    cardHeight,
    (h) => `calc(50vh + ${parseFloat(h as string) / 2}vh + 14px)`
  );

  // 3. Плавное затемнение фотографии при расширении
  const darkOverlay = useTransform(t, (v) => v);

  // 4. Появление информации о 3 брендах поверх затемненной фотографии
  const contentOpacity = useTransform(scrollYProgress, [0.36, 0.56], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.36, 0.56], [32, 0]);

  // 5. Аккуратный стеклянный бейдж "НАШІ БРЕНДИ" вверху при полном развороте на экран
  const badgeOpacity = useTransform(scrollYProgress, [0.44, 0.58], [0, 1]);

  const [showContent, setShowContent] = useState(false);
  useMotionValueEvent(t, "change", (v) => {
    setShowContent(v >= 0.98);
  });

  return (
    <section ref={containerRef} className="relative w-full h-screen bg-white z-[60]">
      <div className="sticky top-0 w-full h-screen overflow-x-clip flex items-center justify-center">
        {/* Заголовок на белом фоне: фото наезжает сверху и перекрывает его */}
        <motion.div
          style={{ bottom: headingBottom }}
          className="absolute left-0 w-full flex flex-col items-center justify-center z-0 pointer-events-none px-6 text-center"
        >
          <h2 className="text-[clamp(28px,3vw,36px)] font-bold tracking-tight text-black">
            Наші бренди
          </h2>
        </motion.div>

        {/* ЗАМОРОЖЕННАЯ ВОЛНА СЛЕВА: стоит неподвижно, пока идёт разворот фото */}
        <div className="absolute inset-0 left-[-30px] md:left-[-50px] lg:left-[-70px] w-[350px] pointer-events-none hidden md:block z-30">
          <svg className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="wavePatternBrandsFrozen" width="400" height="900" patternUnits="userSpaceOnUse" patternTransform={`translate(0, -${waveShift})`}>
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
            <rect width="100%" height="100%" fill="url(#wavePatternBrandsFrozen)" />
          </svg>
        </div>

        {/* Apple-карточка со скруглением и анимацией на весь экран */}
        <motion.div
          style={{
            width: cardWidth,
            height: cardHeight,
            borderRadius: cardRadius,
          }}
          className="relative overflow-hidden shadow-2xl flex items-center justify-center bg-zinc-950 will-change-[width,height,border-radius]"
        >
          {/* Склеенное композитное фото брендов (Replique + Mermade + Hydrasence) */}
          <img
            src="/brands_composite.jpg"
            alt="Наші бренди — Replique, Mermade, Hydrasence"
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          />

          {/* Затемняющий оверлей с кинематографичным вертикальным градиентом */}
          <motion.div
            style={{ opacity: darkOverlay }}
            className="absolute inset-0 grid grid-cols-3 pointer-events-none z-10"
          >
            {BRANDS.map((brand, idx) => (
              <div
                key={brand.id}
                className={`bg-gradient-to-b from-black/75 via-black/45 to-black/80 transition-opacity duration-500 ${
                  hoveredIdx === idx ? "opacity-0" : "opacity-100"
                }`}
              />
            ))}
          </motion.div>



          {/* 3 колонки брендов */}
          <motion.div
            initial={false}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-20 w-full h-full grid grid-cols-3"
          >
            {BRANDS.map((brand, idx) => {
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={brand.id}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`group relative h-full flex flex-col justify-between items-center px-6 md:px-10 py-[11vh] cursor-pointer ${
                    isHovered ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {/* Мягкая интерактивная подсветка колонки при наведении */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
                      isHovered ? "bg-white/10 backdrop-brightness-110" : "bg-transparent"
                    }`}
                  />

                  {/* Верхняя часть колонки: Категория и Логотип */}
                  <div className="absolute top-0 inset-x-0 z-20 flex flex-col items-center text-center px-6 md:px-10">
                    <div className="w-full flex justify-center items-center h-[18vh]">
                      <img
                        src={brand.logo}
                        alt={`${brand.name} Logo`}
                        className={`w-full h-full object-contain brightness-0 invert drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)] transition-all duration-500 pointer-events-none ${brand.logoScale} ${brand.logoMaxW}`}
                      />
                    </div>
                  </div>

                  {/* Нижняя часть колонки: Описание продукта */}
                  <div className="relative z-20 flex flex-col items-center text-center w-full max-w-[380px] px-2 mb-2 mt-auto">
                    <p className="text-[clamp(13px,1vw,15px)] text-white leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] transition-opacity duration-300">
                      {brand.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
