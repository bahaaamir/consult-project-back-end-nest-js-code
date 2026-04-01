# Phase 3 — Real-time, Notifications & Super Admin

**Timeline:** Weeks 9–10
**Goal:** WebSocket notifications, email queue, comments system, super admin panel.
**Dependencies:** Phase 0 + Phase 1 + Phase 2 complete.

---

## Backend

### 3.1 WebSocket Gateway

#### 3.1.1 Setup
- [ ] Install `@nestjs/websockets` + `socket.io`
- [ ] Create `EventsGateway` (`src/events/events.gateway.ts`)
- [ ] Implement `OnGatewayConnection` + `OnGatewayDisconnect`
- [ ] Validate JWT on connection (extract from handshake auth)
- [ ] Join user to room `user:{userId}` on connect
- [ ] Leave room on disconnect

#### 3.1.2 Event Emission Service
- [ ] Create `EventsService` (`src/events/events.service.ts`)
- [ ] `sendToUser(userId, event, data)` — emit to user's room
- [ ] `sendToOffice(officeId, event, data)` — emit to all office users (optional)
- [ ] Events to emit:
  - `notification.new` — { id, type, title, body, metadata }
  - `task.updated` — { taskId, status, updatedBy }
  - `comment.added` — { commentId, projectId, taskId, author, content }
  - `invoice.sent` — { invoiceId, clientName, total }
  - `invoice.paid` — { invoiceId, amount, paidAt }
  - `project.updated` — { projectId, status, updatedBy }

#### 3.1.3 Integration Points
- [ ] Inject `EventsService` into `TasksService.updateStatus()` → emit `task.updated`
- [ ] Inject into `CommentsService.create()` → emit `comment.added`
- [ ] Inject into `InvoicesService.send()` → emit `invoice.sent`
- [ ] Inject into `InvoicesService.markPaid()` → emit `invoice.paid`
- [ ] Inject into `ProjectsService.update()` → emit `project.updated`

### 3.2 Email Notification Service

#### 3.2.1 Setup
- [ ] Install `nodemailer` + `@nestjs/bull` + `bull`
- [ ] Create `EmailModule` (`src/email/email.module.ts`)
- [ ] Create `EmailService` with `sendMail(to, subject, html)` method
- [ ] SMTP config from env: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- [ ] Bull queue for async email processing
- [ ] Redis connection for Bull (add Redis to env/docker)

#### 3.2.2 Email Templates
- [ ] Create HTML email templates (`src/email/templates/`):
  - `invite.html` — welcome + activation link (24h expiry)
  - `invoice-sent.html` — invoice summary + pay link
  - `payment-confirmation.html` — payment received confirmation
  - `overdue-reminder.html` — overdue invoice reminder
  - `client-invite.html` — client user invitation + setup link

#### 3.2.3 Email Triggers
- [ ] On user invite → send invite email
- [ ] On invoice send → send invoice email to client
- [ ] On payment success → send confirmation to both sides
- [ ] Scheduled: overdue invoice check (daily cron job)
  - Check invoices past due_date with status=sent
  - Send reminder at 1 day, 3 days, 7 days overdue

### 3.3 Comments Module

#### 3.3.1 Comments Service
- [ ] `create(dto, user)` — create comment, link to project and optionally task
  - Support both `user_id` (office user) and `client_user_id` (client user)
  - Check `can_comment` permission for client users
- [ ] `findAllByProject(projectId, user)` — paginated comments
- [ ] `findAllByTask(taskId, user)` — paginated comments
- [ ] `remove(id, user)` — delete own comment only
- [ ] Emit `comment.added` event via WebSocket

#### 3.3.2 Comments DTOs
- [ ] `CreateCommentDto` — content (required, max 2000), project_id (required), task_id (optional)
- [ ] `FilterCommentsDto` — project_id, task_id, page, limit

#### 3.3.3 Comments Controller
- [ ] `POST /api/comments` — create comment (office user or client user)
- [ ] `GET /api/projects/:projectId/comments` — list project comments
- [ ] `GET /api/tasks/:taskId/comments` — list task comments
- [ ] `DELETE /api/comments/:id` — delete own comment

### 3.4 Notifications Module (In-App)

#### 3.4.1 Notifications Service
- [ ] `create(data)` — create notification record
- [ ] `findAll(userId, filters)` — paginated, filter unread
- [ ] `markRead(id, userId)` — mark single as read
- [ ] `markAllRead(userId)` — mark all as read
- [ ] `getUnreadCount(userId)` — return count for badge

#### 3.4.2 Notifications Controller
- [ ] `GET /api/notifications` — list user's notifications
- [ ] `GET /api/notifications/unread-count` — unread count
- [ ] `PATCH /api/notifications/:id/read` — mark read
- [ ] `POST /api/notifications/read-all` — mark all read

#### 3.4.3 Notification Creation Points
- [ ] Task assigned → notify assignee
- [ ] Task status changed → notify project manager
- [ ] Comment added → notify task assignee + project members
- [ ] Invoice sent → notify office owner
- [ ] Invoice paid → notify office owner + client owner

### 3.5 Super Admin Module

#### 3.5.1 Super Admin Guard
- [ ] Create `SuperAdminGuard` — checks `req.user.role === 'super_admin'`
- [ ] Apply to all `/api/admin/*` endpoints
- [ ] Ensure super admin cannot access `/api/projects`, `/api/clients`, etc. (tenant data)

#### 3.5.2 Admin DTOs
- [ ] `CreateOfficeDto` — name, slug, plan, owner_email, owner_name
- [ ] `UpdateOfficeStatusDto` — is_active (boolean)
- [ ] `UpdateOfficePlanDto` — plan (enum)

