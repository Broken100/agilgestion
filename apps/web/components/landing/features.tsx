'use client';

import { FileText, Package, ShoppingCart, BarChart3, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem, bounceIcon, hoverLift } from '@/lib/animation';

const features = [
  {
    icon: FileText,
    title: 'Facturacion Electronica',
    description:
      'Emite facturas validadas por el SRI automaticamente. Genera XML, firma digital y envia al cliente sin complicaciones.',
  },
  {
    icon: Package,
    title: 'Control de Inventario',
    description:
      'Gestiona productos, precios y stock en tiempo real. Alertas automaticas cuando el inventario es bajo.',
  },
  {
    icon: ShoppingCart,
    title: 'Punto de Venta',
    description:
      'Interfaz rapida y sencilla para ventas en mostrador. Escaneo de codigos de barras y multiples metodos de pago.',
  },
  {
    icon: BarChart3,
    title: 'Reportes Detallados',
    description:
      'Visualiza ventas diarias, productos mas vendidos y tendencias con graficos interactivos y exportables.',
  },
  {
    icon: Shield,
    title: 'Cumplimiento SRI',
    description:
      'Manten tu negocio en regla con el Servicio de Rentas Internas. Validacion automatica de documentos tributarios.',
  },
  {
    icon: Zap,
    title: 'Rapido y Confiable',
    description:
      'Diseñado para negocios que necesitan velocidad. Sin tiempos de espera, sin complicaciones tecnicas.',
  },
];

export function Features() {
  return (
    <section id="features" className="bg-canvas-fog py-24 dark:bg-background">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-sky-tint px-3 py-1 text-xs font-medium text-chartwell-blue dark:bg-chartwell-blue/15">
            Caracteristicas
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-text sm:text-4xl">
            Todo lo que necesitas
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-ash-gray">
            Herramientas diseñadas para simplificar la gestion de tu negocio
            y cumplir con la normativa ecuatoriana.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                whileHover="hover"
                initial="rest"
                className="rounded-2xl border border-stone-border bg-cloud-white p-6 shadow-subtle transition-all hover:shadow-md dark:border-stone-border dark:bg-card"
              >
                <motion.div variants={bounceIcon} className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-sky-tint dark:bg-chartwell-blue/15">
                  <Icon className="h-6 w-6 text-chartwell-blue" />
                </motion.div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-slate-text dark:text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-ash-gray dark:text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}