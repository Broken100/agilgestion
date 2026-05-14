'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, ShoppingCart, Package, BarChart3, Settings, Tags } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { motion } from 'motion/react';
import { slideInUp } from '@/lib/animation';

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/dashboard/pos', label: 'Venta', icon: ShoppingCart },
  { href: '/dashboard/productos', label: 'Productos', icon: Package },
  { href: '/dashboard/categorias', label: 'Categorias', icon: Tags },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/dashboard/admin/negocio', label: 'Admin', icon: Settings, roles: ['OWNER', 'ADMIN'] },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const visibleItems = navItems.filter((item) => !item.roles || (item.roles && item.roles.includes(user?.rol as string)));
  const activeIndex = visibleItems.findIndex((item) => pathname === item.href);

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-border bg-cloud-white pb-[env(safe-area-inset-bottom)] dark:border-stone-border dark:bg-card"
    >
      <div className="relative flex">
        {activeIndex >= 0 && (
          <motion.div
            className="absolute top-0 bottom-0 bg-sky-tint/30 dark:bg-chartwell-blue/10"
            initial={false}
            animate={{
              left: `${(activeIndex / visibleItems.length) * 100}%`,
              width: `${100 / visibleItems.length}%`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        {visibleItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              whileTap={{ scale: 0.95 }}
              className="relative flex flex-1 flex-col items-center gap-1 pt-2 pb-2 min-h-[56px]"
            >
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1',
                  'text-xs font-medium',
                  isActive ? 'text-chartwell-blue' : 'text-ash-gray hover:text-foreground'
                )}
              >
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.nav>
  );
}