'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/lib/animation';

const footerLinks = {
  producto: [
    { label: 'Caracteristicas', href: '#features' },
    { label: 'Beneficios', href: '#beneficios' },
    { label: 'Precios', href: '#contacto' },
    { label: 'Registro', href: '/register' },
  ],
  empresa: [
    { label: 'Sobre nosotros', href: '#contacto' },
    { label: 'Contacto', href: '#contacto' },
    { label: 'Blog', href: '#' },
    { label: 'Soporte', href: '#contacto' },
  ],
  legal: [
    { label: 'Terminos de servicio', href: '#' },
    { label: 'Politica de privacidad', href: '#' },
    { label: 'Cumplimiento SRI', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-dark-bg py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-[1200px] px-6"
      >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="font-heading text-lg font-bold text-on-dark-text">AG-Agil</span>
            <p className="mt-3 text-sm leading-relaxed text-on-dark-muted">
              Sistema de gestion empresarial para pequenos negocios en Ecuador.
              Facturacion electronica, inventario y punto de venta.
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <motion.div
              key={section}
              variants={staggerItem}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-on-dark-text">
                {section === 'producto'
                  ? 'Producto'
                  : section === 'empresa'
                  ? 'Empresa'
                  : 'Legal'}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                      <Link
                        href={link.href}
                        className="text-sm text-on-dark-muted transition-colors hover:text-chartwell-blue"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 border-t border-on-dark-text/10 pt-6 text-center">
          <p className="text-xs text-on-dark-muted">
            &copy; {new Date().getFullYear()} AG-Agil. Todos los derechos reservados.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}