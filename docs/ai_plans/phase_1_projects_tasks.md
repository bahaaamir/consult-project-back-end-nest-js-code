# Phase 1 — Projects & Tasks Vertical Slice

**Timeline:** Weeks 3–5
**Goal:** Full CRUD for projects, milestones, tasks with Kanban board — end to end.
**Dependencies:** Phase 0 complete (entities, guards, API prefix).

---

## Backend

### 1.1 Projects Module

#### 1.1.1 Project DTOs
- [ ] `CreateProjectDto` — name (required, max 255), client_id (required UUID), description (optional), start_date (required), end_date (optional), budget (optional decimal)
- [ ] `UpdateProjectDto` — all fields optional (PartialType)
- [ ] `FilterProjectsDto` — status (optional), client_id (optional), search (optional text), page (default 1), limit (default 20)
- [ ] Validate client_id belongs to same office

#### 1.1.2 Projects Service
- [ ] `create(dto, user)` — create project, set office_id from user, set created_by, log activity
- [ ] `findAll(filterDto, user)` — paginated list, office-scoped, filters applied, employee sees own projects only
- [ ] `findOne(id, user)` — single project with relations (client, milestones, members)
- [ ] `update(id, dto, user)` — update project, log activity
- [ ] `remove(id, user)` — soft delete (set status to cancelled), log activity
- [ ] Check subscription limits (max projects per plan)

#### 1.1.3 Projects Controller
- [ ] `POST /api/projects` — @Roles(Owner, Manager)
- [ ] `GET /api/projects` — @Roles(Owner, Manager, Employee)
- [ ] `GET /api/projects/:id` — @Roles(Owner, Manager, Employee)
- [ ] `PATCH /api/projects/:id` — @Roles(Owner, Manager)
- [ ] `DELETE /api/projects/:id` — @Roles(Owner, Manager)
- [ ] Apply `TenantGuard` to all endpoints
- [ ] Swagger decorators on all endpoints

### 1.2 Milestones Module

#### 1.2.1 Milestone DTOs
- [ ] `CreateMilestoneDto` — name (required), description (optional), due_date (optional), order_index (optional, default 0)
- [ ] `UpdateMilestoneDto` — all fields optional
- [ ] `ReorderMilestonesDto` — array of { id, order_index }

#### 1.2.2 Milestones Service
- [ ] `create(projectId, dto, user)` — create milestone under project
- [ ] `findAll(projectId, user)` — list milestones for project, ordered by order_index
- [ ] `update(id, dto, user)` — update milestone
- [ ] `reorder(dto, user)` — batch update order_index in transaction
- [ ] `remove(id, user)` — delete milestone (only if no tasks attached)

#### 1.2.3 Milestones Controller
- [ ] `POST /api/projects/:projectId/milestones` — @Roles(Owner, Manager)
- [ ] `GET /api/projects/:projectId/milestones` — @Roles(Owner, Manager, Employee)
- [ ] `PATCH /api/milestones/:id` — @Roles(Owner, Manager)
- [ ] `PATCH /api/milestones/reorder` — @Roles(Owner, Manager)
- [ ] `DELETE /api/milestones/:id` — @Roles(Owner, Manager)

### 1.3 Tasks Module

#### 1.3.1 Task DTOs
- [ ] `CreateTaskDto` — title (required, max 255), milestone_id (required UUID), description (optional), assigned_to (optional UUID), due_date (optional), priority (optional, default 'medium'), estimated_hours (optional)
- [ ] `UpdateTaskDto` — all fields optional
- [ ] `UpdateTaskStatusDto` — status (required, enum: todo/in_progress/review/done)
- [ ] `ReorderTasksDto` — array of { id, order_index }
- [ ] `FilterTasksDto` — status (optional), assigned_to (optional), milestone_id (optional), priority (optional), page, limit

