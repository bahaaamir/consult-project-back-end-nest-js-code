# Phase 4 — Testing, Polish & Deployment

**Timeline:** Weeks 11–12
**Goal:** Production quality: comprehensive tests, i18n, accessibility, responsive design, deployment.
**Dependencies:** All previous phases complete and functional.

---

## Backend

### 4.1 Unit Tests — Auth Module
- [ ] `AuthService.validateUser()` — correct password → returns user
- [ ] `AuthService.validateUser()` — wrong password → throws UnauthorizedException
- [ ] `AuthService.validateUser()` — user not found → throws UnauthorizedException
- [ ] `AuthService.validateUser()` — user suspended → throws UnauthorizedException
- [ ] `AuthService.login()` — returns JWT with correct payload
- [ ] `AuthService.inviteUser()` — owner invites manager → creates invite
- [ ] `AuthService.inviteUser()` — employee invites someone → throws ForbiddenException
- [ ] `AuthService.acceptInvite()` — valid token → sets password, clears token
- [ ] `AuthService.acceptInvite()` — expired token → throws error
- [ ] Rate limiting — 5 failed attempts → 429

### 4.2 Unit Tests — Projects Module
- [ ] `ProjectsService.create()` — creates project with correct office_id
- [ ] `ProjectsService.create()` — client from different office → 403
- [ ] `ProjectsService.findAll()` — returns only same-office projects
- [ ] `ProjectsService.findAll()` — employee sees only assigned projects
- [ ] `ProjectsService.update()` — updates project fields
- [ ] `ProjectsService.remove()` — sets status to cancelled (soft delete)

### 4.3 Unit Tests — Tasks Module
- [ ] `TasksService.create()` — creates task under correct milestone
- [ ] `TasksService.create()` — assignee from different office → 403
- [ ] `TasksService.updateStatus()` — valid transition → updates status
- [ ] `TasksService.updateStatus()` — logs activity
- [ ] `TasksService.updateStatus()` — recalculates project progress
- [ ] `TasksService.reorder()` — batch updates order_index
- [ ] Employee updates own task → succeeds
- [ ] Employee updates other's task → 403

### 4.4 Unit Tests — Invoices Module
- [ ] `InvoicesService.create()` — auto-generates invoice number
- [ ] `InvoicesService.create()` — calculates totals correctly
- [ ] `InvoicesService.update()` — draft invoice → updates
- [ ] `InvoicesService.update()` — sent invoice → 409 conflict
- [ ] `InvoicesService.send()` — draft → sent, email triggered
- [ ] `InvoicesService.send()` — sent invoice → 409 conflict
- [ ] `InvoicesService.markPaid()` — updates status, payment_ref, paid_at
- [ ] PDF generation — produces valid PDF buffer

### 4.5 Unit Tests — Paymob
- [ ] `PaymobService.authenticate()` — returns token
- [ ] `PaymobService.createOrder()` — returns order_id
- [ ] `PaymobService.createPaymentKey()` — returns payment_key
- [ ] Webhook handler — valid HMAC → marks invoice paid
- [ ] Webhook handler — invalid HMAC → 401

### 4.6 Integration Tests — Tenant Isolation
- [ ] User from Office A calls `GET /api/projects` → sees only Office A projects
- [ ] User from Office A calls `GET /api/projects/:id` with Office B project_id → 403
- [ ] User from Office A calls `GET /api/clients` → sees only Office A clients
- [ ] User from Office A calls `GET /api/invoices` → sees only Office A invoices
- [ ] Repeat for ALL list/get endpoints
- [ ] Client A cannot see Client B's data in same office

### 4.7 Integration Tests — RBAC Matrix

Test matrix (every role × every endpoint):

| Endpoint | Super Admin | Owner | Manager | Employee |
|---|---|---|---|---|
| POST /api/projects | ❌ 403 | ✅ 201 | ✅ 201 | ❌ 403 |
| GET /api/projects | ❌ 403 | ✅ 200 | ✅ 200 | ✅ 200 (own only) |
| DELETE /api/projects/:id | ❌ 403 | ✅ 200 | ✅ 200 | ❌ 403 |
| POST /api/invoices | ❌ 403 | ✅ 201 | ❌ 403 | ❌ 403 |
| GET /api/admin/stats | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 |
| POST /api/users/invite | ❌ 403 | ✅ 201 | ✅ 201 | ❌ 403 |
| ... (all endpoints) | | | | |

- [ ] Full matrix implemented and passing

### 4.8 Integration Tests — Invoice State Machine
- [ ] draft → send → sent ✅
- [ ] draft → edit → save ✅
- [ ] sent → edit → 409 ❌
- [ ] sent → send → 409 ❌
- [ ] sent → pay (webhook) → paid ✅
- [ ] paid → edit → 409 ❌
- [ ] draft → delete → deleted ✅
- [ ] sent → delete → 409 ❌

### 4.9 Seed Script (Production Demo Data)
- [ ] Create comprehensive seed script
- [ ] Insert 3 offices (starter, professional, enterprise plans)
- [ ] Insert super admin user
- [ ] Per office: owner, 2 managers, 4 employees
- [ ] Per office: 5 clients with 2 client_users each
- [ ] Per office: 8 projects with varying statuses
- [ ] Per project: 3-5 milestones, 10-20 tasks across columns
- [ ] Per office: 10 invoices (mix of draft, sent, paid, overdue)
- [ ] Comments, activity logs, files, notifications
- [ ] Run with `npm run seed`

