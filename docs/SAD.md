# System Analysis Document (SAD)
## Consulting OS — منصة إدارة مكاتب الاستشارات

**Version:** 1.0
**Date:** 2026-03-13
**Status:** Draft
**Team:** 3 developers
**Duration:** 3 months

---

## 1. مقدمة

### 1.1 الغرض
تحلل هذه الوثيقة النظام من الناحية التقنية والوظيفية، وتحدد المكونات المطلوبة وطريقة تفاعلها، مع مراعاة قيود الوقت (3 أشهر) وحجم الفريق (3 أشخاص).

### 1.2 نطاق التحليل
- تحليل المتطلبات الوظيفية وغير الوظيفية
- تصميم قاعدة البيانات
- تصميم معمارية النظام
- تحليل المخاطر
- خطة العمل لـ 3 أشهر
- توزيع المهام على الفريق

---

## 2. تحليل المتطلبات الوظيفية

### 2.1 Use Cases الرئيسية

#### UC-01: تسجيل الدخول والمصادقة
- **الأطراف:** جميع المستخدمين
- **المسار الأساسي:**
  1. المستخدم يدخل الإيميل وكلمة المرور
  2. النظام يتحقق من البيانات
  3. النظام يطلب MFA Code (TOTP)
  4. المستخدم يدخل الكود
  5. النظام يصدر JWT + Refresh Token
  6. يتم توجيه المستخدم لـ Dashboard المناسب لدوره
- **المسارات البديلة:**
  - بيانات خاطئة → رسالة خطأ، قفل الحساب بعد 5 محاولات
  - MFA خاطئ → رسالة خطأ، محاولة ثانية

#### UC-02: إنشاء مشروع جديد
- **الأطراف:** Owner، Manager
- **المسار الأساسي:**
  1. المستخدم يضغط "مشروع جديد"
  2. يملأ: اسم المشروع، العميل، تاريخ البداية والنهاية، الوصف
  3. يضيف مراحل (Milestones) للمشروع
  4. يعين موظفين على المشروع
  5. النظام ينشئ المشروع ويرسل إشعار للعميل
- **المسارات البديلة:**
  - العميل غير موجود → إنشاء عميل جديد من نفس النموذج
  - تجاوز حد الباقة → رسالة ترقية الباقة

#### UC-03: تحديث حالة مهمة
- **الأطراف:** Employee، Manager، Owner
- **المسار الأساسي:**
  1. الموظف يفتح قائمة مهامه
  2. يسحب المهمة من عمود لعمود (Drag & Drop)
  3. النظام يسجل التغيير في Activity Log
  4. يرسل إشعار للمدير والعميل
- **الشرط:** الموظف يرى فقط المهام المعينة له

#### UC-04: إصدار فاتورة وإرسالها للعميل
- **الأطراف:** Owner
- **المسار الأساسي:**
  1. Owner يختار العميل والمشروع
  2. يضيف بنود الفاتورة مع الأسعار
  3. يحدد الضريبة والخصم
  4. يعاين الفاتورة كـ PDF
  5. يضغط "إرسال للعميل"
  6. النظام يرسل إيميل للعميل مع رابط الدفع
- **المسارات البديلة:**
  - حفظ كـ Draft بدون إرسال

#### UC-05: دفع الفاتورة (Client)
- **الأطراف:** Client Owner
- **المسار الأساسي:**
  1. العميل يستقبل إيميل بالفاتورة
  2. يضغط رابط الدفع
  3. يُحوَّل لبوابة Paymob
  4. يكمل الدفع
  5. Paymob يرسل Webhook للنظام
  6. النظام يُحدِّث حالة الفاتورة إلى Paid
  7. إشعار تلقائي للمكتب والعميل

#### UC-06: Super Admin يدير مكتب
- **الأطراف:** Super Admin
- **المسار الأساسي:**
  1. يفتح قائمة المكاتب
  2. يختار مكتب معين
  3. يشوف: الباقة، عدد المشاريع، عدد المستخدمين، تاريخ الاشتراك
  4. يقدر يغير الباقة أو يوقف المكتب
- **القيد:** لا يرى أي بيانات مشاريع أو عملاء داخل المكتب

---

## 3. تصميم قاعدة البيانات

### 3.1 ERD الكامل (الجداول والعلاقات)

