'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeInUp, staggerItem, staggerContainer, scaleOnTap } from '@/lib/animation';

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-dark-bg py-24">
      <motion.div
        animate={{
          background: [
            'linear-gradient(270deg, rgb(59, 166, 241) 0%, rgb(193, 225, 247) 100%)',
            'linear-gradient(270deg, rgb(193, 225, 247) 0%, rgb(59, 166, 241) 100%)',
            'linear-gradient(270deg, rgb(59, 166, 241) 0%, rgb(193, 225, 247) 100%)',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute inset-0 opacity-20"
      >
        <div
          className="absolute right-0 top-0 h-[300px] w-[300px] rounded-full"
          style={{
            background:
              'linear-gradient(270deg, rgb(59, 166, 241) 0%, rgb(193, 225, 247) 100%)',
          }}
        />
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative mx-auto max-w-[1200px] px-6 text-center"
      >
        <motion.h2 variants={staggerItem} className="mx-auto max-w-2xl font-heading text-3xl font-bold tracking-tight text-on-dark-text sm:text-4xl">
          Listo para optimizar tu negocio?
        </motion.h2>
        <motion.p variants={staggerItem} className="mx-auto mt-4 max-w-xl text-base text-on-dark-muted">
          Registrate gratis y comienza a emitir facturas electronicas en minutos.
          Sin costos ocultos, sin complicaciones.
        </motion.p>
        <motion.div variants={staggerItem} className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <motion.div variants={scaleOnTap} initial="rest" whileTap="tap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-chartwell-blue px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-chartwell-blue/90"
            >
              Registrarse gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div variants={scaleOnTap} initial="rest" whileTap="tap">
            <a
              href="#contacto"
              className="inline-flex items-center gap-2 rounded-lg border border-on-dark-text/20 px-6 py-3 text-sm font-medium text-on-dark-text transition-all hover:border-on-dark-text/40 hover:bg-on-dark-text/5"
            >
              Contactar ventas
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}