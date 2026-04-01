# Consulting OS Stack Tasks (Angular + Nest)

## Progress Snapshot
- [x] Angular app foundation and design system baseline
- [x] Nest auth baseline and DTO validation
- [x] Enterprise login/signup UI wired to Nest auth
- [ ] Projects domain (API + UI)
- [ ] Tasks/Kanban domain (API + UI)
- [ ] Invoices/payments/files domain (API + UI)
- [ ] Realtime/notifications/admin and delivery hardening

## Phase Plan

Detailed phase breakdowns live in separate files:

| Phase | File | Weeks | Status |
|---|---|---|---|
| Phase 0: Foundations & Security | [phase_0_foundations.md](./phase_0_foundations.md) | 1–2 | Not Started |
| Phase 1: Projects & Tasks | [phase_1_projects_tasks.md](./phase_1_projects_tasks.md) | 3–5 | Not Started |
| Phase 2: Invoices & Client Portal | [phase_2_invoices_client.md](./phase_2_invoices_client.md) | 6–8 | Not Started |
| Phase 3: Real-time & Super Admin | [phase_3_realtime_admin.md](./phase_3_realtime_admin.md) | 9–10 | Not Started |
| Phase 4: Testing & Delivery | [phase_4_testing_delivery.md](./phase_4_testing_delivery.md) | 11–12 | Not Started |

## Priority 1: Stabilize Platform Contracts
- [ ] Lock API base contract (`/api` prefix, error envelope, pagination shape)
- [ ] Publish shared API contract doc for frontend/backend alignment
- [ ] Add environment configuration docs for local/dev/stage

## Priority 2: Projects Vertical Slice (End-to-End)
- [ ] Backend: implement projects CRUD with tenant scoping and RBAC
- [ ] Frontend: implement projects list/details/create/edit
- [ ] Add tests: service + controller + UI integration for projects
- [ ] Demo checkpoint: owner creates and updates project successfully

## Priority 3: Tasks + Kanban Vertical Slice
- [ ] Backend: tasks CRUD, assignment, status transitions, ordering
- [ ] Frontend: Kanban board with drag-and-drop and task form
- [ ] Backend/frontend activity log integration
- [ ] Demo checkpoint: task moves across columns and logs activity

## Priority 4: Invoices + Client Value Slice
- [ ] Backend: invoices + items + totals + PDF endpoint
- [ ] Backend: Paymob checkout and webhook status reconciliation
- [ ] Frontend: invoice list/details/create/send/pay flow
- [ ] Client portal: read-only projects and invoices
- [ ] Demo checkpoint: invoice created, sent, and marked paid

## Priority 5: Reliability, Security, and Delivery
- [ ] Tenant isolation integration tests (cross-office access denied)
- [ ] RBAC policy tests by role matrix
- [ ] Realtime notifications and queued emails
- [ ] Super admin office management endpoints and UI
- [ ] CI checks, seed data, deployment runbook, and release checklist

## Execution Rules
- Every feature ships as vertical slice (backend + frontend + tests)
- No module considered done without role checks + tenant checks
- No UI screen considered done without loading/empty/error states
- Keep `angular_tasks.md` and `nest_tasks.md` updated per sprint