#### 1.3.2 Tasks Service
- [ ] `create(projectId, dto, user)` — create task, validate milestone belongs to project, validate assignee in office, log activity
- [ ] `findAll(projectId, filterDto, user)` — paginated, filtered, office-scoped
- [ ] `findOne(id, user)` — single task with relations
- [ ] `update(id, dto, user)` — update task, log activity
- [ ] `updateStatus(id, dto, user)` — validate state machine (any transition allowed), log activity, emit notification, recalculate project progress
- [ ] `reorder(dto, user)` — batch update order_index in transaction
- [ ] `remove(id, user)` — soft delete task, recalculate progress
- [ ] Employee can only update tasks assigned to them
- [ ] Auto-calculate project progress: `(done_tasks / total_tasks) * 100`

#### 1.3.3 Tasks Controller
- [ ] `POST /api/projects/:projectId/tasks` — @Roles(Owner, Manager)
- [ ] `GET /api/projects/:projectId/tasks` — @Roles(Owner, Manager, Employee)
- [ ] `GET /api/tasks/:id` — @Roles(Owner, Manager, Employee)
- [ ] `PATCH /api/tasks/:id` — @Roles(Owner, Manager)
- [ ] `PATCH /api/tasks/:id/status` — @Roles(Owner, Manager, Employee) — Employee only own tasks
- [ ] `PATCH /api/tasks/reorder` — @Roles(Owner, Manager)
- [ ] `DELETE /api/tasks/:id` — @Roles(Owner, Manager)

### 1.4 Project Members
- [ ] `POST /api/projects/:id/members` — assign user, @Roles(Owner, Manager)
- [ ] `GET /api/projects/:id/members` — list members
- [ ] `DELETE /api/projects/:id/members/:userId` — remove member, @Roles(Owner, Manager)
- [ ] Validate user belongs to same office

### 1.5 Activity Log
- [ ] `ActivityLogService.create(data)` — generic method to record any action
- [ ] `GET /api/projects/:id/activity` — paginated activity feed
  - Response: { actor, action, entity_type, entity_id, metadata, created_at }
- [ ] Auto-log on: project create/update, task create/update/status-change, milestone create/update

### 1.6 Clients & Users Controllers

#### 1.6.1 Clients Controller (expose existing service)
- [ ] `POST /api/clients` — @Roles(Owner, Manager)
- [ ] `GET /api/clients` — @Roles(Owner, Manager, Employee)
- [ ] `GET /api/clients/:id` — @Roles(Owner, Manager, Employee)
- [ ] `PATCH /api/clients/:id` — @Roles(Owner, Manager)
- [ ] `DELETE /api/clients/:id` — @Roles(Owner, Manager)
- [ ] Add `create`, `update`, `remove` methods to existing `ClientsService`

