"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.8 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as any } }
};

// Летучие мыши на экране успешной заявки (как на recare.com.ua):
// каждая мышь периодически получает новую случайную точку, а CSS transition плавно ведёт её туда.
const BAT_COUNT = 5;
const BAT_SPEED = 220; // пикселей в секунду — одинаковая скорость для любого расстояния

function FlyingBats({ spawnRef }: { spawnRef: React.RefObject<HTMLDivElement | null> }) {
  const [bats, setBats] = useState<{ x: number; y: number; duration: number; launched: boolean }[]>([]);

  useEffect(() => {
    const getSpawnPos = () => {
      if (spawnRef.current) {
        const rect = spawnRef.current.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - 24,
          y: rect.top + rect.height / 2 - 24,
        };
      }
      return {
        x: window.innerWidth / 2 - 24,
        y: window.innerHeight / 2 - 80,
      };
    };

    const randomPos = () => ({
      x: Math.random() * (window.innerWidth - 48),
      y: Math.random() * (window.innerHeight - 48),
    });

    // Изначально все 5 мышей спрятаны ровно за чёрным кругом с галочкой
    const initial = getSpawnPos();
    const positions = Array.from({ length: BAT_COUNT }, () => ({
      x: initial.x,
      y: initial.y,
      duration: 0,
      launched: false,
    }));
    setBats([...positions]);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const move = (i: number) => {
      const next = randomPos();
      // Время перелёта = расстояние / скорость
      const dist = Math.hypot(next.x - positions[i].x, next.y - positions[i].y);
      const duration = Math.max(0.3, dist / BAT_SPEED);
      positions[i] = { ...next, duration, launched: true };
      setBats([...positions]);
      timers[i] = setTimeout(() => move(i), duration * 1000);
    };
    for (let i = 0; i < BAT_COUNT; i++) {
      timers[i] = setTimeout(() => move(i), 350 + i * 180);
    }
    return () => timers.forEach(clearTimeout);
  }, [spawnRef]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {bats.map((b, i) => (
        <img
          key={i}
          src="/bat.gif"
          alt=""
          className="absolute top-0 left-0 w-12 h-12 will-change-transform"
          style={{
            opacity: b.launched ? 1 : 0,
            transform: `translate(${b.x}px, ${b.y}px)`,
            transition: `transform ${b.duration}s linear`,
          }}
        />
      ))}
    </div>
  );
}

const founderContainerVariants = {
  visible: { transition: { staggerChildren: 0.02, delayChildren: 0.3 } }
};

const founderCharVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export default function ContactPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFounderHovered, setIsFounderHovered] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("Телефонний дзвінок");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const successCircleRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    telegramUsername: "",
    request: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const newErrors: { [key: string]: string } = {};
    if (!/^[a-zA-Zа-яА-ЯіїєґІЇЄҐ'’\-\s]{2,}$/.test(formData.name.trim())) newErrors.name = "Введіть коректне ім'я (лише літери)";
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) newErrors.email = "Введіть коректний email";
    if (formData.phone.length !== 9 || !/^\d+$/.test(formData.phone)) newErrors.phone = "Введіть рівно 9 цифр";
    if (selectedMethod === "Telegram" && formData.telegramUsername.trim().length < 2) newErrors.telegramUsername = "Введіть нікнейм";
    if (formData.request.trim().length < 5) newErrors.request = "Опишіть ваш запит детальніше";
    setErrors(newErrors);
  }, [formData, selectedMethod]);

  const addEmailDomain = (domain: string) => {
    const parts = formData.email.split('@');
    const newEmail = parts[0] + domain;
    setFormData({ ...formData, email: newEmail });
    
    setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.focus();
        const cursorPos = parts[0].length;
        emailInputRef.current.setSelectionRange(cursorPos, cursorPos);
      }
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, phone: `+380${formData.phone}`, method: selectedMethod }),
      });
      
      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", company: "", email: "", phone: "", telegramUsername: "", request: "" });
        setTouched({});
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <main className="min-h-screen md:h-screen w-full flex flex-col md:flex-row font-sans overflow-x-hidden md:overflow-hidden bg-white">
      {/* LOGO LINK (всегда остаётся слева сверху; за счёт mix-blend-difference белый на чёрном и чёрный на белом фоне) */}
      <div className="fixed top-8 left-8 md:top-10 md:left-12 lg:top-[40px] lg:left-[60px] z-50 mix-blend-difference">
        <Link href="/" className="hover:scale-105 transition-transform duration-300 block w-fit">
          <svg viewBox="46 128 208 28" className="h-[20px] w-auto" fill="white" stroke="white" strokeWidth="0.9" strokeLinejoin="round">
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
        </Link>
      </div>

      {/* WAVE BACKGROUND (всегда остаётся слева; за счёт mix-blend-difference белая на чёрном и чёрная на белом фоне) */}
      <div className="fixed inset-y-0 left-[-30px] md:left-[-50px] lg:left-[-70px] w-[350px] pointer-events-none z-40 hidden md:block mix-blend-difference">
        <svg className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wavePatternContactBlack" width="400" height="900" patternUnits="userSpaceOnUse" patternTransform="translate(0, -1150)">
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
          <rect width="100%" height="100%" fill="url(#wavePatternContactBlack)" />
        </svg>
      </div>

      {/* LEFT SIDE (Black Background) */}
      <motion.div 
        initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", x: "0%" }}
        animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", x: submitStatus === 'success' ? "-100%" : "0%" }}
        transition={{ duration: 0.85, ease: [0.7, 0, 0.3, 1] }}
        className="relative z-30 w-full md:w-[45%] lg:w-[40%] min-h-[50vh] md:h-screen md:sticky md:top-0 bg-black text-white p-8 pb-8 pt-24 md:pb-16 md:pt-32 lg:pb-24 lg:pt-[110px] md:pr-12 lg:pr-16 md:pl-28 lg:pl-36 overflow-hidden flex flex-col shrink-0 pointer-events-auto"
      >
        <AnimatePresence mode="wait">
          {submitStatus !== "success" ? (
            <motion.div 
              key="left-info"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.25 } }}
              className="relative z-10 flex flex-col h-full justify-between w-full max-w-[420px] ml-auto"
            >
              {/* INFO TEXT */}
              <div className="flex-1 flex flex-col">
                <motion.h1 variants={itemVariants} className="text-[28px] md:text-[32px] lg:text-[38px] font-bold leading-[1.1] mb-6 tracking-tight mt-0 md:mt-2 lg:mt-3">
                  Бажаєте замовити прорахунок?
                </motion.h1>
                <motion.p variants={itemVariants} className="text-zinc-400 text-[14px] md:text-[15px] leading-relaxed mb-10">
                  Розкажіть нам про свій проєкт. Ми допоможемо підібрати оптимальні рішення, складемо рецептури та прорахуємо вартість виробництва вашої косметики.
                </motion.p>

                <div className="flex flex-col gap-5 mb-10">
                  <motion.div variants={itemVariants} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6" stroke="black"></polyline>
                      </svg>
                    </div>
                    <div>
                      <div className="text-zinc-400 text-[12px] mb-0.5">Email адреса</div>
                      <a href="mailto:hello@elementxlab.com" className="relative group text-white font-bold text-[14px] transition-colors inline-block">
                        hello@elementxlab.com
                        <span className="absolute left-0 bottom-[-2px] w-0 h-[1px] bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
                      </a>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-zinc-400 text-[12px] mb-0.5">Номер телефону</div>
                      <a href="tel:+380689316478" className="relative group text-white font-bold text-[14px] transition-colors inline-block">
                        +38 (068) 931 64 78
                        <span className="absolute left-0 bottom-[-2px] w-0 h-[1px] bg-white transition-all duration-300 ease-out group-hover:w-full"></span>
                      </a>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* FOUNDER BLOCK */}
              <motion.div variants={itemVariants} className="mt-auto pt-6 border-t border-white/10 relative">
                <motion.div 
                  className="text-[13px] md:text-[14px] font-bold text-white italic mb-4 leading-tight opacity-90"
                  variants={founderContainerVariants}
                >
                  {`"Наше завдання — допомагати бізнесам розвиватися та створювати продукти, якими можна пишатися"`.split("").map((char, i) => (
                    <motion.span key={i} variants={founderCharVariants}>
                      {char}
                    </motion.span>
                  ))}
                </motion.div>

                <div
                  className="relative inline-flex items-center gap-3 cursor-pointer group"
                  onMouseEnter={() => setIsFounderHovered(true)}
                  onMouseLeave={() => setIsFounderHovered(false)}
                >
                  {/* Всплывающее мини-окошко при наведении */}
                  <AnimatePresence>
                    {isFounderHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.94 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute bottom-full left-0 mb-3 z-50 w-[230px] p-2.5 rounded-[22px] bg-zinc-900/95 backdrop-blur-xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.75)] pointer-events-none"
                      >
                        <div className="w-full aspect-square rounded-[16px] overflow-hidden bg-zinc-800 mb-2.5">
                          <img
                            src="/opt/avatar.webp"
                            alt="Олександр Гончар"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="px-1.5 pb-1">
                          <div className="font-bold text-white text-[15px] leading-snug">
                            Олександр Гончар
                          </div>
                          <div className="text-zinc-400 text-[12px] leading-snug mt-0.5">
                            Засновник Element X Lab
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-transparent group-hover:ring-white/40 transition-all duration-300">
                    <img src="/opt/avatar.webp" alt="Олександр Гончар" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-[14px]">Олександр Гончар</div>
                    <div className="text-zinc-400 text-[12px]">Засновник Element X Lab</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* RIGHT SIDE (Form with White Background) */}
      <div className="relative w-full md:w-[55%] lg:w-[60%] min-h-[50vh] md:h-screen md:overflow-hidden bg-white p-6 md:px-12 lg:px-16 xl:px-24 pb-12 pt-8 md:pt-32 lg:pt-[110px] flex items-start justify-center">
        
        <AnimatePresence mode="wait">
          {submitStatus !== 'success' ? (
            <motion.form 
              key="form"
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="w-full max-w-[600px] flex flex-col gap-5 md:gap-6"
            >
          <motion.h2 variants={itemVariants} className="text-[24px] md:text-[28px] font-bold text-black mb-2 md:hidden">
            Форма заявки
          </motion.h2>
          
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="flex flex-col gap-2 relative pb-1">
              <label className="font-bold text-black text-[14px]">Ваше ім'я</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onBlur={() => setTouched({...touched, name: true})}
                onChange={(e) => setFormData({...formData, name: e.target.value.replace(/[^a-zA-Zа-яА-ЯіїєґІЇЄҐ'’\-\s]/g, '')})}
                placeholder="Ім'я" 
                autoComplete="name"
                className={`w-full h-12 px-5 text-[15px] text-black rounded-full border ${touched.name && errors.name && formData.name.length > 0 ? 'border-red-500 bg-red-50/50' : 'border-zinc-200 focus:border-black'} outline-none transition-colors placeholder:text-zinc-500`} 
              />
              {touched.name && errors.name && formData.name.length > 0 && <span className="absolute -bottom-4 left-4 text-red-500 text-[11px] whitespace-nowrap">{errors.name}</span>}
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="font-bold text-black text-[14px] flex items-baseline gap-1.5">
                <span>Назва компанії чи бренду</span>
                <span className="font-normal text-zinc-400 text-[12px] tracking-normal">(необов'язково)</span>
              </label>
              <input 
                type="text" 
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                placeholder="Компанія" 
                autoComplete="organization"
                className="w-full h-12 px-5 text-[15px] text-black rounded-full border border-zinc-200 outline-none focus:border-black transition-colors placeholder:text-zinc-500" 
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-2 relative pb-1">
            <label className="font-bold text-black text-[14px]">Email адреса</label>
            <div className="relative flex items-center">
              <input 
                ref={emailInputRef}
                type="text" 
                required
                value={formData.email}
                onBlur={() => setTouched({...touched, email: true})}
                onChange={(e) => setFormData({...formData, email: e.target.value.replace(/\s/g, '')})}
                placeholder="example@gmail.com" 
                autoComplete="email"
                className={`w-full h-12 pl-5 pr-[210px] text-[15px] text-black rounded-full border ${touched.email && errors.email && formData.email.length > 0 ? 'border-red-500 bg-red-50/50' : 'border-zinc-200 focus:border-black'} outline-none transition-colors placeholder:text-zinc-500`} 
              />
              <div className="absolute right-2 flex gap-1">
                <button type="button" onClick={() => addEmailDomain('@gmail.com')} className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md hover:scale-105 active:scale-95 transition-transform duration-200">@gmail.com</button>
                <button type="button" onClick={() => addEmailDomain('@ukr.net')} className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md hover:scale-105 active:scale-95 transition-transform duration-200">@ukr.net</button>
                <button type="button" onClick={() => addEmailDomain('@icloud.com')} className="text-[10px] font-medium bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md hover:scale-105 active:scale-95 transition-transform duration-200">@icloud.com</button>
              </div>
            </div>
            {touched.email && errors.email && formData.email.length > 0 && <span className="absolute -bottom-3 left-4 text-red-500 text-[11px] whitespace-nowrap">{errors.email}</span>}
          </motion.div>

          <motion.div 
            variants={itemVariants} 
            className={`grid grid-cols-1 ${selectedMethod === "Telegram" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-5 md:gap-6`}
          >
            <div className="flex flex-col gap-2 relative pb-1">
              <label className="font-bold text-black text-[14px] whitespace-nowrap">Номер телефону</label>
              <div className="relative flex items-center">
                <span className="absolute left-5 text-black text-[15px]">+380</span>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onBlur={() => setTouched({...touched, phone: true})}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, ''); // strip non-digits
                    if (val.startsWith('380')) val = val.slice(3);
                    else if (val.startsWith('80')) val = val.slice(2);
                    else if (val.startsWith('0')) val = val.slice(1);
                    
                    if (val.length > 9) val = val.slice(0, 9);
                    setFormData({...formData, phone: val});
                  }}
                  placeholder=" 97 123 45 67" 
                  autoComplete="tel"
                  className={`w-full h-12 pl-[58px] pr-5 text-[15px] text-black rounded-full border ${touched.phone && errors.phone && formData.phone.length > 0 ? 'border-red-500 bg-red-50/50' : 'border-zinc-200 focus:border-black'} outline-none transition-colors placeholder:text-zinc-500 tracking-wide`} 
                />
              </div>
              {touched.phone && errors.phone && formData.phone.length > 0 && <span className="absolute -bottom-4 left-4 text-red-500 text-[11px] whitespace-nowrap">{errors.phone}</span>}
            </div>
            
            <div className="flex flex-col gap-2 relative pb-1">
              <label className="font-bold text-black text-[14px] whitespace-nowrap">Спосіб комунікації</label>
              <div className="relative" ref={dropdownRef}>
                <div 
                  className={`w-full h-12 px-5 text-[15px] text-black rounded-full border ${isDropdownOpen ? 'border-black' : 'border-zinc-200'} outline-none flex items-center justify-between cursor-pointer hover:border-black transition-colors bg-white`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="truncate pr-2">{selectedMethod}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-zinc-200 rounded-[20px] shadow-lg z-50 overflow-hidden"
                    >
                      <div className="py-2">
                        {["Telegram", "Viber", "WhatsApp", "Телефонний дзвінок"].map((method) => (
                          <div 
                            key={method}
                            className={`px-5 py-3 text-[15px] cursor-pointer transition-colors ${selectedMethod === method ? 'bg-zinc-100 font-bold text-black' : 'text-zinc-600 hover:bg-zinc-50 hover:text-black'}`}
                            onClick={() => {
                              setSelectedMethod(method);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {method}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {selectedMethod === "Telegram" && (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" as any }}
                  className="flex flex-col gap-2 relative pb-1"
                >
                  <label className="font-bold text-black text-[14px] whitespace-nowrap">Нік в Telegram</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-5 text-zinc-500 font-medium text-[15px]">@</span>
                    <input 
                      type="text"
                      required={selectedMethod === "Telegram"}
                      value={formData.telegramUsername}
                      onBlur={() => setTouched({...touched, telegramUsername: true})}
                      onChange={(e) => setFormData({...formData, telegramUsername: e.target.value.replace(/[@\s]/g, '')})}
                      placeholder="username" 
                      className={`w-full h-12 pl-[38px] pr-5 text-[15px] text-black rounded-full border ${touched.telegramUsername && errors.telegramUsername && formData.telegramUsername.length > 0 ? 'border-red-500 bg-red-50/50' : 'border-zinc-200 focus:border-black'} outline-none transition-colors placeholder:text-zinc-500`} 
                    />
                  </div>
                  {touched.telegramUsername && errors.telegramUsername && formData.telegramUsername.length > 0 && <span className="absolute -bottom-4 left-4 text-red-500 text-[11px] whitespace-nowrap">{errors.telegramUsername}</span>}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-2 relative pb-1">
            <div className="flex justify-between items-end">
              <label className="font-bold text-black text-[14px]">Ваш запит</label>
              <span className={`text-[12px] font-medium ${formData.request.length === 300 ? 'text-red-500' : 'text-zinc-400'}`}>{formData.request.length}/300</span>
            </div>
            <textarea 
              value={formData.request}
              onBlur={() => setTouched({...touched, request: true})}
              onChange={(e) => {
                let val = e.target.value.replace(/[<>]/g, '');
                if (val.length <= 300) setFormData({...formData, request: val});
              }}
              placeholder="Опишіть ваш запит тут..." 
              className={`w-full h-[140px] md:h-[180px] p-5 text-[15px] text-black rounded-[24px] border ${touched.request && errors.request && formData.request.length > 0 ? 'border-red-500 bg-red-50/50' : 'border-zinc-200 focus:border-black'} outline-none transition-colors resize-none placeholder:text-zinc-500`}
            ></textarea>
            {touched.request && errors.request && formData.request.length > 0 && <span className="absolute -bottom-3 left-4 text-red-500 text-[11px] whitespace-nowrap">{errors.request}</span>}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-4 w-full md:w-fit">
            <button 
              type="submit"
              disabled={isSubmitting || Object.keys(errors).length > 0}
              style={{
                opacity: !(isSubmitting || Object.keys(errors).length > 0) ? 1 : 0.35,
              }}
              className={`rounded-full h-14 md:h-16 w-full md:w-fit px-12 font-bold text-[15px] flex items-center justify-center bg-black text-white transition-transform duration-300 ease-out ${
                !(isSubmitting || Object.keys(errors).length > 0)
                  ? 'cursor-pointer hover:scale-105 active:scale-95'
                  : 'cursor-not-allowed'
              }`}
            >
              <span>
                {isSubmitting ? "Відправка..." : "Залишити заявку"}
              </span>
            </button>
          </motion.div>

          {submitStatus === "error" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[14px] mt-2 font-bold">
              ❌ Сталася помилка при відправці. Спробуйте ще раз або напишіть нам напряму.
            </motion.div>
          )}
          </motion.form>
          ) : (
            <motion.div
              key="success-white-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
              className="fixed inset-0 z-20 bg-white flex flex-col items-center justify-center text-center p-6"
            >
              <FlyingBats spawnRef={successCircleRef} />
              <div className="relative z-20 mb-6 flex items-center justify-center">
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30) * (Math.PI / 180);
                  const radius = 70 + (i % 4) * 15;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <motion.div
                      key={`confetti-${i}`}
                      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                      animate={{
                        x,
                        y,
                        scale: [0, 1, 0.5],
                        opacity: [1, 1, 0],
                      }}
                      transition={{
                        duration: 1.2,
                        ease: "easeOut" as any,
                        delay: 0.5 + (i % 2) * 0.05,
                        repeat: Infinity,
                        repeatDelay: 0.8,
                      }}
                      className={`absolute rounded-full z-0 ${
                        i % 3 === 0 ? "w-2 h-2 bg-black" : "w-1.5 h-1.5 bg-zinc-400"
                      }`}
                    />
                  );
                })}

                <motion.div
                  ref={successCircleRef}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                  className="w-24 h-24 bg-black rounded-full flex items-center justify-center shadow-xl relative z-20"
                >
                  <motion.svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, scale: 1 }}
                    animate={{ pathLength: 1, scale: [1, 1.15, 1] }}
                    transition={{
                      pathLength: { duration: 0.4, delay: 0.35, ease: "easeOut" as any },
                      scale: {
                        duration: 1.2,
                        delay: 0.9,
                        repeat: Infinity,
                        repeatDelay: 0.8,
                        times: [0, 0.15, 1],
                        ease: "easeOut" as any,
                      },
                    }}
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </motion.svg>
                </motion.div>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
                className="text-[28px] md:text-[36px] font-bold text-black mb-3 leading-tight"
              >
                Заявка успішно надіслана!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
                className="text-zinc-500 text-[16px] md:text-[18px]"
              >
                Зв'яжемося з Вами найближчим часом.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