```
offices (1) ──────────────── (N) users
offices (1) ──────────────── (N) projects
offices (1) ──────────────── (N) clients
offices (1) ──────────────── (N) invoices
projects (1) ─────────────── (N) milestones
milestones (1) ───────────── (N) tasks
tasks (N) ────────────────── (N) users  [task_assignments]
tasks (1) ────────────────── (N) time_logs
projects (1) ─────────────── (N) files
projects (1) ─────────────── (N) comments
projects (1) ─────────────── (N) activity_logs
clients (1) ──────────────── (N) client_users
clients (1) ──────────────── (N) projects
invoices (1) ─────────────── (N) invoice_items
```

### 3.2 تعريف الجداول

```sql
-- المستأجرون (المكاتب)
CREATE TABLE offices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  plan          ENUM('starter','professional','enterprise') DEFAULT 'starter',
  plan_expires_at TIMESTAMP,
  is_active     BOOLEAN DEFAULT true,
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMP DEFAULT NOW()
);

-- المستخدمون (موظفو المكتب)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id     UUID REFERENCES offices(id) ON DELETE CASCADE,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          ENUM('super_admin','owner','manager','employee') NOT NULL,
  mfa_secret    VARCHAR(255),
  mfa_enabled   BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- العملاء (الشركات العميلة)
CREATE TABLE clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id     UUID REFERENCES offices(id) ON DELETE CASCADE,
  company_name  VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(50),
  address       TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- مستخدمو العميل (موظفو شركة العميل)
CREATE TABLE client_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID REFERENCES clients(id) ON DELETE CASCADE,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          ENUM('client_owner','client_employee') NOT NULL,
  permissions   JSONB DEFAULT '{"can_comment": true, "can_upload": true}',
  mfa_enabled   BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- المشاريع
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id     UUID REFERENCES offices(id) ON DELETE CASCADE,
  client_id     UUID REFERENCES clients(id),
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  status        ENUM('active','paused','completed','cancelled') DEFAULT 'active',
  start_date    DATE,
  end_date      DATE,
  budget        DECIMAL(12,2),
  progress      SMALLINT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- الموظفون المعينون على المشاريع
CREATE TABLE project_members (
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  role          ENUM('lead','member') DEFAULT 'member',
  PRIMARY KEY (project_id, user_id)
);

-- المراحل
CREATE TABLE milestones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  status        ENUM('pending','in_progress','completed') DEFAULT 'pending',
  due_date      DATE,
  order_index   SMALLINT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- المهام
CREATE TABLE tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id  UUID REFERENCES milestones(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  status        ENUM('todo','in_progress','review','done') DEFAULT 'todo',
  priority      ENUM('low','medium','high') DEFAULT 'medium',
  assigned_to   UUID REFERENCES users(id),
  due_date      DATE,
  estimated_hours DECIMAL(5,2),
  order_index   SMALLINT DEFAULT 0,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- تسجيل ساعات العمل
CREATE TABLE time_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id),
  hours         DECIMAL(5,2) NOT NULL,
  description   TEXT,
  logged_at     DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- الملفات
CREATE TABLE files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by_user   UUID REFERENCES users(id),
  uploaded_by_client UUID REFERENCES client_users(id),
  name          VARCHAR(255) NOT NULL,
  url           VARCHAR(500) NOT NULL,
  size_bytes    BIGINT,
  mime_type     VARCHAR(100),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- التعليقات
CREATE TABLE comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id       UUID REFERENCES tasks(id),
  user_id       UUID REFERENCES users(id),
  client_user_id UUID REFERENCES client_users(id),
  content       TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- سجل الأنشطة
CREATE TABLE activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id     UUID REFERENCES offices(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES projects(id),
  actor_user_id UUID REFERENCES users(id),
  actor_client_id UUID REFERENCES client_users(id),
  action        VARCHAR(100) NOT NULL,
  entity_type   VARCHAR(50),
  entity_id     UUID,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMP DEFAULT NOW()
);

-- الفواتير
CREATE TABLE invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id     UUID REFERENCES offices(id) ON DELETE CASCADE,
  client_id     UUID REFERENCES clients(id),
  project_id    UUID REFERENCES projects(id),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  status        ENUM('draft','sent','paid','overdue','cancelled') DEFAULT 'draft',
  issue_date    DATE DEFAULT CURRENT_DATE,
  due_date      DATE,
  subtotal      DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_percent   DECIMAL(5,2) DEFAULT 0,
  discount      DECIMAL(12,2) DEFAULT 0,
  total         DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes         TEXT,
  payment_ref   VARCHAR(255),
  paid_at       TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- بنود الفاتورة
CREATE TABLE invoice_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description   VARCHAR(500) NOT NULL,
  quantity      DECIMAL(10,2) DEFAULT 1,
  unit_price    DECIMAL(12,2) NOT NULL,
  total         DECIMAL(12,2) NOT NULL
);

-- الإشعارات
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id     UUID REFERENCES offices(id),
  user_id       UUID REFERENCES users(id),
  client_user_id UUID REFERENCES client_users(id),
  type          VARCHAR(100) NOT NULL,
  title         VARCHAR(255) NOT NULL,
  body          TEXT,
  is_read       BOOLEAN DEFAULT false,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMP DEFAULT NOW()
);

-- اشتراكات المنصة
CREATE TABLE subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id     UUID REFERENCES offices(id) ON DELETE CASCADE,
  plan          ENUM('starter','professional','enterprise') NOT NULL,
  started_at    TIMESTAMP DEFAULT NOW(),
  expires_at    TIMESTAMP,
  is_active     BOOLEAN DEFAULT true,
  payment_ref   VARCHAR(255)
);
```

