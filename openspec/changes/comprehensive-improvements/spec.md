# Spec: Comprehensive Improvements

**Status**: specified
**Created**: 2026-05-14
**Depends on**: proposal.md

---

## Feature 1: Error Handling System

### Requirements

- REQ-1.1: The application SHALL display a user-friendly error page when any route crashes unexpectedly
- REQ-1.2: A global `error.tsx` SHALL exist at the root of the App Router
- REQ-1.3: A custom `not-found.tsx` SHALL exist for 404 routes
- REQ-1.4: The `(auth)` segment SHALL have its own error boundary
- REQ-1.5: Error pages SHALL display an icon, message, and a "Reintentar" (retry) button
- REQ-1.6: A shared `ErrorCard` component SHALL encapsulate the error UI pattern
- REQ-1.7: All 4 existing error.tsx files (dashboard, reportes, productos, pos) SHALL use ErrorCard
- REQ-1.8: POS sub-components (product-search, available-products, top-selling) SHALL display a toast error when fetch fails
- REQ-1.9: The system SHALL map domain error codes to proper HTTP status codes
- REQ-1.10: `StockInsuficienteError` SHALL return HTTP 409
- REQ-1.11: `ProductoNoEncontradoError` SHALL return HTTP 404
- REQ-1.12: `VentaSinLineasError` SHALL return HTTP 400
- REQ-1.13: Empty catch blocks in reportes/page.tsx, dashboard/page.tsx, and sri-store.ts SHALL include error logging
- REQ-1.14: Logout SHALL redirect to the landing page (`/`)

### Scenarios

**SC-1.1: Global error boundary**
Given any page throws an unhandled error
When the error boundary catches it
Then the user sees a friendly error page with retry button

**SC-1.2: 404 page**
Given a user navigates to a non-existent route
Then they see a custom 404 page with "Volver al inicio" button

**SC-1.3: Stock error mapping**
Given a sale is attempted with insufficient stock
When the API processes the request
Then it returns HTTP 409 with the domain error message

**SC-1.4: Logout redirect**
Given a user clicks "Cerrar sesión"
Then the store is cleared
And the user is redirected to `/`

---

## Feature 2: POS Payment Improvements

### Requirements

- REQ-2.1: The toast warning "Verificando disponibilidad de stock..." SHALL NOT appear when confirming a payment
- REQ-2.2: The payment method selection SHALL NOT have a default value
- REQ-2.3: The "Confirmar Venta" button SHALL be disabled until the user explicitly selects a payment method
- REQ-2.4: For cash payments, the amount received field SHALL still be required

### Scenarios

**SC-2.1: No default payment method**
Given a user navigates to the payment confirmation page
Then no payment method is pre-selected
And the confirm button is disabled

**SC-2.2: Must select method**
Given the user has not selected a payment method
When they click "Confirmar Venta"
Then nothing happens (button is disabled)

**SC-2.3: Select and confirm**
Given the user selects a payment method
Then the confirm button becomes enabled (cash also requires amount)

---

## Feature 3: QR Code para Transferencias

### Requirements

- REQ-3.1: The `businesses` table SHALL have a `qr_code_path` text column
- REQ-3.2: The `Negocio` domain entity SHALL include `qrCodePath: string | null`
- REQ-3.3: The `NegocioInput` SHALL accept an optional `qrCodePath`
- REQ-3.4: A `POST /api/upload` endpoint SHALL accept image uploads via FormData
- REQ-3.5: Allowed formats SHALL be: png, jpg, jpeg, gif, webp
- REQ-3.6: Images SHALL be saved to `public/uploads/qr-{businessId}.{ext}`
- REQ-3.7: The admin settings page SHALL have a QR code upload section
- REQ-3.8: The admin page SHALL show a preview of the current QR image if one exists
- REQ-3.9: The admin SHALL be able to replace or remove the QR code
- REQ-3.10: The POS payment confirmation page SHALL display the QR image when "Transferencia" is selected
- REQ-3.11: If no QR is configured, a message "El negocio no ha configurado un código QR" SHALL be shown
- REQ-3.12: A new function `apiUpload()` SHALL be added for FormData requests with auth token

### Scenarios

**SC-3.1: Upload QR code**
Given an authenticated owner on the admin settings page
When they select an image file and upload
Then the image is saved and previewed
And the path is persisted to the database

**SC-3.2: Show QR in POS**
Given a customer is paying via Transferencia
When the cashier selects "Transferencia" as payment method
Then the QR code image is displayed prominently
And the customer can scan it to pay

**SC-3.3: No QR configured**
Given a customer wants to pay via Transferencia
But the business has not configured a QR code
Then a message is shown indicating QR is not configured

---

## Feature 4: Technical Documentation

### Requirements

- REQ-4.1: A `docs/TECHNICAL.md` file SHALL exist at the project root
- REQ-4.2: The documentation SHALL cover: architecture, database schema, API, frontend, domain, infrastructure, SRI integration, capacity limits, testing, configuration
