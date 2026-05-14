'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { LogOut, Sun, Moon, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export function Header() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initials = user?.nombre
    ? user.nombre
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between border-b border-stone-border bg-cloud-white px-4 py-3 dark:border-stone-border dark:bg-card"
    >
      <Link href="/dashboard" className="flex items-center gap-2">
        <motion.span
          whileHover={{ scale: 1.05 }}
          className="font-heading text-xl font-bold text-chartwell-blue"
        >
          AG-Agil
        </motion.span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-chartwell-blue text-white text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-foreground">{user?.nombre ?? 'Usuario'}</p>
            <p className="text-xs text-muted-foreground">{user?.email ?? ''}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {mounted && (theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />)}
            {mounted && (theme === 'dark' ? 'Modo claro' : 'Modo oscuro')}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.header>
  );
}