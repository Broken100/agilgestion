'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { apiFetch } from '@/lib/api-client';
import { motion, AnimatePresence } from 'motion/react';
import { fadeInUp, staggerContainer, staggerItem, scaleOnTap } from '@agilgestion/shared';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    nombreNegocio: '',
    ruc: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const router = useRouter();
  const { setAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const isStep1Valid = formData.nombre.trim() && formData.email.trim() && formData.password.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!isStep1Valid) return;
      setStep(2);
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message ?? 'Error de registro');
      }

      const data = await response.json();
      setAuth(data);
      toast.success('Cuenta creada exitosamente');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="w-full max-w-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 hidden lg:block"
      >
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {step === 1 ? 'Crea tu cuenta' : 'Datos del negocio'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === 1
            ? 'Ingresa tus datos personales para comenzar'
            : 'Ingresa la informacion de tu negocio'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4 hidden lg:flex items-center gap-2"
      >
        <motion.div
          animate={{ opacity: step >= 1 ? 1 : 0.5 }}
          className="flex items-center gap-2"
        >
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step >= 1 ? 'bg-chartwell-blue text-white' : 'bg-muted text-muted-foreground'}`}>1</span>
          <span className="text-sm font-medium">Personal</span>
        </motion.div>
        <div className="h-px flex-1 bg-border" />
        <motion.div
          animate={{ opacity: step >= 2 ? 1 : 0.5 }}
          className="flex items-center gap-2"
        >
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step >= 2 ? 'bg-chartwell-blue text-white' : 'bg-muted text-muted-foreground'}`}>2</span>
          <span className="text-sm font-medium">Negocio</span>
        </motion.div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <motion.div variants={staggerItem} className="space-y-2">
                  <Label htmlFor="nombre">Tu nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Juan Perez"
                    required
                    autoComplete="name"
                    className="h-11 rounded-lg"
                  />
                </motion.div>

                <motion.div variants={staggerItem} className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    required
                    autoComplete="email"
                    className="h-11 rounded-lg"
                  />
                </motion.div>

                <motion.div variants={staggerItem} className="space-y-2">
                  <Label htmlFor="password">Contrasena</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimo 6 caracteres"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="h-11 pr-10 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ash-gray hover:text-foreground"
                      aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div variants={scaleOnTap} initial="rest" whileTap="tap">
                <Button type="submit" size="lg" className="w-full rounded-lg">
                  Continuar
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <motion.div variants={staggerItem} className="space-y-2">
                  <Label htmlFor="nombreNegocio">Nombre del negocio</Label>
                  <Input
                    id="nombreNegocio"
                    value={formData.nombreNegocio}
                    onChange={(e) => setFormData({ ...formData, nombreNegocio: e.target.value })}
                    placeholder="Mi Tienda"
                    required
                    className="h-11 rounded-lg"
                  />
                </motion.div>

                <motion.div variants={staggerItem} className="space-y-2">
                  <Label htmlFor="ruc">RUC</Label>
                  <Input
                    id="ruc"
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                    placeholder="1234567890001"
                    required
                    maxLength={13}
                    pattern="\d{13}"
                    className="h-11 rounded-lg"
                  />
                  <p className="text-xs text-muted-foreground">13 digitos numericos</p>
                </motion.div>
              </motion.div>

              <motion.div variants={staggerItem} className="flex gap-3">
                <Button type="button" variant="outline" size="lg" className="flex-1 rounded-lg" onClick={() => setStep(1)}>
                  Atras
                </Button>
                <motion.div variants={scaleOnTap} initial="rest" whileTap="tap">
                  <Button type="submit" size="lg" className="flex-1 rounded-lg" loading={loading}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear cuenta
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center text-sm text-muted-foreground"
      >
        Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-chartwell-blue hover:underline">
          Inicia sesion
        </Link>
      </motion.p>
    </div>
  );
}