### 4.10 Docker Compose Production Setup
```yaml
services:
  api:
    build: ./back-end
    ports: ["3000:3000"]
    depends_on: [mysql, redis]
    env_file: .env

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: consulting_os
    volumes: [mysql_data:/data]

  redis:
    image: redis:7-alpine
    volumes: [redis_data:/data]

  frontend:
    build: ./front-end
    ports: ["80:80"]
    depends_on: [api]
```
- [ ] Create `docker-compose.prod.yml`
- [ ] Create `Dockerfile` for NestJS (multi-stage build)
- [ ] Create `Dockerfile` for Angular (build + nginx serve)
- [ ] Create nginx config for Angular SPA routing

### 4.11 Deployment
- [ ] Deploy to VPS (DigitalOcean / Railway / Render)
- [ ] Environment variables configured in production
- [ ] SSL/HTTPS enabled
- [ ] Database backup strategy
- [ ] Health check monitoring

### 4.12 Documentation
- [ ] README.md with:
  - Project overview
  - Tech stack
  - Local setup instructions
  - Environment variables list
  - API documentation link (Swagger)
  - Architecture overview
- [ ] CONTRIBUTING.md with git workflow

---

## Frontend

### 4.13 Arabic/English i18n
- [ ] Install `@ngx-translate/core` + `@ngx-translate/http-loader`
- [ ] Create translation files: `assets/i18n/en.json`, `assets/i18n/ar.json`
- [ ] Extract all hardcoded strings to translation keys
- [ ] Language switcher in settings or top bar
- [ ] RTL layout support:
  - `[dir="rtl"]` styles for all components
  - Sidebar on right in RTL
  - Text alignment flips
  - Icons/margins flip
- [ ] Persist language preference in localStorage

### 4.14 Accessibility Audit
- [ ] All interactive elements have visible focus rings
- [ ] All form inputs have associated labels (or aria-label)
- [ ] All images have alt text
- [ ] Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] Keyboard navigation: tab order, enter/space activation, escape to close modals
- [ ] Screen reader testing (NVDA or VoiceOver)
- [ ] ARIA roles on custom components (dialog, tablist, tabpanel, alert, status)
- [ ] Skip-to-content link

### 4.15 Responsive Design
- [ ] Mobile (360px–767px):
  - Sidebar collapses to hamburger menu
  - Tables become card lists
  - Forms stack vertically
  - Touch targets ≥ 44px
- [ ] Tablet (768px–1279px):
  - Sidebar collapsible
  - Tables with horizontal scroll or card view
  - 2-column layouts where appropriate
- [ ] Desktop (1280px+):
  - Full sidebar
  - Full tables
  - Multi-column layouts
- [ ] Test on real devices or Chrome DevTools device emulation

### 4.16 Skeleton Loaders
- [ ] Table skeleton: rows with shimmer animation
- [ ] Card skeleton: placeholder cards matching KPI layout
- [ ] Form skeleton: placeholder input fields
- [ ] Detail page skeleton: header + content blocks
- [ ] Use CSS animation (not JS) for performance

### 4.17 Error & Empty States
- [ ] Every list page has: loading state, empty state, error state
- [ ] Empty states include CTA ("Create your first project", "Add a client", etc.)
- [ ] Error states include "Retry" button
- [ ] Global error page for unhandled exceptions
- [ ] 404 page with navigation back to dashboard

### 4.18 Frontend Unit Tests
- [ ] Login page: form validation, API call, error display
- [ ] Signup page: form validation, API call, auto-login
- [ ] Projects list: loads data, filters work, pagination works
- [ ] Project detail: tabs switch, data loads per tab
- [ ] Kanban board: drag changes status, API call, rollback on error
- [ ] Invoice form: item editor, totals calculation, validation
- [ ] Auth guard: redirects unauthenticated users
- [ ] Role guard: blocks unauthorized roles

### 4.19 E2E Tests (Cypress or Playwright)
- [ ] **Flow 1: Office Owner Journey**
  - Login → Dashboard → Create Project → Add Milestone → Add Task → Assign to Employee → View Kanban
- [ ] **Flow 2: Employee Journey**
  - Login → My Tasks → Move Task on Kanban → Add Comment → View Activity
- [ ] **Flow 3: Invoice Journey**
  - Login → Create Invoice → Add Items → Send to Client → View PDF
- [ ] **Flow 4: Client Portal Journey**
  - Client Login → View Projects → View Invoice → Pay (mocked)
- [ ] **Flow 5: Super Admin Journey**
  - Super Admin Login → View Stats → Create Office → Suspend Office

### 4.20 Performance Optimization
- [ ] Lazy load all feature routes
- [ ] Preload critical routes on idle
- [ ] Analyze bundle size (`ng build --stats-json` + `webpack-bundle-analyzer`)
- [ ] Remove unused PrimeNG components from imports
- [ ] Optimize images (use `NgOptimizedImage` for avatars/logos)
- [ ] Debounce search inputs (300ms)
- [ ] Virtual scrolling for long lists (>100 items)
- [ ] Service worker for offline shell (optional)

---

## Acceptance Criteria — Phase 4

- [ ] Backend test coverage > 60%
- [ ] All RBAC tests pass (full matrix)
- [ ] All tenant isolation tests pass (cross-office → 403)
- [ ] Docker Compose starts full stack locally
- [ ] App deployed and accessible via public URL
- [ ] Arabic/English toggle works, RTL layout correct
- [ ] All pages pass accessibility audit (axe-core or Lighthouse)
- [ ] App works on mobile, tablet, and desktop
- [ ] No console errors in production build
- [ ] E2E tests cover all critical user journeys
- [ ] README documents setup, architecture, and API
