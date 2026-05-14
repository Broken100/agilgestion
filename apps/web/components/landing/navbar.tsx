'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'motion/react';
import { fadeIn, hoverLift, scaleOnTap } from '@/lib/animation';

const navLinks = [
  { href: '#features', label: 'Caracteristicas' },
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#contacto', label: 'Contacto' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-cloud-white/95 backdrop-blur-md shadow-subtle dark:bg-slate-text/95'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className={cn(
              'text-xl font-bold font-heading',
              scrolled ? 'text-slate-text dark:text-cloud-white' : 'text-on-dark-text'
            )}
          >
            AG-Agil
          </motion.span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              whileHover={{ y: -2 }}
              className={cn(
                'text-sm font-medium transition-colors hover:text-chartwell-blue',
                scrolled ? 'text-ash-gray dark:text-ash-gray' : 'text-on-dark-muted hover:text-on-dark-text'
              )}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <motion.button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'rounded-lg p-2 transition-colors hover:bg-stone-border/50',
              scrolled ? 'text-ash-gray dark:text-ash-gray' : 'text-on-dark-muted hover:text-on-dark-text'
            )}
            aria-label="Toggle theme"
          >
            {mounted && (theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
          </motion.button>

          <motion.div variants={hoverLift} initial="rest" whileHover="hover">
            <Link
              href="/login"
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-chartwell-blue',
                scrolled ? 'text-ash-gray dark:text-ash-gray' : 'text-on-dark-muted hover:text-on-dark-text'
              )}
            >
              Iniciar sesion
            </Link>
          </motion.div>
          <motion.div variants={scaleOnTap} initial="rest" whileTap="tap">
            <Link
              href="/register"
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                scrolled
                  ? 'bg-ghost-ink text-on-dark-text hover:bg-ghost-ink/90 dark:bg-cloud-white dark:text-ghost-ink dark:hover:bg-cloud-white/90'
                  : 'bg-on-dark-text text-dark-bg hover:bg-on-dark-text/90'
              )}
            >
              Registrarse
            </Link>
          </motion.div>
        </div>

        <motion.button
          type="button"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          whileTap={{ scale: 0.9 }}
          aria-label="Menu"
        >
          {mobileOpen ? (
            <X className={cn('h-6 w-6', scrolled ? 'text-slate-text dark:text-cloud-white' : 'text-on-dark-text')} />
          ) : (
            <Menu className={cn('h-6 w-6', scrolled ? 'text-slate-text dark:text-cloud-white' : 'text-on-dark-text')} />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-stone-border bg-cloud-white px-6 py-4 dark:border-stone-border dark:bg-slate-text md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm font-medium text-ash-gray transition-colors hover:text-chartwell-blue dark:text-ash-gray"
                >
                  {link.label}
                </motion.a>
              ))}
              <button
                type="button"
                onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setMobileOpen(false); }}
                className="text-sm font-medium text-ash-gray transition-colors hover:text-chartwell-blue dark:text-ash-gray"
              >
                {mounted && (theme === 'dark' ? 'Modo claro' : 'Modo oscuro')}
              </button>
              <div className="flex flex-col gap-2 border-t border-stone-border pt-4 dark:border-stone-border">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-2 text-center text-sm font-medium text-ash-gray transition-colors hover:text-chartwell-blue dark:text-ash-gray"
                >
                  Iniciar sesion
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-chartwell-blue px-4 py-2 text-center text-sm font-medium text-white transition-all hover:bg-chartwell-blue/90"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}