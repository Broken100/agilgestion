# Change: Comprehensive Improvements — Error Handling, POS Payment & QR Code

**Status**: proposed
**Created**: 2026-05-14
**Author**: SDD Orchestrator

---

## Intent

Mejorar la robustez del sistema mediante manejo de errores estructurado en todas las capas, optimizar el flujo de pago del POS eliminando fricciones innecesarias, y agregar soporte para código QR en el método de pago Transferencia, permitiendo a los dueños de negocio configurar su propia imagen QR desde la administración.

## Scope

### Included

- **Error Handling System**: Error boundaries globales (root, auth, 404), componente ErrorCard compartido, mapeo de errores de dominio a HTTP status codes, toast de error en componentes POS, corrección de catch blocks vacíos
- **POS Payment Flow**: Eliminación de toast innecesario de verificación de stock, método de pago sin valor por defecto (requiere selección explícita)
- **QR Code para Transferencias**: Columna `qr_code_path` en businesses, endpoint de subida de imágenes, UI de administración de QR, visualización en POS al seleccionar Transferencia
- **Technical Documentation**: Documentación completa del sistema en `docs/TECHNICAL.md`

### Explicitly Excluded

- Manejo de errores en repositorios (infrastructure layer) — postergado para cambio futuro
- Almacenamiento de imágenes en S3/cloud (actualmente en `public/uploads/`)
- Validación de stock en tiempo real vía WebSockets
- Múltiples códigos QR por método de pago

## Affected Modules

| Package | Files Changed | Type |
|---------|--------------|------|
| `packages/infrastructure` | `src/db/schema.ts`, `src/db/migrations/0001_*.sql` | DB schema + migration |
| `packages/domain` | `src/entities/Negocio.ts` | Entity update |
| `apps/web` | ~20 archivos | Frontend + API |

## Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Imágenes QR se pierden en deploy de Vercel | Medium | High | Almacenamiento local `public/uploads/` es efímero en serverless — migrar a S3 en futuro |
| Error boundaries no capturan todos los casos de error | Medium | Low | Pruebas E2E cubren flujos críticos |
| Usuario no selecciona método de pago y no puede confirmar | Low | Medium | Interfaz obliga a selección, es intencional |

## Rollback Plan

Revert commits en orden inverso:
1. `git revert HEAD` (último commit con todos los cambios)
2. Ejecutar `drizzle-kit migrate` para revertir migración 0001 (o ALTER TABLE DROP COLUMN manual)
