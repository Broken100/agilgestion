CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid,
	"tipo" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"metadata" text,
	"ip_address" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"ruc" text NOT NULL,
	"nombre_comercial" text,
	"direccion" text,
	"telefono" text,
	"email" text,
	"ambiente_sri" text DEFAULT 'PRUEBAS',
	"certificado_path" text,
	"certificado_password" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "businesses_ruc_unique" UNIQUE("ruc")
);
--> statement-breakpoint
CREATE TABLE "categorias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "categorias" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"tipo_identificacion" text NOT NULL,
	"identificacion" text NOT NULL,
	"razon_social" text NOT NULL,
	"nombre_comercial" text,
	"direccion" text,
	"telefono" text,
	"email" text,
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "clientes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "lineas_venta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venta_id" uuid NOT NULL,
	"producto_id" uuid NOT NULL,
	"producto_codigo" text NOT NULL,
	"producto_nombre" text NOT NULL,
	"cantidad" integer NOT NULL,
	"precio_unitario" numeric(10, 2) NOT NULL,
	"porcentaje_impuesto" numeric(5, 2) NOT NULL,
	"descuento" numeric(10, 2) DEFAULT '0',
	"subtotal_linea" numeric(10, 2) NOT NULL,
	"impuesto_linea" numeric(10, 2) NOT NULL,
	"total_linea" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"precio_unitario" numeric(10, 2) NOT NULL,
	"categoria_id" uuid,
	"stock_actual" integer DEFAULT 0,
	"stock_minimo" integer DEFAULT 0,
	"tipo_impuesto" text DEFAULT 'IVA15' NOT NULL,
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "productos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sri_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venta_id" uuid NOT NULL,
	"xml_firmado" text NOT NULL,
	"clave_acceso" text NOT NULL,
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 5,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"last_attempt_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"nombre" text NOT NULL,
	"rol" text DEFAULT 'OWNER' NOT NULL,
	"activo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ventas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"numero_factura" text NOT NULL,
	"fecha" timestamp DEFAULT now(),
	"cliente_id" uuid,
	"subtotal" numeric(10, 2) NOT NULL,
	"descuento_total" numeric(10, 2) DEFAULT '0',
	"impuesto_total" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"estado_sri" text DEFAULT 'PENDIENTE' NOT NULL,
	"clave_acceso" text,
	"xml_autorizado" text,
	"medio_pago" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ventas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineas_venta" ADD CONSTRAINT "lineas_venta_venta_id_ventas_id_fk" FOREIGN KEY ("venta_id") REFERENCES "public"."ventas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineas_venta" ADD CONSTRAINT "lineas_venta_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productos" ADD CONSTRAINT "productos_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sri_queue" ADD CONSTRAINT "sri_queue_venta_id_ventas_id_fk" FOREIGN KEY ("venta_id") REFERENCES "public"."ventas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_productos_business_codigo" ON "productos" USING btree ("business_id","codigo");--> statement-breakpoint
CREATE INDEX "idx_productos_business_nombre" ON "productos" USING btree ("business_id","nombre");--> statement-breakpoint
CREATE POLICY "categorias_rls" ON "categorias" AS PERMISSIVE FOR ALL TO public USING (business_id = current_setting('app.current_business_id')::uuid) WITH CHECK (business_id = current_setting('app.current_business_id')::uuid);--> statement-breakpoint
CREATE POLICY "clientes_rls" ON "clientes" AS PERMISSIVE FOR ALL TO public USING (business_id = current_setting('app.current_business_id')::uuid) WITH CHECK (business_id = current_setting('app.current_business_id')::uuid);--> statement-breakpoint
CREATE POLICY "productos_rls" ON "productos" AS PERMISSIVE FOR ALL TO public USING (business_id = current_setting('app.current_business_id')::uuid) WITH CHECK (business_id = current_setting('app.current_business_id')::uuid);--> statement-breakpoint
CREATE POLICY "users_rls" ON "users" AS PERMISSIVE FOR ALL TO public USING (business_id = current_setting('app.current_business_id')::uuid) WITH CHECK (business_id = current_setting('app.current_business_id')::uuid);--> statement-breakpoint
CREATE POLICY "ventas_rls" ON "ventas" AS PERMISSIVE FOR ALL TO public USING (business_id = current_setting('app.current_business_id')::uuid) WITH CHECK (business_id = current_setting('app.current_business_id')::uuid);