'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem, bounceIcon } from '@/lib/animation';

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'contacto@agilgestion.ec',
    href: 'mailto:contacto@agilgestion.ec',
  },
  {
    icon: Phone,
    label: 'Telefono',
    value: '+593 99 123 4567',
    href: 'tel:+593991234567',
  },
  {
    icon: MapPin,
    label: 'Ubicacion',
    value: 'Quito, Ecuador',
    href: null,
  },
];

export function Contact() {
  return (
    <section id="contacto" className="bg-canvas-fog py-24 dark:bg-background">
      <div className="mx-auto max-w-[1200px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-sky-tint px-3 py-1 text-xs font-medium text-chartwell-blue dark:bg-chartwell-blue/15">
            Contacto
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-text sm:text-4xl dark:text-foreground">
            Tienes preguntas?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-ash-gray dark:text-muted-foreground">
            Nuestro equipo esta listo para ayudarte a configurar tu sistema
            y resolver cualquier duda.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3"
        >
          {contactInfo.map((item) => {
            const Icon = item.icon;
            const Wrapper = item.href ? motion.a : motion.div;
            return (
              <Wrapper
                key={item.label}
                {...(item.href ? { href: item.href } : {})}
                variants={staggerItem}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-stone-border bg-cloud-white p-6 text-center shadow-subtle transition-all hover:shadow-md dark:border-stone-border dark:bg-card"
              >
                <motion.div variants={bounceIcon} className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-tint dark:bg-chartwell-blue/15">
                  <Icon className="h-5 w-5 text-chartwell-blue" />
                </motion.div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-ash-gray dark:text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-text dark:text-foreground">
                    {item.value}
                  </p>
                </div>
              </Wrapper>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}