# Phase 0 — Platform Foundations & Security Hardening

**Timeline:** Weeks 1–2
**Goal:** Lock API contracts, harden security, complete entity layer, establish dev tooling.
**Dependencies:** None — builds on existing auth baseline.

---

## Backend

### 0.1 API Contract & Prefix
- [ ] Add global prefix `/api` in `main.ts` via `app.setGlobalPrefix('api')`
- [ ] Create `HttpExceptionFilter` implementing `ExceptionFilter`
  - Response format: `{ success: false, statusCode, error, message, details[], timestamp, path }`
  - Handles `HttpException`, `QueryFailedError`, `ValidationError`, unknown errors
  - Register as global filter in `main.ts`
- [ ] Create health endpoint `GET /api/health`
  - Returns `{ status: 'ok', database: 'connected' }`
  - No auth required

### 0.2 Security Guards
- [ ] Create `@Roles()` decorator (`src/common/decorators/roles.decorator.ts`)
  - Uses `SetMetadata` to attach allowed roles to route
- [ ] Create `RolesGuard` (`src/common/guards/roles.guard.ts`)
  - Reads `req.user.role` from JWT payload
  - Compares against roles metadata from `@Roles()`
  - Returns 403 if role not in allowed list
- [ ] Create `@OfficeScoped()` decorator for tenant enforcement
- [ ] Create `TenantGuard` (`src/common/guards/tenant.guard.ts`)
  - Extracts `officeId` from `req.user` (JWT payload)
  - Sets `req.officeId` for service layer to use
  - Blocks cross-tenant access with 403

### 0.3 Logging & Observability
- [ ] Create `LoggingInterceptor` (`src/common/interceptors/logging.interceptor.ts`)
  - Logs: HTTP method, path, status code, response time (ms)
  - Uses NestJS `Logger` service