### 3.3 Row-Level Security (عزل البيانات)

```sql
-- تفعيل RLS على الجداول الحساسة
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: كل مستخدم يرى فقط بيانات مكتبه
CREATE POLICY office_isolation ON projects
  USING (office_id = current_setting('app.current_office_id')::UUID);

-- يُطبَّق نفس النمط على كل الجداول
```

---

## 4. معمارية النظام التقنية

### 4.1 Stack التقني

| الطبقة | التقنية | السبب |
|---|---|---|
| Frontend | React 18 + Vite | سرعة التطوير + Ecosystem واسع |
| Styling | Tailwind CSS | سرعة التصميم + Consistency |
| State Management | Zustand | خفيف وسهل مقارنة بـ Redux |
| Tables | TanStack Table | الأقوى في React للجداول المعقدة |
| Charts | Recharts | سهل التكامل مع React |
| Backend | NestJS (Node.js) | TypeScript + Architecture منظمة |
| Database | PostgreSQL | ACID + RLS + JSON support |
| Cache | Redis | Sessions + Real-time pub/sub |
| Real-time | Socket.io | إشعارات فورية |
| Auth | JWT + TOTP (otplib) | MFA بدون خدمة خارجية |
| File Storage | Cloudinary | Free tier كافي + سهل الاستخدام |
| Payment | Paymob API | الأنسب للسوق المصري |
| Email | Nodemailer + Gmail SMTP | مجاني في مرحلة التطوير |

### 4.2 معمارية المكونات

```
┌─────────────────────────────────────────────────┐
│                  FRONTEND (React)               │
│                                                 │
│  ┌──────────────┐    ┌────────────────────────┐ │
│  │ Admin Portal │    │    Client Portal       │ │
│  │  (المكتب)   │    │    (بوابة العميل)      │ │
│  └──────┬───────┘    └──────────┬─────────────┘ │
└─────────┼─────────────────────┼─────────────────┘
          │ HTTPS + WSS          │
          ▼                      ▼
┌─────────────────────────────────────────────────┐
│              NestJS API (Port 3000)             │
│                                                 │
│  AuthModule  ProjectModule  InvoiceModule       │
│  UserModule  TaskModule     NotifModule         │
│  ClientModule FileModule    AdminModule         │
│                                                 │
│           Guards + Interceptors                 │
│        (RoleGuard, TenantGuard, JwtGuard)       │
└──────┬──────────────────────┬───────────────────┘
       │                      │
       ▼                      ▼
┌─────────────┐      ┌────────────────┐
│  PostgreSQL │      │     Redis      │
│  (RLS ON)   │      │ Sessions/Cache │
│             │      │  Pub/Sub       │
└─────────────┘      └────────────────┘
```

### 4.3 Auth Flow

```
[Login Request]
      │
      ▼
[Validate Email + Password (bcrypt)]
      │
      ├── ❌ فشل → 401 + عداد المحاولات في Redis
      │
      ▼
[Check MFA Enabled?]
      │
      ├── نعم → [طلب TOTP Code] → [Verify otplib]
      │
      ▼
[Issue JWT (15 min) + Refresh Token (7 days)]
      │
      ▼
[Set office_id في كل Request (TenantGuard)]
      │
      ▼
[RLS Policy تفلتر البيانات تلقائياً]
```

---

## 5. تحليل المخاطر

### 5.1 المخاطر التقنية

