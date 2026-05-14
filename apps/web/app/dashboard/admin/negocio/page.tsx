'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { apiFetch, apiUpload } from '@/lib/api-client';
import { AlertCircle, Lock, QrCode, Trash2 } from 'lucide-react';

interface NegocioData {
  id: string;
  nombre: string;
  ruc: string;
  nombreComercial: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ambienteSri: string;
  certificadoPath: string | null;
  qrCodePath: string | null;
}

export default function NegocioPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    ruc: '',
    nombreComercial: '',
    direccion: '',
    telefono: '',
    email: '',
    ambienteSri: 'PRUEBAS',
    certificadoPath: '',
    qrCodePath: '',
  });
  const [uploadingQR, setUploadingQR] = useState(false);

  useEffect(() => {
    const fetchNegocio = async () => {
      try {
        const res = await apiFetch('/api/admin/negocio');
        if (res.ok) {
          const data = await res.json();
          const negocio = data.data;
          setFormData({
            nombre: negocio.nombre || '',
            ruc: negocio.ruc || '',
            nombreComercial: negocio.nombreComercial || '',
            direccion: negocio.direccion || '',
            telefono: negocio.telefono || '',
            email: negocio.email || '',
            ambienteSri: negocio.ambienteSri || 'PRUEBAS',
            certificadoPath: negocio.certificadoPath || '',
            qrCodePath: negocio.qrCodePath || '',
          });
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNegocio();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await apiFetch('/api/admin/negocio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Cambios guardados correctamente');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error al guardar');
      }
    } catch (err) {
      toast.error('Error de conexion');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 2MB');
      return;
    }

    setUploadingQR(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await apiUpload('/api/upload', form);
      const data = await res.json();

      if (res.ok) {
        setFormData((prev) => ({ ...prev, qrCodePath: data.data.path }));
        toast.success('Codigo QR subido correctamente');
      } else {
        toast.error(data.message || 'Error al subir');
      }
    } catch {
      toast.error('Error de conexion al subir imagen');
    } finally {
      setUploadingQR(false);
    }
  };

  const handleRemoveQR = () => {
    setFormData((prev) => ({ ...prev, qrCodePath: '' }));
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center p-4">
        <AlertCircle className="h-10 w-10 text-destructive mb-2" />
        <p className="text-sm text-muted-foreground mb-3">Error al cargar configuracion del negocio</p>
        <Button variant="outline" size="sm" onClick={() => { setError(false); setLoading(true); window.location.reload(); }}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Configuracion del Negocio</h1>
        <p className="text-sm text-muted-foreground">Informacion general y ajustes del SRI</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informacion General</CardTitle>
            <CardDescription>Datos basicos de tu negocio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre / Razon Social</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <Input
                  id="ruc"
                  value={formData.ruc}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  required
                  maxLength={13}
                  pattern="\d{13}"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombreComercial">Nombre Comercial</Label>
                <Input
                  id="nombreComercial"
                  value={formData.nombreComercial}
                  onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email de contacto</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+593 99 123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Direccion</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Av. Principal 123, Ciudad"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuracion SRI</CardTitle>
            <CardDescription>Ambiente y certificado digital</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ambienteSri">Ambiente</Label>
              <Select
                value={formData.ambienteSri}
                onValueChange={(value) => setFormData({ ...formData, ambienteSri: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRUEBAS">Pruebas (Desarrollo)</SelectItem>
                  <SelectItem value="PRODUCCION">Produccion (Real)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.ambienteSri === 'PRUEBAS'
                  ? 'Las facturas se emitiran en modo de pruebas del SRI'
                  : 'Las facturas se emitiran al ambiente de produccion del SRI'}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Certificado Digital</Label>
              <div className="flex items-center gap-3 rounded-md border border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {formData.certificadoPath ? 'Certificado cargado' : 'Sin certificado'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formData.certificadoPath
                      ? formData.certificadoPath.split('/').pop()
                      : 'Carga un archivo .p12 para firmar facturas electronicas'}
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" disabled>
                  {formData.certificadoPath ? 'Cambiar' : 'Subir'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Codigo QR para Transferencias</CardTitle>
            <CardDescription>
              Imagen del codigo QR que se mostrara a los clientes al pagar con Transferencia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.qrCodePath ? (
              <div className="space-y-3">
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.qrCodePath}
                    alt="Codigo QR para transferencias"
                    className="h-48 w-48 rounded-lg border border-border object-contain bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <label className="flex-1">
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <span>
                        <QrCode className="mr-2 h-4 w-4" />
                        {uploadingQR ? 'Subiendo...' : 'Reemplazar QR'}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={handleUploadQR}
                      className="hidden"
                      disabled={uploadingQR}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveQR}
                    disabled={uploadingQR}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Esta imagen se mostrara en el POS cuando el cliente seleccione Transferencia
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-6">
                  <QrCode className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    Sube una imagen del codigo QR de tu cuenta bancaria
                  </p>
                  <label>
                    <Button type="button" variant="outline" asChild>
                      <span>
                        {uploadingQR ? 'Subiendo...' : 'Seleccionar imagen'}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={handleUploadQR}
                      className="hidden"
                      disabled={uploadingQR}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Formatos: PNG, JPG, GIF, WebP — Max. 2MB
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}