- [ ] Add environment validation with `joi`
  - Install `joi` package
  - Create schema in `ConfigModule.forRoot()` validation
  - Required: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`
  - Optional: `CLOUDINARY_*`, `PAYMOB_*`, `SMTP_*`

### 0.4 Missing Entities

Create all in `src/` under respective module folders:

- [ ] `Project` entity (`src/projects/entities/project.entity.ts`)
  - Columns: id (uuid), office_id (FK→offices), client_id (FK→clients), name, description, status (enum: active/paused/completed/cancelled), start_date, end_date, budget, progress (0-100), created_by (FK→users), created_at, updated_at

- [ ] `Milestone` entity (`src/milestones/entities/milestone.entity.ts`)
  - Columns: id (uuid), project_id (FK→projects), name, description, status (enum: pending/in_progress/completed), due_date, order_index, created_at, updated_at

- [ ] `Task` entity (`src/tasks/entities/task.entity.ts`)
  - Columns: id (uuid), milestone_id (FK→milestones), project_id (FK→projects), title, description, status (enum: todo/in_progress/review/done), priority (enum: low/medium/high), assigned_to (FK→users, nullable), due_date, estimated_hours, order_index, created_by (FK→users), created_at, updated_at

- [ ] `ProjectMember` entity (`src/projects/entities/project-member.entity.ts`)
  - Columns: project_id (FK→projects), user_id (FK→users), role (enum: lead/member)
  - Composite primary key (project_id, user_id)

- [ ] `TimeLog` entity (`src/tasks/entities/time-log.entity.ts`)
  - Columns: id (uuid), task_id (FK→tasks), user_id (FK→users), hours (decimal), description, logged_at, created_at

- [ ] `File` entity (`src/files/entities/file.entity.ts`)
  - Columns: id (uuid), project_id (FK→projects), uploaded_by_user (FK→users, nullable), uploaded_by_client (FK→client_users, nullable), name, url, size_bytes, mime_type, created_at

- [ ] `Comment` entity (`src/comments/entities/comment.entity.ts`)
  - Columns: id (uuid), project_id (FK→projects), task_id (FK→tasks, nullable), user_id (FK→users, nullable), client_user_id (FK→client_users, nullable), content (text), created_at

- [ ] `ActivityLog` entity (`src/activity-logs/entities/activity-log.entity.ts`)
  - Columns: id (uuid), office_id (FK→offices), project_id (FK→projects, nullable), actor_user_id (FK→users, nullable), actor_client_id (FK→client_users, nullable), action (varchar), entity_type (varchar), entity_id (uuid), metadata (json), created_at

- [ ] `Invoice` entity (`src/invoices/entities/invoice.entity.ts`)
  - Columns: id (uuid), office_id (FK→offices), client_id (FK→clients), project_id (FK→projects, nullable), invoice_number (unique), status (enum: draft/sent/paid/overdue/cancelled), issue_date, due_date, subtotal, tax_percent, discount, total, notes, payment_ref, paid_at, created_at, updated_at

- [ ] `InvoiceItem` entity (`src/invoices/entities/invoice-item.entity.ts`)
  - Columns: id (uuid), invoice_id (FK→invoices), description, quantity, unit_price, total

- [ ] `Notification` entity (`src/notifications/entities/notification.entity.ts`)
  - Columns: id (uuid), office_id (FK→offices, nullable), user_id (FK→users, nullable), client_user_id (FK→client_users, nullable), type, title, body, is_read, metadata (json), created_at

- [ ] `Subscription` entity (`src/subscriptions/entities/subscription.entity.ts`)
  - Columns: id (uuid), office_id (FK→offices), plan (enum), started_at, expires_at, is_active, payment_ref

- [ ] Add `mfa_secret` (varchar, nullable) and `mfa_enabled` (boolean, default false) columns to `User` entity

### 0.5 Dev Tooling
- [ ] Install and configure `@nestjs/swagger`
  - `npm install @nestjs/swagger`
  - Add `SwaggerModule.setup('api/docs', app, document)` in `main.ts`
  - Add `@ApiTags()`, `@ApiResponse()`, `@ApiBearerAuth()` decorators to existing controllers
- [ ] Create seed script (`src/database/seeds/seed.ts`)
  - Insert demo office (name: "TechConsult", slug: "techconsult")
  - Insert super admin user
  - Insert owner user
  - Insert 2 employees
  - Insert 2 demo clients
  - Run with `npm run seed`

---

## Frontend

### 0.6 API Alignment
- [ ] Update `ApiCallerService` base URL to include `/api` prefix
  - Change `environment.apiBaseUrl` or add prefix in service
- [ ] Create `errorInterceptor` (`src/app/core/interceptors/error.interceptor.ts`)
  - 401 → clear session, redirect to `/auth/login`
  - 403 → show forbidden toast
  - 500 → show error toast with generic message
  - Register in `app.config.ts` providers

### 0.7 Shared Infrastructure
- [ ] Create error page component (`src/app/features/errors/`)
  - 404 page with "Page not found" + link to dashboard
  - 403 page with "Access denied" + link to dashboard
  - Update wildcard route to point to 404 instead of redirect
- [ ] Create `roleGuard` (`src/app/core/auth/guards/role.guard.ts`)
  - Functional `CanActivateFn` factory
  - Takes allowed roles as parameter
  - Checks `AuthStore.currentUser().role`
  - Redirects to dashboard if role not allowed
- [ ] Create shared entity models (`src/app/shared/models/`)
  - `project.model.ts` — Project, ProjectStatus, Milestone interfaces
  - `task.model.ts` — Task, TaskStatus, TaskPriority interfaces
  - `invoice.model.ts` — Invoice, InvoiceStatus, InvoiceItem interfaces
  - `client.model.ts` — Client, ClientUser interfaces
  - `notification.model.ts` — Notification interface
  - `activity-log.model.ts` — ActivityLog interface
- [ ] Create `<app-loading>` component — spinner with optional message
- [ ] Create `<app-empty-state>` component — icon + message + CTA button slot
- [ ] Create `<app-error-state>` component — error icon + message + retry button
- [ ] Create `<app-confirm-dialog>` component — title + message + confirm/cancel buttons
- [ ] Create toast notification service (`src/app/shared/services/toast.service.ts`)
  - Wraps PrimeNG `MessageService`
  - Methods: `success()`, `error()`, `warn()`, `info()`

---

## Acceptance Criteria — Phase 0

- [ ] `GET /api/health` returns 200 without auth
- [ ] `GET /api/projects` returns 401 without JWT
- [ ] All new entities exist in database (auto-sync creates tables)
- [ ] Swagger docs accessible at `/api/docs`
- [ ] Seed script creates demo data without errors
- [ ] Angular error interceptor redirects to login on 401
- [ ] 404 page shows for unknown routes
- [ ] Toast service shows success/error messages