| الخطر | الاحتمال | التأثير | الحل |
|---|---|---|---|
| تعقيد Multi-Tenancy يأخذ وقت أطول من المتوقع | عالي | عالي | نبدأ بـ office_id بسيط ونضيف RLS تدريجياً |
| Paymob Integration صعبة | متوسط | عالي | نستخدم Sandbox أولاً، ولو تأخر نعمل Manual Payment كـ fallback |
| Real-time WebSocket مشاكل في الـ scale | منخفض | متوسط | Redis pub/sub يحل المشكلة، ونبدأ بـ polling لو اضطررنا |
| الوقت مش كفاية | عالي | عالي | MVP Scope محدد جداً، Features التانية في Phase 2 |

### 5.2 مخاطر المشروع (3 أشخاص / 3 أشهر)

| الخطر | الحل |
|---|---|
| تداخل المهام بين أعضاء الفريق | تقسيم واضح حسب الـ Modules |
| تأخر جزء يوقف الجزء الثاني | كل Module مستقل وعنده Mock API |
| Scope Creep (إضافة features جديدة) | الالتزام بـ MVP Scope فقط |

---

## 6. خطة العمل — 3 أشهر

### توزيع الفريق

| العضو | المسؤولية الرئيسية |
|---|---|
| Developer 1 | Backend: Auth + Users + Projects + Tasks |
| Developer 2 | Backend: Invoices + Files + Notifications + Super Admin |
| Developer 3 | Frontend: جميع الشاشات + Integration |

> **ملاحظة:** كل developer يكتب Unit Tests لـ Module بتاعه.

---

### الشهر الأول — الأساس (Foundation)

#### الأسبوع الأول — Setup و Infrastructure
| المهمة | المسؤول | التسليم |
|---|---|---|
| إنشاء Monorepo (NestJS + React) | الكل | يوم 2 |
| إعداد PostgreSQL + Redis + Docker Compose | Dev 1 | يوم 3 |
| إعداد CI/CD بسيط (GitHub Actions) | Dev 2 | يوم 4 |
| Design System + Component Library الأساسي | Dev 3 | يوم 5 |

#### الأسبوع الثاني — Auth System
| المهمة | المسؤول | التسليم |
|---|---|---|
| Auth Module: Register/Login/Logout | Dev 1 | يوم 10 |
| JWT + Refresh Token Rotation | Dev 1 | يوم 10 |
| MFA (TOTP) Integration | Dev 1 | يوم 12 |
| Multi-Tenant Middleware (TenantGuard) | Dev 1 | يوم 12 |
| RBAC Guards (RoleGuard) | Dev 2 | يوم 12 |
| Login Page + MFA Screen (Frontend) | Dev 3 | يوم 12 |

#### الأسبوع الثالث — Projects & Tasks Core
| المهمة | المسؤول | التسليم |
|---|---|---|
| Projects CRUD API | Dev 1 | يوم 17 |
| Milestones CRUD API | Dev 1 | يوم 17 |
| Tasks CRUD API + Assignment | Dev 1 | يوم 19 |
| Users & Clients Management API | Dev 2 | يوم 19 |
| Projects List + Detail Pages (Frontend) | Dev 3 | يوم 19 |

#### الأسبوع الرابع — Kanban + Dashboard
| المهمة | المسؤول | التسليم |
|---|---|---|
| Task Status Updates API | Dev 1 | يوم 24 |
| Activity Log System | Dev 2 | يوم 24 |
| Kanban Board (Drag & Drop) | Dev 3 | يوم 26 |
| Owner Dashboard (KPIs + Charts) | Dev 3 | يوم 28 |
| **Milestone Review 1** | الكل | يوم 30 |

---

### الشهر الثاني — الميزات الرئيسية (Core Features)

#### الأسبوع الخامس — Invoices
| المهمة | المسؤول | التسليم |
|---|---|---|
| Invoices CRUD API | Dev 2 | يوم 35 |
| Invoice PDF Generation (puppeteer) | Dev 2 | يوم 37 |
| Invoice Builder UI | Dev 3 | يوم 37 |
| Invoice List + Status Page | Dev 3 | يوم 37 |

#### الأسبوع السادس — Client Portal
| المهمة | المسؤول | التسليم |
|---|---|---|
| Client Users Auth (منفصل عن Office Users) | Dev 1 | يوم 42 |
| Client Portal API (مشاريع، ملفات، تعليقات) | Dev 1 | يوم 44 |
| Client Portal UI (My Projects + Timeline) | Dev 3 | يوم 44 |
| Client Permissions System | Dev 2 | يوم 44 |

