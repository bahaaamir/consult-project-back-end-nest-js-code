# Consulting OS Implementation Plan

This plan details the technical approach to building the Consulting OS platform based on the provided BRS, SAD, and SRS documents. The system is a multi-tenant SaaS application using a React + NestJS stack.

## Architecture Overview
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, TanStack Table, Recharts.
- **Backend**: NestJS, **MySQL** (since you already have it installed!). We will implement multi-tenancy manually in our code instead of using PostgreSQL's Row-Level Security.
  - *Note on Redis*: We will completely skip Redis for now and only add it at the very end of the project if we have extra time.
- **External Services**: 
  - **Cloudinary** (files): We will use their generous Free Tier.
  - **Paymob** (payments): We will use their Free Test/Sandbox environment, so no real money is involved!
  - **Socket.io** (real-time notifications): This is a free open-source library that we will host ourselves.
  - **Nodemailer/Gmail** (emails): This is a free library that can send emails using a standard free Gmail account.

## Detailed Modules
### 1. Foundation
- Initialize separate repositories for Frontend and Backend.
- **Database Setup**: We will connect NestJS directly to your local MySQL installation. You can use your existing tools (like phpMyAdmin, DBeaver, or MySQL Workbench) to view everything in the database easily. No Docker containers are needed!
- **Graduation Project Focus**: We will build this project phase-by-phase (week by week). During every step, I will explain *what* we are doing and *how* it works so you can learn and be ready to explain it yourself.

### 2. Multi-Tenancy & Security
- Implement multi-tenancy manually in the NestJS services by ensuring every database query filters by `office_id`.
- Create `TenantGuard` to extract `office_id` from JWT and apply it to the database connection context.
- Implement RBAC with `RoleGuard` based on the predefined roles (Super Admin, Owner, Manager, Employee, Client Owner, Client Employee).

### 3. Core Modules
- **Auth Module**: JWT, Refresh Token rotation (Redis blacklist), MFA with TOTP (`otplib`). Separate auth flow for Clients.
- **Projects & Tasks**: Kanban board support with index sorting, milestones tracking, automatic progress calculation (trigger/service based).
- **Invoices**: Invoice calculation, PDF document creation using Puppeteer, Paymob checkout flow, Webhook handling with HMAC verification.
- **Clients Portal**: Restricted API endpoints for clients to view related projects, pay invoices, upload files, and comment.
- **Notifications & File Uploads**: WebSocket integration with `userId` rooms via Socket.io, Bull queues for async email processing. Direct uploads to Cloudinary.

## Verification Plan
### Automated Tests
- Unit testing for each module (Auth, Projects, Tasks, Invoices). Target > 60% coverage.
- Integration tests for core API endpoints.
### Manual Verification
- Testing the RLS directly by logging in as cross-tenant users to ensure strict data isolation.
- Paymob Sandbox integration testing for Webhooks handling and payment completion.
- Simulation of WebSocket events for real-time task updates.
