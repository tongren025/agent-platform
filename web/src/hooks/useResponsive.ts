import { useEffect, useState } from 'react';

export function useResponsive() {
  // 首次渲染就读取真实断点，避免窄屏先挂载桌面画布再闪回移动版。
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return { isMobile };
}
