'use client';

import React, { useEffect, useState } from 'react';
import { GetHelpPanel } from './GetHelpPanel';

/**
 * Mounted once for the whole app. Any screen opens the Get help panel by
 * calling openHelpPanel() from '@/lib/helplines'.
 */
export const HelpPanelHost: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'helplines' | 'doctor'>('helplines');

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setTab(detail?.tab === 'doctor' ? 'doctor' : 'helplines');
      setOpen(true);
    };
    window.addEventListener('baalance-open-help', onOpen);
    return () => window.removeEventListener('baalance-open-help', onOpen);
  }, []);

  return <GetHelpPanel isOpen={open} initialTab={tab} onClose={() => setOpen(false)} />;
};