#### 3.5.3 Admin Service
- [ ] `findAllOffices(filters)` — list all offices with user count, project count
- [ ] `createOffice(dto)` — create office + invite owner
- [ ] `updateStatus(id, dto)` — suspend/activate office
- [ ] `updatePlan(id, dto)` — change subscription plan
- [ ] `getStats()` — aggregate platform statistics:
  - Total offices (active / suspended)
  - Total users
  - Plan distribution (starter / professional / enterprise counts)
  - New offices per month (last 12 months)
  - Cache in Redis for 1 hour (if Redis available)

#### 3.5.4 Admin Controller
- [ ] `GET /api/admin/offices` — list offices (paginated, filter by status/plan)
- [ ] `POST /api/admin/offices` — create office + invite owner
- [ ] `GET /api/admin/offices/:id` — office detail with stats
- [ ] `PATCH /api/admin/offices/:id/status` — suspend/activate
- [ ] `PATCH /api/admin/offices/:id/plan` — change plan
- [ ] `GET /api/admin/stats` — platform statistics

---

## Frontend

### 3.6 WebSocket Service
- [ ] Install `socket.io-client`
- [ ] Create `WebSocketService` (`src/app/core/services/websocket.service.ts`)
- [ ] Connect on login (pass JWT in auth)
- [ ] Auto-reconnect on disconnect
- [ ] Methods: `on(event)`, `off(event)`, `emit(event, data)`
- [ ] Disconnect on logout

### 3.7 Notification Bell & Dropdown
- [ ] Add notification bell icon to app shell top bar
- [ ] Badge showing unread count (from API + WebSocket updates)
- [ ] Click → dropdown with notification list
- [ ] Each notification: icon by type, title, body, timestamp, read/unread style
- [ ] Click notification → navigate to related entity (task, invoice, project)
- [ ] "Mark all read" button
- [ ] Real-time: new notifications appear without page refresh

### 3.8 Toast Integration with Real-time Events
- [ ] On `task.updated` → show toast "Task status changed to {status}"
- [ ] On `invoice.paid` → show toast "Invoice {number} has been paid"
- [ ] On `comment.added` → show toast "{author} commented on {task/project}"
- [ ] Dismissable toasts, auto-dismiss after 5 seconds

### 3.9 Comments Component
- [ ] Create `<app-comments>` component
- [ ] Props: `projectId`, `taskId` (optional)
- [ ] Comment list: avatar, author name, content, timestamp
- [ ] Add comment form: textarea + submit button
- [ ] Real-time: new comments appear via WebSocket
- [ ] Delete button on own comments (with confirmation)
- [ ] Integrate in project detail → Activity tab and task detail drawer

### 3.10 Super Admin Dashboard
- [ ] Route: `/admin` (lazy loaded, Super Admin only — roleGuard)
- [ ] KPI cards:
  - Total Offices (active / suspended)
  - Total Users
  - Plan Distribution (pie or bar chart)
- [ ] Growth chart: new offices per month (last 12 months) — Recharts
- [ ] Recent activity: latest offices created, plan changes

### 3.11 Super Admin — Offices List
- [ ] Route: `/admin/offices`
- [ ] Table: Name, Slug, Plan, Users Count, Projects Count, Status, Created Date
- [ ] Filters: status (active/suspended), plan
- [ ] "Create Office" button → dialog
- [ ] Actions per row:
  - View detail
  - Suspend / Activate
  - Change Plan (dropdown)

### 3.12 Super Admin — Create Office Dialog
- [ ] Form: office name, slug, plan (dropdown), owner email, owner name
- [ ] Validation: name required, slug unique+format, email valid
- [ ] On submit: creates office, sends invite email to owner

### 3.13 Team Management Page
- [ ] Route: `/team` (Owner only)
- [ ] Table: Name, Email, Role, Status, Joined Date
- [ ] "Invite Member" button → dialog
- [ ] Invite dialog: name, email, role (Manager/Employee dropdown)
- [ ] Actions: Edit Role, Deactivate (with confirmation)
- [ ] Role badges: Owner (gold), Manager (blue), Employee (gray)

### 3.14 Settings Page
- [ ] Route: `/settings`
- [ ] Sections:
  - **Office Profile**: name, slug (read-only), plan (read-only), edit fields
  - **Security**: MFA toggle (enable/disable), change password
  - **Subscription**: current plan, plan limits (projects, users, storage), upgrade CTA
- [ ] Save button per section

### 3.15 Employee Dashboard (Real Data)
- [ ] Replace stub with real data
- [ ] "My Tasks" section: assigned tasks with status, due date
- [ ] "My Projects" section: projects assigned to me
- [ ] Quick filter: overdue, due today, in progress

### 3.16 Client Dashboard (Real Data)
- [ ] Replace stub with real data
- [ ] "My Projects" summary cards
- [ ] Recent activity on my projects
- [ ] Invoices summary: total paid, total pending (Client Owner only)

---

## Acceptance Criteria — Phase 3

- [ ] Task status change → notification appears in real-time for manager
- [ ] Invoice paid → notification bell updates without refresh
- [ ] Comments appear in real-time across users viewing same project
- [ ] Super Admin can create office, suspend office, change plan
- [ ] Super Admin cannot see project/client data inside offices
- [ ] Team management: invite member → email sent → member sets password → can login
- [ ] Settings page: MFA toggle works, profile updates save
- [ ] Employee dashboard shows real tasks and projects
- [ ] Email templates render correctly for invite, invoice, payment
