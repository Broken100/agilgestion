'use client';

import type { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Header } from '@/components/layout/header';
import { AnimatePresence, motion } from 'motion/react';
import { pageTransition } from '@/lib/animation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-[calc(56px+env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait">
          <motion.div
            key={typeof children === 'object' && children !== null && 'props' in children ? (children as ReactNode & { props?: { children?: ReactNode } }).props?.children?.toString() || 'page' : 'page'}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}