#### 1.6.2 Users Controller
- [ ] `GET /api/users` — list office users, @Roles(Owner, Manager)
- [ ] `GET /api/users/:id` — get user details
- [ ] `PATCH /api/users/:id` — update user (name, role), @Roles(Owner)
- [ ] `PATCH /api/users/:id/deactivate` — soft deactivate, @Roles(Owner)
- [ ] All office-scoped (can't see other office users)

---

## Frontend

### 1.7 Projects Service & API Layer
- [ ] Create `ProjectsService` (`src/app/features/projects/services/projects.service.ts`)
  - `create(data)`, `findAll(filters)`, `findOne(id)`, `update(id, data)`, `remove(id)`
  - Typed request/response with models

### 1.8 Projects List Page
- [ ] Create route `/projects` (lazy loaded)
- [ ] Table with columns: Name, Client, Status, Progress, Start Date, End Date
- [ ] Status filter dropdown
- [ ] Client filter dropdown
- [ ] Search input (debounced)
- [ ] Pagination controls
- [ ] "New Project" button (top-right)
- [ ] Click row → navigate to `/projects/:id`
- [ ] Loading skeleton
- [ ] Empty state with "Create your first project" CTA

### 1.9 Create/Edit Project Dialog
- [ ] Reactive form with: name, client (dropdown from API), description, start date, end date, budget
- [ ] Client dropdown loads from `/api/clients`
- [ ] Validation: name required, client required, start date required
- [ ] Server validation error mapping (show field-level errors)
- [ ] On submit: call API, close dialog, refresh list, show success toast

### 1.10 Project Detail Page
- [ ] Route: `/projects/:id`
- [ ] Page header: project name, status chip, client name, progress bar
- [ ] Tabs: Overview, Milestones, Tasks, Activity
- [ ] Quick actions: Edit, Delete (with confirmation)

#### 1.10.1 Overview Tab
- [ ] Project info card (dates, budget, description)
- [ ] Team members list
- [ ] Progress bar (auto-calculated)
- [ ] Recent activity (last 5 items)

#### 1.10.2 Milestones Tab
- [ ] Milestone list with status, due date, order
- [ ] Create milestone inline or dialog
- [ ] Edit/delete milestones
- [ ] Drag reorder (optional in phase 1, can defer)

#### 1.10.3 Tasks Tab
- [ ] Tab switch: List View / Kanban View
- [ ] List view: table with title, status, assignee, priority, due date
- [ ] Kanban view: see 1.11 below

#### 1.10.4 Activity Tab
- [ ] Timeline component showing all project activity
- [ ] Each item: avatar, actor name, action description, timestamp
- [ ] Paginated (load more)

### 1.11 Kanban Board
- [ ] Create `KanbanBoardComponent` (`src/app/shared/ui/kanban/`)
- [ ] 4 columns: Todo, In Progress, Review, Done
- [ ] Each column shows task cards (title, assignee avatar, priority badge, due date)
- [ ] Drag-and-drop between columns (CDK drag-drop or PrimeNG)
- [ ] On drop: optimistic UI update → call API → rollback on error
- [ ] Column count badge
- [ ] Filter bar above board (assignee, priority)

### 1.12 Task Create/Edit Drawer
- [ ] Slide-out panel from right side
- [ ] Fields: title, description, assignee (dropdown), due date, priority (select), estimated hours
- [ ] Create mode: select milestone from project
- [ ] Edit mode: pre-filled, can change all fields
- [ ] Status change buttons (Move to: In Progress, Review, Done)
- [ ] Validation + server error mapping
- [ ] On save: refresh kanban/list, show success toast

### 1.13 Activity Log Feed Component
- [ ] Reusable `<app-activity-feed>` component
- [ ] Props: `projectId` (loads from API), `taskId` (optional, filters)
- [ ] Timeline UI with icons per action type
- [ ] "Load more" pagination

### 1.14 Wire Office Dashboard to Real Data
- [ ] Replace hardcoded KPI arrays with API calls
- [ ] Active projects count → `GET /api/projects?status=active`
- [ ] Overdue tasks count → `GET /api/tasks?status=overdue`
- [ ] Recent activity → `GET /api/projects/:id/activity` (latest across projects)
- [ ] Keep loading states while fetching

### 1.15 Clients List Page
- [ ] Route: `/clients` (lazy loaded)
- [ ] Table: Company Name, Email, Phone, Projects Count, Status
- [ ] "Add Client" button
- [ ] Click row → navigate to `/clients/:id` or open detail dialog
- [ ] Loading/empty states

### 1.16 Create/Edit Client Dialog
- [ ] Form: company_name, email, phone, address
- [ ] Validation: company_name required, email valid format
- [ ] Server error mapping

---

## Acceptance Criteria — Phase 1

- [ ] Owner can create a project, add milestones, add tasks, assign to employee
- [ ] Employee sees only their assigned projects and tasks
- [ ] Kanban drag-and-drop updates task status and project progress in real-time
- [ ] Activity log records every create/update/status-change
- [ ] All CRUD endpoints enforce office scoping (cross-office → 403)
- [ ] All endpoints have Swagger documentation
- [ ] Loading/empty/error states on every list page
- [ ] Dashboard shows real data from API
