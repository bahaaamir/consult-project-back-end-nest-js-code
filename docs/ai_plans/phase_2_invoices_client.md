# Phase 2 — Invoices & Client Portal

**Timeline:** Weeks 6–8
**Goal:** Invoice lifecycle (create→send→pay), PDF generation, Paymob integration, file uploads, client portal.
**Dependencies:** Phase 0 + Phase 1 complete (entities, projects, tasks working end-to-end).

---

## Backend

### 2.1 Invoices Module — CRUD

#### 2.1.1 Invoice DTOs
- [ ] `CreateInvoiceDto` — client_id (required), project_id (optional), due_date (optional), items (array, min 1), tax_percent (optional, default 0), discount (optional, default 0), notes (optional)
- [ ] `CreateInvoiceItemDto` — description (required), quantity (required, >0), unit_price (required, >=0)
- [ ] `UpdateInvoiceDto` — due_date, notes, tax_percent, discount, items (only if draft)
- [ ] `FilterInvoicesDto` — status (optional), client_id (optional), project_id (optional), page, limit, sort_by, sort_order

#### 2.1.2 Invoice Number Generation
- [ ] Auto-generate format: `INV-{YEAR}-{SEQUENCE}`
- [ ] Sequence is per-office, auto-incrementing
- [ ] Example: `INV-2026-0001`, `INV-2026-0002`
- [ ] Use database transaction to prevent duplicate numbers

#### 2.1.3 Invoice Totals Calculation (Server-Side Source of Truth)
- [ ] `subtotal = SUM(item.quantity * item.unit_price)` for all items
- [ ] `tax_amount = subtotal * (tax_percent / 100)`
- [ ] `total = subtotal + tax_amount - discount`
- [ ] Recalculate on every create/update (ignore client-sent totals)
- [ ] Store calculated values in database

#### 2.1.4 Invoices Service
- [ ] `create(dto, user)` — create invoice with items, calculate totals, set office_id, status=draft
- [ ] `findAll(filterDto, user)` — paginated list, office-scoped
- [ ] `findOne(id, user)` — single invoice with items and client
- [ ] `update(id, dto, user)` — update invoice items/totals (only if draft)
- [ ] `remove(id, user)` — delete invoice (only if draft)
- [ ] `send(id, user)` — change status draft→sent, send email, log activity
- [ ] `markPaid(id, paymentRef)` — change status→paid, store payment_ref, paid_at, notify

#### 2.1.5 Invoices Controller
- [ ] `POST /api/invoices` — @Roles(Owner)
- [ ] `GET /api/invoices` — @Roles(Owner, Manager)
- [ ] `GET /api/invoices/:id` — @Roles(Owner, Manager)
- [ ] `PATCH /api/invoices/:id` — @Roles(Owner) — only draft
- [ ] `DELETE /api/invoices/:id` — @Roles(Owner) — only draft
- [ ] `POST /api/invoices/:id/send` — @Roles(Owner) — only draft
- [ ] State machine enforcement: can't edit after sent, can't send if already sent/paid

### 2.2 Invoice PDF Generation

#### 2.2.1 PDF Template
- [ ] Create HTML template (`src/invoices/templates/invoice.html`)
  - Office logo and name (top-left)
  - Invoice number and date (top-right)
  - Client company name and address
  - Items table: description, quantity, unit price, line total
  - Subtotal, tax, discount, total
  - Notes section (if present)
  - "Pay Now" button/link for client

#### 2.2.2 PDF Service
- [ ] Install `puppeteer` package
- [ ] Create `PdfService` with `generateInvoicePdf(invoice)` method
- [ ] Render HTML template with Handlebars or string interpolation
- [ ] Use Puppeteer to convert HTML to PDF buffer
- [ ] Return PDF as buffer or stream

#### 2.2.3 PDF Endpoint
- [ ] `GET /api/invoices/:id/pdf`
  - Generate PDF on-the-fly (or cache in Cloudinary)
  - Return as `application/pdf` response
  - Alternatively: upload to Cloudinary, return signed URL (24h expiry)
- [ ] @Roles(Owner, Manager, Client Owner)

### 2.3 Paymob Integration

#### 2.3.1 Paymob Service
- [ ] Create `PaymobService` (`src/payments/services/paymob.service.ts`)
- [ ] Step 1: `authenticate()` — `POST /auth/tokens` → get `authentication_token`
- [ ] Step 2: `createOrder(token, invoice)` — `POST /ecommerce/orders` → get `order_id`
- [ ] Step 3: `createPaymentKey(token, orderId, invoice)` — `POST /acceptance/payment_keys` → get `payment_key`
- [ ] Step 4: Return checkout URL: `https://accept.paymob.com/api/acceptance/iframes/{iframe_id}?payment_token={payment_key}`
- [ ] All API keys from environment variables

