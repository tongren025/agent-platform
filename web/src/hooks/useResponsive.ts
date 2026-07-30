import { useEffect, useState } from 'react';

export function useResponsive() {
  // 首次渲染就读取真实断点，避免窄屏先挂载桌面画布再闪回移动版。
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
  );
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1180px)').matches,
  );

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const compactQuery = window.matchMedia('(max-width: 1180px)');
    const sync = () => {
      setIsMobile(mobileQuery.matches);
      setIsCompact(compactQuery.matches);
    };
    sync();
    mobileQuery.addEventListener('change', sync);
    compactQuery.addEventListener('change', sync);
    return () => {
      mobileQuery.removeEventListener('change', sync);
      compactQuery.removeEventListener('change', sync);
    };
  }, []);

  return { isMobile, isCompact };
}
