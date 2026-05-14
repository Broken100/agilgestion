'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';
import { Plus, Tags, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { staggerContainer, staggerItem, scaleOnTap } from '@/lib/animation';

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CategoriaForm {
  nombre: string;
  descripcion: string;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Categoria | null>(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState<CategoriaForm>({
    nombre: '',
    descripcion: '',
  });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    setError(false);
    try {
      const res = await apiFetch('/api/categorias');
      if (res.ok) {
        const data = await res.json();
        setCategorias(data.data || []);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategorias = categorias.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      (c.descripcion && c.descripcion.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreateDialog = () => {
    setEditingCategoria(null);
    setFormData({ nombre: '', descripcion: '' });
    setFormErrors({});
    setShowDialog(true);
  };

  const openEditDialog = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion ?? '',
    });
    setFormErrors({});
    setShowDialog(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
      };

      let res: Response;
      if (editingCategoria) {
        res = await apiFetch(`/api/categorias/${editingCategoria.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch('/api/categorias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowDialog(false);
        setFormData({ nombre: '', descripcion: '' });
        setFormErrors({});
        setEditingCategoria(null);
        toast.success(editingCategoria ? 'Categoria actualizada' : 'Categoria creada');
        fetchCategorias();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error al guardar categoria');
      }
    } catch {
      toast.error('Error de conexion');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      const res = await apiFetch(`/api/categorias/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategorias((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        toast.success('Categoria eliminada');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error al eliminar');
      }
    } catch {
      toast.error('Error de conexion');
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="border-b border-border bg-background p-4"
      >
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Categorias</h1>
          <motion.div variants={scaleOnTap} initial="rest" whileTap="tap">
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Nueva
            </Button>
          </motion.div>
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar categorias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar categorias"
          />
        </div>
      </motion.header>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <AlertCircle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Error al cargar categorias</p>
            <Button variant="outline" size="sm" onClick={fetchCategorias}>
              Reintentar
            </Button>
          </motion.div>
        ) : filteredCategorias.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-12 text-muted-foreground"
          >
            <Tags className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">
              {search ? 'No hay categorias que coincidan con la busqueda' : 'No hay categorias registradas'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence>
              {filteredCategorias.map((categoria) => (
                <motion.div
                  key={categoria.id}
                  variants={staggerItem}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  layout
                >
                  <Card className="p-4 transition-all border-2 border-border hover:border-primary/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{categoria.nombre}</p>
                        {categoria.descripcion && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">{categoria.descripcion}</p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openEditDialog(categoria)}
                          aria-label="Editar categoria"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          disabled={deletingId === categoria.id}
                          onClick={() => {
                            setDeleteTarget(categoria);
                            setDeleteDialogOpen(true);
                          }}
                          aria-label="Eliminar categoria"
                        >
                          {deletingId === categoria.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setEditingCategoria(null); setShowDialog(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategoria ? 'Editar Categoria' : 'Nueva Categoria'}</DialogTitle>
            <DialogDescription>
              {editingCategoria
                ? 'Actualiza los datos de la categoria.'
                : 'Crea una nueva categoria para organizar tus productos.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                placeholder="Ej: Bebidas, Lacteos, Snacks"
              />
              {formErrors.nombre && <p className="text-sm text-destructive">{formErrors.nombre}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripcion opcional de la categoria"
              />
            </div>
            <DialogFooter className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setShowDialog(false); setEditingCategoria(null); setFormErrors({}); }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" loading={saving} className="flex-1">
                {editingCategoria ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar categoria</DialogTitle>
            <DialogDescription>
              Estas seguro de eliminar &quot;{deleteTarget?.nombre}&quot;? Los productos asociados no seran eliminados pero quedaran sin categoria.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}