#### 2.3.2 Paymob Controller
- [ ] `POST /api/invoices/:id/pay` — creates Paymob payment intent, returns checkout URL
- [ ] `POST /api/webhooks/paymob` — webhook handler (no auth, HMAC verified)
  - Verify HMAC signature from Paymob
  - Extract invoice_id from webhook data
  - Call `InvoicesService.markPaid()` on success
  - Return 200 to acknowledge
  - Reject with 401 if HMAC invalid

#### 2.3.3 Payment Flow
- [ ] Client clicks "Pay Now" on invoice
- [ ] Frontend calls `POST /api/invoices/:id/pay`
- [ ] Backend creates Paymob order + payment key
- [ ] Frontend redirects to Paymob checkout iframe
- [ ] Client completes payment on Paymob
- [ ] Paymob sends webhook to `POST /api/webhooks/paymob`
- [ ] Backend verifies HMAC, marks invoice paid, sends notifications

### 2.4 Files Module

#### 2.4.1 Cloudinary Service
- [ ] Install `cloudinary` package
- [ ] Create `CloudinaryService` (`src/files/services/cloudinary.service.ts`)
- [ ] `upload(file)` — upload buffer to Cloudinary, return { url, public_id, bytes, format }
- [ ] `delete(publicId)` — delete from Cloudinary
- [ ] Config from env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

#### 2.4.2 Files Controller
- [ ] `POST /api/files/upload` — multipart/form-data
  - Accept file field + project_id
  - Validate: max 25MB, allowed types (pdf, doc, docx, xls, xlsx, jpg, jpeg, png, zip)
  - Upload to Cloudinary, save record to DB
  - @Roles(Owner, Manager, Employee) — or Client with can_upload permission
- [ ] `GET /api/files` — list files by project_id (query param)
- [ ] `DELETE /api/files/:id` — delete file from Cloudinary + DB
- [ ] Use `@nestjs/platform-express` Multer for file handling

### 2.5 Client Auth (Separate System)

#### 2.5.1 Client Auth Controller
- [ ] `POST /api/auth/client/login`
  - Accept email + password
  - Validate against `client_users` table
  - Issue JWT with payload: { sub: client_user_id, client_id, role, permissions }
  - Separate JWT secret or same secret with different issuer
  - Rate limit: 5 attempts per 15 minutes

#### 2.5.2 Client Auth Guards
- [ ] `ClientJwtGuard` — validates JWT, extracts client user info
- [ ] `ClientTenantGuard` — ensures client_user can only access their client's data
- [ ] `ClientRoleGuard` — checks client_owner vs client_employee permissions

### 2.6 Client Portal API

#### 2.6.1 Client Projects
- [ ] `GET /api/client/projects` — list projects for client_id (from JWT)
  - Response: name, status, progress, start_date, end_date, last_activity
  - Client Employee sees only if Client Owner allows (permissions check)
- [ ] `GET /api/client/projects/:id` — project detail
  - Response: project info + milestones + tasks (read-only status)

#### 2.6.2 Client Invoices
- [ ] `GET /api/client/invoices` — list invoices for client
  - Response: invoice_number, status, total, due_date, is_overdue
  - Client Employee: NEVER sees invoices (403)
- [ ] `GET /api/client/invoices/:id` — invoice detail with items
- [ ] `POST /api/client/invoices/:id/pay` — initiate payment (same Paymob flow)

#### 2.6.3 Client Comments & Files
- [ ] `POST /api/client/comments` — add comment (checks can_comment permission)
- [ ] `POST /api/client/files/upload` — upload file (checks can_upload permission)

#### 2.6.4 Client User Management
- [ ] `POST /api/client/users/invite` — Client Owner invites employee
  - Send email with invite link
  - Set permissions: can_comment, can_upload
- [ ] `GET /api/client/users` — list client users (Client Owner only)
- [ ] `PATCH /api/client/users/:id/permissions` — update permissions
- [ ] `PATCH /api/client/users/:id/deactivate` — deactivate user

---

## Frontend

