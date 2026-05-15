'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { apiFetch, apiUpload } from '@/lib/api-client';
import { AlertCircle, Lock, QrCode, Trash2, Users, Palette, Settings } from 'lucide-react';

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
  logoPath: string | null;
  preferencias: Record<string, unknown> | null;
}

interface TabProps {
  formData: NegocioData;
  setFormData: React.Dispatch<React.SetStateAction<NegocioData>>;
  saving: boolean;
  setSaving: (saving: boolean) => void;
}

function GeneralTab({ formData, setFormData, saving, setSaving }: TabProps) {
  const [localData, setLocalData] = useState({
    nombre: formData.nombre,
    ruc: formData.ruc,
    nombreComercial: formData.nombreComercial || '',
    direccion: formData.direccion || '',
    telefono: formData.telefono || '',
    email: formData.email || '',
  });

  useEffect(() => {
    setLocalData({
      nombre: formData.nombre,
      ruc: formData.ruc,
      nombreComercial: formData.nombreComercial || '',
      direccion: formData.direccion || '',
      telefono: formData.telefono || '',
      email: formData.email || '',
    });
  }, [formData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/admin/negocio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localData),
      });
      if (res.ok) {
        setFormData((prev) => ({ ...prev, ...localData }));
        toast.success('Cambios guardados correctamente');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error al guardar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información General</CardTitle>
        <CardDescription>Datos básicos de tu negocio</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre / Razón Social</Label>
            <Input
              id="nombre"
              value={localData.nombre}
              onChange={(e) => setLocalData({ ...localData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ruc">RUC</Label>
            <Input
              id="ruc"
              value={localData.ruc}
              onChange={(e) => setLocalData({ ...localData, ruc: e.target.value })}
              required
              maxLength={13}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nombreComercial">Nombre Comercial</Label>
            <Input
              id="nombreComercial"
              value={localData.nombreComercial}
              onChange={(e) => setLocalData({ ...localData, nombreComercial: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email de contacto</Label>
            <Input
              id="email"
              type="email"
              value={localData.email}
              onChange={(e) => setLocalData({ ...localData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={localData.telefono}
              onChange={(e) => setLocalData({ ...localData, telefono: e.target.value })}
              placeholder="+593 99 123 4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={localData.direccion}
              onChange={(e) => setLocalData({ ...localData, direccion: e.target.value })}
              placeholder="Av. Principal 123, Ciudad"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SriTab({ formData, setFormData, saving, setSaving }: TabProps) {
  const [localData, setLocalData] = useState({
    ambienteSri: formData.ambienteSri,
  });

  useEffect(() => {
    setLocalData({ ambienteSri: formData.ambienteSri });
  }, [formData.ambienteSri]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/admin/negocio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localData),
      });
      if (res.ok) {
        setFormData((prev) => ({ ...prev, ...localData }));
        toast.success('Cambios guardados correctamente');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error al guardar');
      }
    } catch {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración SRI</CardTitle>
        <CardDescription>Ambiente y certificado digital</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ambienteSri">Ambiente</Label>
          <Select
            value={localData.ambienteSri}
            onValueChange={(value) => setLocalData({ ...localData, ambienteSri: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar ambiente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRUEBAS">Pruebas (Desarrollo)</SelectItem>
              <SelectItem value="PRODUCCIÓN">Producción (Real)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {localData.ambienteSri === 'PRUEBAS'
              ? 'Las facturas se emitirán en modo de pruebas del SRI'
              : 'Las facturas se emitirán al ambiente de producción del SRI'}
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
                  : 'Carga un archivo .p12 para firmar facturas electrónicas'}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" disabled>
              {formData.certificadoPath ? 'Cambiar' : 'Subir'}
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PagosTab({ formData, setFormData, saving, setSaving }: TabProps) {
  const [uploadingQR, setUploadingQR] = useState(false);

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
        const newQrCodePath = data.data.path;
        const res2 = await apiFetch('/api/admin/negocio', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrCodePath: newQrCodePath }),
        });
        if (res2.ok) {
          setFormData((prev) => ({ ...prev, qrCodePath: newQrCodePath }));
          toast.success('Código QR subido correctamente');
        }
      } else {
        toast.error(data.message || 'Error al subir');
      }
    } catch {
      toast.error('Error de conexión al subir imagen');
    } finally {
      setUploadingQR(false);
    }
  };

  const handleRemoveQR = async () => {
    const res = await apiFetch('/api/admin/negocio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrCodePath: '' }),
    });
    if (res.ok) {
      setFormData((prev) => ({ ...prev, qrCodePath: '' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Código QR para Transferencias</CardTitle>
        <CardDescription>
          Imagen del código QR que se mostrará a los clientes al pagar con Transferencia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.qrCodePath ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.qrCodePath}
                alt="Código QR para transferencias"
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
              Esta imagen se mostrará en el POS cuando el cliente seleccione Transferencia
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-6">
              <QrCode className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Sube una imagen del código QR de tu cuenta bancaria
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
  );
}

function UsuariosTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios del Negocio</CardTitle>
        <CardDescription>Gestiona los usuarios que tienen acceso a este negocio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
            <Users className="h-16 w-16 text-amber-600 relative z-10" />
          </div>
          <h3 className="text-lg font-semibold mb-2">¡En construcción!</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-4">
            Estamos preparando esta sección para que puedas gestionar los usuarios de tu equipo.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Próximamente disponible
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PreferenciasTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias del Sistema</CardTitle>
        <CardDescription>Configura el comportamiento de la aplicación</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
            <Settings className="h-16 w-16 text-blue-600 relative z-10" />
          </div>
          <h3 className="text-lg font-semibold mb-2">¡En construcción!</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-4">
            Estamos preparando opciones de personalización para que adaptes el sistema a tus necesidades.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Próximamente disponible
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AppearanceTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Apariencia y Branding</CardTitle>
        <CardDescription>Personaliza la apariencia de tu negocio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
            <Palette className="h-16 w-16 text-violet-600 relative z-10" />
          </div>
          <h3 className="text-lg font-semibold mb-2">¡En construcción!</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-4">
            Estamos diseñando herramientas para que personalices el look & feel de tu negocio.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            Próximamente disponible
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NegocioPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<NegocioData>({
    id: '',
    nombre: '',
    ruc: '',
    nombreComercial: null,
    direccion: null,
    telefono: null,
    email: null,
    ambienteSri: 'PRUEBAS',
    certificadoPath: null,
    qrCodePath: null,
    logoPath: null,
    preferencias: null,
  });

  useEffect(() => {
    const fetchNegocio = async () => {
      try {
        const res = await apiFetch('/api/admin/negocio');
        if (res.ok) {
          const data = await res.json();
          const negocio = data.data;
          setFormData({
            id: negocio.id || '',
            nombre: negocio.nombre || '',
            ruc: negocio.ruc || '',
            nombreComercial: negocio.nombreComercial || null,
            direccion: negocio.direccion || null,
            telefono: negocio.telefono || null,
            email: negocio.email || null,
            ambienteSri: negocio.ambienteSri || 'PRUEBAS',
            certificadoPath: negocio.certificadoPath || null,
            qrCodePath: negocio.qrCodePath || null,
            logoPath: negocio.logoPath || null,
            preferencias: negocio.preferencias || null,
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

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center p-4">
        <AlertCircle className="h-10 w-10 text-destructive mb-2" />
        <p className="text-sm text-muted-foreground mb-3">Error al cargar configuración del negocio</p>
        <Button variant="outline" size="sm" onClick={() => { setError(false); setLoading(true); window.location.reload(); }}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Configuración del Negocio</h1>
        <p className="text-sm text-muted-foreground">Administra la información y preferencias de tu negocio</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sri">SRI</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
          <TabsTrigger value="appearance">Apariencia</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general">
            <GeneralTab formData={formData} setFormData={setFormData} saving={saving} setSaving={setSaving} />
          </TabsContent>
          <TabsContent value="sri">
            <SriTab formData={formData} setFormData={setFormData} saving={saving} setSaving={setSaving} />
          </TabsContent>
          <TabsContent value="pagos">
            <PagosTab formData={formData} setFormData={setFormData} saving={saving} setSaving={setSaving} />
          </TabsContent>
          <TabsContent value="usuarios">
            <UsuariosTab />
          </TabsContent>
          <TabsContent value="preferencias">
            <PreferenciasTab />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}