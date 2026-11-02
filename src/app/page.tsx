"use client";

import { useState, useEffect } from 'react';
import DesktopPage from './DesktopPage';
import MobilePage from './MobilePage';

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      // 768px - стандартный брейкпоинт (iPad и телефоны)
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile(); // Проверяем сразу при загрузке
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Пока не знаем размер экрана (рендеринг на сервере или первая миллисекунда)
  if (isMobile === null) {
    return <div className="w-full h-screen bg-black" />; // Черный фон, чтобы не моргало белым
  }

  // Рендерим ТОЛЬКО нужную версию, чтобы их скрипты и скролл-анимации не конфликтовали
  return isMobile ? <MobilePage /> : <DesktopPage />;
}
