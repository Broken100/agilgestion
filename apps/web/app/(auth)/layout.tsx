'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { FileText, BarChart3, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { staggerContainer, staggerItem, slideInLeft, slideInRight } from '@/lib/animation';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    { icon: FileText, label: 'Facturacion SRI' },
    { icon: Package, label: 'Inventario' },
    { icon: BarChart3, label: 'Reportes' },
  ];

  return (
    <div className="flex min-h-screen">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark-bg"
      >
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full"
            style={{
              background:
                'radial-gradient(50% 84.5% at -14.7% -11.9%, rgb(59, 166, 241) 0%, transparent 100%)',
            }}
          />
          <div
            className="absolute -right-[10%] bottom-0 h-[400px] w-[400px] rounded-full"
            style={{
              background:
                'radial-gradient(50% 84.5% at 114.7% 111.9%, rgb(59, 166, 241) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <div className="absolute top-6 right-6">
            {mounted && (
              <motion.button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                whileTap={{ scale: 0.9 }}
                className="rounded-lg bg-on-dark-text/10 p-2 text-on-dark-muted transition-colors hover:text-on-dark-text"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.button>
            )}
          </div>

          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="font-heading text-4xl font-bold text-on-dark-text"
          >
            AG-Agil
          </motion.span>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-4 max-w-sm text-center text-base leading-relaxed text-on-dark-muted"
          >
            Gestion empresarial simplificada para pequenos negocios en Ecuador.
            Facturacion electronica, inventario y reportes desde el primer dia.
          </motion.p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-10 flex items-center gap-6 text-sm text-on-dark-muted"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.label}
                  variants={staggerItem}
                  whileHover={{ y: -4, scale: 1.05 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-on-dark-text/10">
                    <Icon className="h-6 w-6 text-chartwell-blue" />
                  </div>
                  <span>{feature.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full flex-col items-center justify-center bg-background p-4 lg:w-1/2"
      >
        <div className="absolute top-4 right-4 lg:hidden">
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-ash-gray transition-colors hover:text-chartwell-blue dark:text-ash-gray"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden mb-8 text-center"
        >
          <span className="font-heading text-2xl font-bold text-primary">AG-Agil</span>
          <p className="text-sm text-muted-foreground">Gestion empresarial agil</p>
        </motion.div>
        <AnimateMode>{children}</AnimateMode>
      </motion.div>
    </div>
  );
}

function AnimateMode({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}