### 2.7 Invoices Service
- [ ] Create `InvoicesService` (`src/app/features/invoices/services/invoices.service.ts`)
  - `create(data)`, `findAll(filters)`, `findOne(id)`, `update(id, data)`, `remove(id)`
  - `send(id)`, `getPdfUrl(id)`, `initiatePayment(id)`

### 2.8 Invoices List Page
- [ ] Route: `/invoices` (lazy loaded)
- [ ] Table: Invoice #, Client, Project, Status (chip), Total, Issue Date, Due Date
- [ ] Status filter (Draft, Sent, Paid, Overdue)
- [ ] Client filter
- [ ] "New Invoice" button
- [ ] Click row → navigate to `/invoices/:id`
- [ ] Status chips: gray (draft), blue (sent), green (paid), red (overdue)
- [ ] Loading/empty states

### 2.9 Create Invoice Page
- [ ] Route: `/invoices/new`
- [ ] Client selector (dropdown from API)
- [ ] Project selector (optional, filtered by selected client)
- [ ] Item editor table:
  - Add/remove rows
  - Columns: description, quantity, unit price, line total
  - Line total = quantity × unit price (calculated)
- [ ] Tax percent input
- [ ] Discount input
- [ ] Live totals preview: Subtotal, Tax, Discount, **Total**
- [ ] Notes textarea
- [ ] "Save as Draft" and "Save & Preview" buttons
- [ ] Validation: at least 1 item, quantity > 0, unit_price >= 0

### 2.10 Invoice Detail Page
- [ ] Route: `/invoices/:id`
- [ ] Invoice header: number, status, client, project, dates
- [ ] Items table (read-only after sent)
- [ ] Totals section
- [ ] Actions:
  - If draft: Edit, Delete, Send to Client
  - If sent: Download PDF, View Payment Status
  - If paid: Download PDF, Payment Reference, Paid Date
- [ ] PDF preview (iframe or download link)
- [ ] Activity log for invoice

### 2.11 File Upload Component
- [ ] Create `<app-file-upload>` component
- [ ] Drag & drop zone with click fallback
- [ ] File type validation (client-side)
- [ ] File size validation (max 25MB)
- [ ] Upload progress bar
- [ ] File list with: name, size, type icon, uploaded by, date, delete button
- [ ] Integrate in project detail → Files tab

### 2.12 Client Portal — Login Page
- [ ] Route: `/client/login`
- [ ] Separate login form (email + password)
- [ ] Calls `POST /api/auth/client/login`
- [ ] On success: store JWT, redirect to `/client/projects`
- [ ] Error handling (invalid credentials, account suspended)

### 2.13 Client Portal — Layout
- [ ] Separate layout component (no office sidebar — simpler nav)
- [ ] Top bar: client company name, user name, logout
- [ ] Nav: Projects, Invoices (Client Owner only), Settings

### 2.14 Client Portal — Projects List
- [ ] Route: `/client/projects`
- [ ] Card or table view of client's projects
- [ ] Each: name, status, progress bar, last updated
- [ ] Click → navigate to detail

### 2.15 Client Portal — Project Detail
- [ ] Route: `/client/projects/:id`
- [ ] Project info (read-only)
- [ ] Milestones with task status (read-only)
- [ ] Files tab (can upload if permitted)
- [ ] Comments tab (can comment if permitted)
- [ ] Activity feed

### 2.16 Client Portal — Invoices
- [ ] Route: `/client/invoices` (Client Owner only)
- [ ] Table: Invoice #, Total, Status, Due Date, Action
- [ ] "Pay Now" button on unpaid invoices → redirect to Paymob
- [ ] Invoice detail: items, totals, PDF download

### 2.17 Client Portal — Payment Return
- [ ] Route: `/client/payment/callback`
- [ ] Handle Paymob redirect after payment
- [ ] Show success/failure/pending status
- [ ] Link back to invoices

### 2.18 Client Portal — Settings
- [ ] Client Owner: manage team members (invite, permissions, deactivate)
- [ ] Client Employee: view own profile

---

## Acceptance Criteria — Phase 2

- [ ] Owner creates invoice with items → totals auto-calculated → saved as draft
- [ ] Owner sends invoice → status changes to sent → email goes to client
- [ ] Client logs in → sees their projects and invoices
- [ ] Client clicks Pay Now → redirected to Paymob → completes payment
- [ ] Webhook received → invoice status changes to paid → both sides notified
- [ ] PDF generates with correct data and formatting
- [ ] File upload works with type/size validation
- [ ] Client Employee cannot see invoices (403)
- [ ] Cross-client isolation: Client A cannot see Client B's data
