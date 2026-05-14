'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';
import { Search, Plus, Package, AlertCircle, Trash2, Pencil, AlertTriangle, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { staggerContainer, staggerItem, scaleOnTap } from '@/lib/animation';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  precioUnitario: number;
  stockActual: number;
  stockMinimo: number;
  tipoImpuesto: string;
  activo: boolean;
  categoriaId?: string;
  categoriaNombre?: string;
}

interface Categoria {
  id: string;
  nombre: string;
}

interface ProductoForm {
  codigo: string;
  nombre: string;
  precioUnitario: string;
  stockActual: string;
  stockMinimo: string;
  tipoImpuesto: string;
  categoriaId: string;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formData, setFormData] = useState<ProductoForm>({
    codigo: '',
    nombre: '',
    precioUnitario: '',
    stockActual: '0',
    stockMinimo: '0',
    tipoImpuesto: 'IVA15',
    categoriaId: '',
  });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProductos();
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await apiFetch('/api/categorias');
      if (res.ok) {
        const data = await res.json();
        setCategorias(data.data || []);
      }
    } catch {
      // categorias are optional, don't block UI
    }
  };

  const fetchProductos = async () => {
    setError(false);
    try {
      const res = await apiFetch('/api/productos');
      if (res.ok) {
        const data = await res.json();
        setProductos(data.data || []);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && productos.length > 0) {
      const outOfStock = productos.filter((p) => p.stockActual <= 0);
      const lowStock = productos.filter(
        (p) => p.stockActual > 0 && p.stockActual <= p.stockMinimo
      );
      if (outOfStock.length > 0) {
        toast.error(`⚠ ${outOfStock.length} producto(s) agotado(s)`, { duration: 4000 });
      }
      if (lowStock.length > 0) {
        toast.warning(`⚠ ${lowStock.length} producto(s) con bajo stock`, { duration: 4000 });
      }
    }
  }, [loading]);

  const filteredProductos = productos.filter((p) => {
    const matchesSearch = p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.categoriaId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCardClasses = (producto: Producto) => {
    if (producto.stockActual <= 0) {
      return 'border-2 border-red-500 bg-red-50/30 dark:bg-red-900/20';
    }
    if (producto.stockActual <= producto.stockMinimo) {
      return 'border-2 border-orange-500 bg-orange-50/30 dark:bg-orange-900/20';
    }
    return 'border-2 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/20';
  };

  const getCategoriaNombre = (categoriaId: string | undefined): string | null => {
    if (!categoriaId) return null;
    const cat = categorias.find((c) => c.id === categoriaId);
    return cat ? cat.nombre : null;
  };

  const getStockBadge = (producto: Producto) => {
    if (producto.stockActual <= 0) {
      return <Badge variant="destructive">Sin stock</Badge>;
    }
    if (producto.stockActual <= producto.stockMinimo) {
      return <Badge variant="warning">Bajo stock</Badge>;
    }
    return <Badge variant="success">En stock</Badge>;
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData({
      codigo: '',
      nombre: '',
      precioUnitario: '',
      stockActual: '0',
      stockMinimo: '0',
      tipoImpuesto: 'IVA15',
      categoriaId: '',
    });
    setFormErrors({});
    setShowDialog(true);
  };

  const openEditDialog = (producto: Producto) => {
    setEditingProduct(producto);
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      precioUnitario: String(producto.precioUnitario),
      stockActual: String(producto.stockActual),
      stockMinimo: String(producto.stockMinimo),
      tipoImpuesto: producto.tipoImpuesto,
      categoriaId: producto.categoriaId ?? '',
    });
    setFormErrors({});
    setShowDialog(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!editingProduct && !formData.codigo.trim()) errors.codigo = 'El codigo es requerido';
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!formData.precioUnitario || parseFloat(formData.precioUnitario) <= 0) {
      errors.precioUnitario = 'El precio debe ser mayor a 0';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        nombre: formData.nombre,
        precioUnitario: parseFloat(formData.precioUnitario),
        stockActual: parseInt(formData.stockActual) || 0,
        stockMinimo: parseInt(formData.stockMinimo) || 0,
        tipoImpuesto: formData.tipoImpuesto,
        categoriaId: formData.categoriaId || null,
      } as Record<string, string | number | boolean>;

      if (parseInt(formData.stockActual) <= 0) {
        payload.activo = false;
      }

      let res: Response;
      if (editingProduct) {
        res = await apiFetch(`/api/productos/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch('/api/productos/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, codigo: formData.codigo }),
        });
      }

      if (res.ok) {
        setShowDialog(false);
        setFormData({ codigo: '', nombre: '', precioUnitario: '', stockActual: '0', stockMinimo: '0', tipoImpuesto: 'IVA15', categoriaId: '' });
        setFormErrors({});
        setEditingProduct(null);
        toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado');
        fetchProductos();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error al guardar producto');
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
      const res = await apiFetch(`/api/productos/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProductos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        toast.success('Producto eliminado');
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
          <h1 className="text-xl font-bold text-foreground">Productos</h1>
          <motion.div variants={scaleOnTap} initial="rest" whileTap="tap">
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Nuevo
            </Button>
          </motion.div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por codigo o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Buscar productos"
          />
        </div>
        {categorias.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === 'all'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === cat.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.header>

      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <AlertCircle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Error al cargar productos</p>
            <Button variant="outline" size="sm" onClick={fetchProductos}>
              Reintentar
            </Button>
          </motion.div>
        ) : filteredProductos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-12 text-muted-foreground"
          >
            <Package className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">
              {search ? 'No hay productos que coincidan con la busqueda' : 'No hay productos registrados'}
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
              {filteredProductos.map((producto) => (
                <motion.div
                  key={producto.id}
                  variants={staggerItem}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  layout
                >
                  <Card className={`p-4 transition-all ${getCardClasses(producto)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground">{producto.nombre}</p>
                          {!producto.activo && (
                            <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                          )}
                          {getStockBadge(producto)}
                        </div>
                        <p className="text-sm text-muted-foreground">Codigo: {producto.codigo}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              Stock: {producto.stockActual} | Minimo: {producto.stockMinimo}
                            </p>
                            {getCategoriaNombre(producto.categoriaId) && (
                              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                {getCategoriaNombre(producto.categoriaId)}
                              </span>
                            )}
                          {producto.stockActual <= producto.stockMinimo && producto.stockActual > 0 && (
                            <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                          )}
                          {producto.stockActual <= 0 && (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-3 flex flex-col items-end gap-2">
                        <div>
                          <p className="text-lg font-bold text-primary tabular-nums">
                            ${(producto.precioUnitario ?? 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">{producto.tipoImpuesto}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => openEditDialog(producto)}
                            aria-label="Editar producto"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            disabled={deletingId === producto.id}
                            onClick={() => {
                              setDeleteTarget(producto);
                              setDeleteDialogOpen(true);
                            }}
                            aria-label="Eliminar producto"
                          >
                            {deletingId === producto.id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setEditingProduct(null); setShowDialog(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Actualiza los datos del producto.'
                : 'Completa los datos del producto para agregarlo al inventario.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Codigo *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                required
                disabled={!!editingProduct}
                className={editingProduct ? 'opacity-60 cursor-not-allowed' : ''}
              />
              {formErrors.codigo && <p className="text-sm text-destructive">{formErrors.codigo}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
              {formErrors.nombre && <p className="text-sm text-destructive">{formErrors.nombre}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="precioUnitario">Precio Unitario *</Label>
              <Input
                id="precioUnitario"
                type="number"
                step="0.01"
                value={formData.precioUnitario}
                onChange={(e) => setFormData({ ...formData, precioUnitario: e.target.value })}
                required
              />
              {formErrors.precioUnitario && <p className="text-sm text-destructive">{formErrors.precioUnitario}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockActual">Stock Actual</Label>
                <Input
                  id="stockActual"
                  type="number"
                  value={formData.stockActual}
                  onChange={(e) => setFormData({ ...formData, stockActual: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockMinimo">Stock Minimo</Label>
                <Input
                  id="stockMinimo"
                  type="number"
                  value={formData.stockMinimo}
                  onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo Impuesto</Label>
              <Select
                value={formData.tipoImpuesto}
                onValueChange={(value) => setFormData({ ...formData, tipoImpuesto: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IVA15">IVA 15%</SelectItem>
                  <SelectItem value="IVA0">IVA 0%</SelectItem>
                  <SelectItem value="ICE">ICE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.categoriaId || '_none'}
                onValueChange={(value) => setFormData({ ...formData, categoriaId: value === '_none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Sin categoria</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setShowDialog(false); setEditingProduct(null); setFormErrors({}); }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" loading={saving} className="flex-1">
                {editingProduct ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
              Estas seguro de eliminar &quot;{deleteTarget?.nombre}&quot;? Esta accion no se puede deshacer.
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