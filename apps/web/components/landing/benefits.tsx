'use client';

import { CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeInLeft, fadeInRight, staggerContainer, staggerItem } from '@/lib/animation';

const benefits = [
  {
    title: 'Cumplimiento garantizado con el SRI',
    description:
      'Tu negocio siempre al dia con las obligaciones tributarias. Facturas electronicas validadas automaticamente por el Servicio de Rentas Internas.',
    points: [
      'Facturas, notas de credito y retenciones',
      'Firma digital incluida',
      'Envio automatico al SRI',
    ],
    accent: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    checkColor: 'text-success',
  },
  {
    title: 'Control total de tu inventario',
    description:
      'Sabe exactamente que tienes en stock, cuales son tus productos estrella y cuando necesitas reabastecer.',
    points: [
      'Actualizacion en tiempo real',
      'Alertas de stock bajo',
      'Codigos de barras',
    ],
    accent: 'bg-chartwell-blue/5 dark:bg-chartwell-blue/10',
    iconColor: 'text-chartwell-blue',
    checkColor: 'text-chartwell-blue',
  },
  {
    title: 'Accesible desde cualquier dispositivo',
    description:
      'Gestiona tu negocio desde tu computadora, tablet o celular. Sin instalar nada, solo necesitas internet.',
    points: [
      'Diseño responsivo',
      'Sincronizacion automatica',
      'Datos seguros en la nube',
    ],
    accent: 'bg-sky-tint/50 dark:bg-chartwell-blue/5',
    iconColor: 'text-chartwell-blue',
    checkColor: 'text-chartwell-blue',
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="bg-cloud-white py-24 dark:bg-background">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            Beneficios
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-text sm:text-4xl dark:text-foreground">
            Por que elegir AG-Agil?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-ash-gray dark:text-muted-foreground">
            Diseñado especificamente para pequenos negocios en Ecuador.
          </p>
        </motion.div>

        <div className="space-y-24">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`flex flex-col items-center gap-10 lg:flex-row ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1 space-y-4">
                <h3 className="font-heading text-2xl font-bold text-slate-text dark:text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-base leading-relaxed text-ash-gray dark:text-muted-foreground">
                  {benefit.description}
                </p>
                <motion.ul
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-3"
                >
                  {benefit.points.map((point) => (
                    <motion.li key={point} variants={staggerItem} className="flex items-start gap-3">
                      <CheckCircle className={`mt-0.5 h-5 w-5 flex-shrink-0 ${benefit.checkColor}`} />
                      <span className="text-sm text-slate-text dark:text-foreground">{point}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              <div className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className={`flex h-64 items-center justify-center rounded-2xl ${benefit.accent}`}
                >
                  <div className="grid grid-cols-3 gap-3 p-8 opacity-60">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-8 rounded-md ${i === 1 || i === 4 ? 'bg-chartwell-blue/40' : 'bg-chartwell-blue/15'}`}
                      />
                    ))}
                    <div className="col-span-3 mt-2 h-2 w-2/3 rounded-full bg-chartwell-blue/20" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}