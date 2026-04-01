# Backend Tasks (NestJS)

## Current Baseline (Done)
- [x] Nest app bootstrapped with TypeORM and MySQL
- [x] Auth endpoints implemented (`login`, `register-owner`, invites)
- [x] DTO validation enabled globally (`ValidationPipe`)
- [x] JWT auth guard + strategy present
- [x] Core entities present (`users`, `offices`, `clients`)

## Sprint A: Platform Foundations
- [ ] Add global API prefix (`/api`) and consistent error response format
- [ ] Add config module with env schema validation
- [ ] Add request logging interceptor and global exception filter
- [ ] Add health endpoint and readiness check
- [ ] Add migration workflow (replace `synchronize` style dependency if present)

## Sprint B: Projects + Milestones + Tasks API
- [ ] Implement `projects` module (CRUD + office scoping)
- [ ] Implement `milestones` module (CRUD + project relation)
- [ ] Implement `tasks` module (CRUD + status transitions + ordering index)
- [ ] Implement activity log service for project/task/invoice actions
- [ ] Add pagination/filter/sort query DTOs for list endpoints

## Sprint C: Multi-Tenancy + RBAC Hardening
- [ ] Implement tenant context guard/interceptor using `officeId` from JWT
- [ ] Enforce office scoping in all repository queries
- [ ] Add role guard and permission map by endpoint
- [ ] Add audit fields (`createdBy`, `updatedBy`) where needed
- [ ] Add integration tests for cross-tenant isolation

## Sprint D: Invoices + Payments + Files
- [ ] Implement `invoices` module and `invoice_items` relations
- [ ] Implement invoice totals calculation (server-side source of truth)
- [ ] Implement invoice PDF generation endpoint
- [ ] Implement Paymob checkout + webhook verification + invoice status update
- [ ] Implement file upload module via Cloudinary

## Sprint E: Notifications + Admin + Reliability
- [ ] Add websocket gateway for real-time notifications
- [ ] Add queued email notifications (Bull + processor)
- [ ] Implement super-admin module (`offices`, plans, usage stats)
- [ ] Add seed scripts for demo data
- [ ] Add unit/integration test suite for auth/projects/invoices

---

## Phase Plan Reference

Detailed task breakdowns per phase:
- [Phase 0: Foundations & Security](./phase_0_foundations.md) — API prefix, guards, entities, Swagger, seed
- [Phase 1: Projects & Tasks](./phase_1_projects_tasks.md) — projects/milestones/tasks CRUD, activity log
- [Phase 2: Invoices & Client Portal](./phase_2_invoices_client.md) — invoices, PDF, Paymob, files, client auth
- [Phase 3: Real-time & Admin](./phase_3_realtime_admin.md) — WebSocket, email, comments, notifications, super admin
- [Phase 4: Testing & Delivery](./phase_4_testing_delivery.md) — unit/integration tests, Docker, deploy

