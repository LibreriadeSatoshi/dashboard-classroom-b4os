'use client';

import { ReactNode, useEffect } from 'react';

interface MSWProviderProps {
  children: ReactNode;
}

const MSWProvider = ({ children }: MSWProviderProps) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const initMocks = async () => {
        const { worker } = await import('@/mocks/browser');
        worker.start();
      };
      initMocks();
    }
  }, []);

  return <>{children}</>;
};

export default MSWProvider;
