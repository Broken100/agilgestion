'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FileText, Package, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeInUp, staggerContainer, staggerItem, scaleOnTap, rotate } from '@/lib/animation';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-dark-bg">
      <div className="absolute inset-0 opacity-30">
        <motion.div
          variants={rotate}
          initial="hidden"
          animate="visible"
          className="absolute -left-[15%] -top-[12%] h-[500px] w-[500px] rounded-full"
          style={{
            background:
              'radial-gradient(50% 84.5% at -14.7% -11.9%, rgb(59, 166, 241) 0%, transparent 100%)',
          }}
        />
        <motion.div
          variants={rotate}
          initial="hidden"
          animate="visible"
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-[10%] bottom-0 h-[400px] w-[400px] rounded-full"
          style={{
            background:
              'radial-gradient(50% 84.5% at 114.7% 111.9%, rgb(59, 166, 241) 0%, transparent 70%)',
          }}
        />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative mx-auto max-w-[1200px] px-6 pb-20 pt-32 text-center"
      >
        <motion.div variants={staggerItem} className="mb-6 inline-flex items-center gap-2 rounded-full bg-on-dark-text/10 px-4 py-1.5 text-xs font-medium text-on-dark-text backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-chartwell-blue" />
          Sistema de gestion para Ecuador
        </motion.div>

        <motion.h1 variants={staggerItem} className="mx-auto max-w-3xl font-heading text-4xl font-bold leading-[1.13] tracking-tight text-on-dark-text sm:text-5xl md:text-6xl">
          Gestion empresarial{' '}
          <span className="text-chartwell-blue">simplificada</span>
        </motion.h1>

        <motion.p variants={staggerItem} className="mx-auto mt-6 max-w-xl text-base font-normal leading-relaxed text-on-dark-muted sm:text-lg">
          Facturacion electronica, inventario y reportes para pequenos negocios
          en Ecuador. Cumple con el SRI desde el primer dia.
        </motion.p>

        <motion.div variants={staggerItem} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <motion.div variants={scaleOnTap} initial="rest" whileTap="tap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-chartwell-blue px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-chartwell-blue/90"
            >
              Comenzar ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div variants={scaleOnTap} initial="rest" whileTap="tap">
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-lg border border-on-dark-text/20 px-6 py-3 text-sm font-medium text-on-dark-text transition-all hover:border-on-dark-text/40 hover:bg-on-dark-text/5"
            >
              Conocer mas
            </a>
          </motion.div>
        </motion.div>

        <motion.div variants={staggerItem} className="mt-16 hidden md:flex items-center justify-center gap-8">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 text-on-dark-muted">
            <FileText className="h-5 w-5 text-chartwell-blue" />
            <span className="text-sm">Facturacion SRI</span>
          </motion.div>
          <div className="h-4 w-px bg-on-dark-text/10" />
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 text-on-dark-muted">
            <Package className="h-5 w-5 text-chartwell-blue" />
            <span className="text-sm">Inventario</span>
          </motion.div>
          <div className="h-4 w-px bg-on-dark-text/10" />
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 text-on-dark-muted">
            <BarChart3 className="h-5 w-5 text-chartwell-blue" />
            <span className="text-sm">Reportes</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}