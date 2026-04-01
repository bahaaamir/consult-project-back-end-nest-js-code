# Frontend Tasks (Angular 21)

## Current Baseline (Done)
- [x] Feature-based structure initialized (`core`, `shared`, `features`)
- [x] PrimeNG + Aura configured
- [x] App layout + auth layout implemented
- [x] Design-system wrappers (button, input, select, card, page-header)
- [x] Auth flow pages implemented (`/auth/login`, `/auth/signup`)
- [x] Auth facade/session/interceptor/guards integrated

## Sprint A: Projects Core UI
- [ ] Create `features/projects` routes and pages (`list`, `details`)
- [ ] Build projects table with filters (status, client, date range)
- [ ] Add create/edit project form with server validation mapping
- [ ] Add project details tabs (`overview`, `milestones`, `tasks`, `activity`)
- [ ] Add loading/empty/error states for all project screens

## Sprint B: Tasks + Kanban UI
- [ ] Create task board with columns (`todo`, `in_progress`, `review`, `done`)
- [ ] Implement drag-and-drop with optimistic UI update and rollback on API fail
- [ ] Add task create/edit drawer with assignee and due date
- [ ] Add task comments timeline UI
- [ ] Add activity stream widget in project details

## Sprint C: Owner Dashboard
- [ ] Build dashboard cards (active projects, overdue tasks, unpaid invoices)
- [ ] Add charts for project progress and monthly revenue
- [ ] Add recent activity feed and quick actions
- [ ] Add role-aware dashboard widgets (Owner vs Manager)

## Sprint D: Invoices + Client Portal UI
- [ ] Build invoices list/details/create screens
- [ ] Add invoice item editor with tax/discount totals preview
- [ ] Add invoice PDF preview and send action
- [ ] Build client portal login and read-only project/invoice pages
- [ ] Add pay-now flow screen for Paymob redirect lifecycle

## Sprint E: Polish + Quality
- [ ] Add route-level skeleton loaders and global error page
- [ ] Complete Arabic/English i18n with RTL toggle
- [ ] Accessibility pass (keyboard flow, aria, contrast, focus)
- [ ] Add unit tests for auth/projects/tasks pages
- [ ] Add Cypress e2e flows for login, signup, project CRUD, invoice send

---

## Phase Plan Reference

Detailed task breakdowns per phase:
- [Phase 0: Foundations & Security](./phase_0_foundations.md) — shared infrastructure, error handling, i18n prep
- [Phase 1: Projects & Tasks](./phase_1_projects_tasks.md) — projects UI, Kanban board, dashboard wiring
- [Phase 2: Invoices & Client Portal](./phase_2_invoices_client.md) — invoice builder, client portal UI
- [Phase 3: Real-time & Admin](./phase_3_realtime_admin.md) — notifications, super admin UI, team/settings
- [Phase 4: Testing & Polish](./phase_4_testing_delivery.md) — i18n, accessibility, responsive, E2E tests