#### الأسبوع السابع — Payments + Files
| المهمة | المسؤول | التسليم |
|---|---|---|
| Paymob Integration + Webhook Handler | Dev 2 | يوم 49 |
| Cloudinary File Upload API | Dev 2 | يوم 49 |
| File Upload UI (Drag & Drop) | Dev 3 | يوم 51 |
| Client Invoice Payment Flow | Dev 3 | يوم 51 |

#### الأسبوع الثامن — Real-time + Notifications
| المهمة | المسؤول | التسليم |
|---|---|---|
| Socket.io Setup + Redis Pub/Sub | Dev 1 | يوم 54 |
| Notification Service (In-app + Email) | Dev 2 | يوم 54 |
| Real-time Notifications UI | Dev 3 | يوم 56 |
| Comments System (API + UI) | Dev 1 | يوم 58 |
| **Milestone Review 2** | الكل | يوم 60 |

---

### الشهر الثالث — الإتمام والتسليم (Polish & Delivery)

#### الأسبوع التاسع — Super Admin + Team Management
| المهمة | المسؤول | التسليم |
|---|---|---|
| Super Admin API (offices, plans, stats) | Dev 2 | يوم 65 |
| Super Admin Dashboard UI | Dev 3 | يوم 65 |
| Team Management Page | Dev 3 | يوم 67 |
| Settings Page (Office + Security) | Dev 3 | يوم 67 |

#### الأسبوع العاشر — Testing
| المهمة | المسؤول | التسليم |
|---|---|---|
| Unit Tests للـ Auth و Projects | Dev 1 | يوم 70 |
| Unit Tests للـ Invoices و Notifications | Dev 2 | يوم 70 |
| Integration Tests للـ API | Dev 1 + Dev 2 | يوم 72 |
| Bug Fixes من نتائج الـ Tests | الكل | يوم 74 |

#### الأسبوع الحادي عشر — Bug Fixes + Demo Data
| المهمة | المسؤول | التسليم |
|---|---|---|
| Seed Script (بيانات تجريبية واقعية) | Dev 2 | يوم 77 |
| UI Polish + Responsive Fixes | Dev 3 | يوم 79 |
| Performance Optimization | Dev 1 | يوم 79 |
| Security Review | Dev 1 + Dev 2 | يوم 79 |

#### الأسبوع الثاني عشر — التسليم النهائي
| المهمة | المسؤول | التسليم |
|---|---|---|
| Docker Compose Production Setup | Dev 1 | يوم 82 |
| Deploy على VPS / Railway | Dev 2 | يوم 82 |
| كتابة Documentation + README | الكل | يوم 84 |
| إعداد Demo للعرض النهائي | الكل | يوم 85 |
| **التسليم النهائي** | الكل | يوم 90 |

---

## 7. MVP Scope — ما هو داخل وما هو خارج

### ✅ داخل الـ MVP (الـ 3 أشهر)

- Auth كامل مع MFA
- إدارة المشاريع والمهام (Kanban)
- بوابة العميل الكاملة
- الفواتير والدفع عبر Paymob
- رفع الملفات
- التعليقات
- الإشعارات الفورية
- Super Admin Dashboard
- إدارة الفريق والصلاحيات
- تقارير أساسية

### ❌ خارج الـ MVP (Phase 2 بعد التخرج)

- Time Tracking متقدم
- Gantt Chart
- Mobile App
- API للمطورين
- تكامل Slack / Google Drive
- Marketplace

---

## 8. API Endpoints الرئيسية

```
AUTH
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/mfa/verify
POST   /auth/client/login

PROJECTS
GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id
GET    /projects/:id/activity

TASKS
GET    /projects/:id/tasks
POST   /projects/:id/tasks
PATCH  /tasks/:id
PATCH  /tasks/:id/status
DELETE /tasks/:id

INVOICES
GET    /invoices
POST   /invoices
GET    /invoices/:id
POST   /invoices/:id/send
GET    /invoices/:id/pdf
POST   /webhooks/paymob

CLIENT PORTAL
GET    /client/projects
GET    /client/projects/:id
GET    /client/invoices
POST   /client/comments
POST   /client/files/upload

SUPER ADMIN
GET    /admin/offices
POST   /admin/offices
PATCH  /admin/offices/:id/status
GET    /admin/stats
```

---

## 9. بيئة التطوير

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: consulting_os
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  api:
    build: ./backend
    ports: ["3000:3000"]
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgresql://admin:secret@postgres/consulting_os
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your_secret_here
      CLOUDINARY_URL: cloudinary://...
      PAYMOB_API_KEY: ...

  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    environment:
      VITE_API_URL: http://localhost:3000
```
