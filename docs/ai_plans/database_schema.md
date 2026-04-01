# Database Design & Schema (MySQL)

This document explains the database structure for **Consulting OS**. We will build the tables phase-by-phase. Since we are using MySQL and manually filtering by `office_id` (Multi-Tenancy), almost every main table will have an `office_id` column.

---

## 🏗️ Phase 1 Tables (Core & Authentication)

We need these tables first to allow offices to register, employees to sign in, and clients to access their portal.

### 1. `offices` (المكاتب)
This is the core table. Every piece of data in the system belongs to an office.
- `id` (UUID, Primary Key)
- `name` (String) - Name of the consulting office (e.g., "TechConsult")
- `slug` (String, Unique) - Used for URLs (e.g., "techconsult")
- `plan` (Enum) - The subscription plan ('starter', 'professional', 'enterprise')
- `is_active` (Boolean) - Is the office currently active or suspended?
- `created_at`, `updated_at` (Timestamps)

### 2. `users` (موظفو المكتب & Super Admin)
This table stores the login information for the internal team (Super Admin, Owner, Manager, Employees).
- `id` (UUID, Primary Key)
- `office_id` (UUID, Foreign Key, Nullable) - Links the user to their specific office. Null for Super Admins.
- `email` (String, Unique)
- `password_hash` (String, Nullable) - Encrypted password using bcrypt. It is Null when the user is first invited by the Super Admin until they set their password.
- `name` (String)
- `role` (Enum) - Defines permissions ('super_admin', 'owner', 'manager', 'employee')
- `invitation_token` (String, Nullable) - The unique token sent in the email link for the owner/employee to finish setting up their account.
- `invitation_expires_at` (Timestamp, Nullable) - When the link expires.
- `is_active` (Boolean)
- `created_at`, `updated_at` (Timestamps)

**💡 Super Admin Registration Flow Explained:**
1. The **Super Admin** logs in.
2. The Super Admin creates a new `office` and adds the Owner's email to `users` with a generated `invitation_token`.
3. The system sends an email to the Owner with the registration link: `myapp.com/setup?token=ABCDEF`
4. The Owner clicks the link, enters their name and creates a password, which updates `password_hash` and clears the token. They can now log in normally to continue adding data!

### 3. `clients` (الشركات العميلة)
This represents the companies that the consulting office works for.
- `id` (UUID, Primary Key)
- `office_id` (UUID, Foreign Key) - Links the client to the consulting office handling them.
- `company_name` (String)
- `email` (String) - Primary contact email
- `phone` (String, Optional)
- `address` (Text, Optional)
- `is_active` (Boolean)
- `created_at`, `updated_at` (Timestamps)

### 4. `client_users` (موظفو شركة العميل)
This table stores the login information for the clients so they can access the Client Portal. *Notice this is separate from internal `users` to keep security tight.*
- `id` (UUID, Primary Key)
- `client_id` (UUID, Foreign Key) - Links the user to their parent company (`clients` table).
- `email` (String, Unique)
- `password_hash` (String) - Encrypted password
- `name` (String)
- `role` (Enum) - Permissions within the client portal ('client_owner', 'client_employee')
- `permissions` (JSON) - Specific toggles like `{"can_comment": true, "can_upload": true}`
- `is_active` (Boolean)
- `created_at`, `updated_at` (Timestamps)

---

## 🛠️ Phase 2 & 3 Tables (Projects & Invoices)

We will build these in future weeks, but here is a quick overview of how they connect.

### 5. `projects`
- `id` (UUID)
- `office_id` (UUID, Foreign Key)
- `client_id` (UUID, Foreign Key)
- `name` (String), `status` (Enum), `progress` (Integer)

### 6. `tasks` (and `milestones`)
Tasks belong to projects. They move through the Kanban board.
- `id` (UUID)
- `project_id` (UUID)
- `title` (String), `status` (Enum: todo, in_progress, review, done)
- `assigned_to` (UUID -> users_id)

### 7. `invoices`
Invoices belong to clients and projects.
- `id` (UUID)
- `office_id` (UUID)
- `client_id` (UUID)
- `status` (Enum: draft, sent, paid), `total` (Decimal)

---

## 💡 How "Multi-Tenancy" Works in MySQL

Since we are not using PostgreSQL's automatic RLS, we must handle data isolation in the backend code (NestJS).

**Example Scenario:**
Employee Ahmed logs in. The backend sees that Ahmed's `office_id` is `123`.
When Ahmed requests the list of projects, the backend MUST run this SQL query:

```sql
SELECT * FROM projects WHERE office_id = '123';
```

If we ever forget to add `WHERE office_id = ...`, Ahmed might see projects from another office! To prevent this, we will build a **Middleware/Service** in Week 1 that automatically injects the `office_id` into every database query safely.
