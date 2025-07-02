# SteelFabPro Microservices Overview

SteelFabPro is a modular, microservices-based platform for the steel fabrication industry, designed to modernize workflows for clients, manufacturers, and administrators. Below is a summary of each microservice in the `services/` directory:

---

## 1. User Service
**Purpose:** Manages user registration, authentication, roles, and permissions.
- **Main Entities:** User, Role, Permission, UserRole, AuditLog
- **Key Endpoints:**
  - `/api/auth/register` — Register new users
  - `/api/auth/login` — User login (JWT)
  - `/api/users/{id}` — Get/update user profile
  - `/api/users/{id}/roles` — Assign roles to users

---

## 2. Project Service
**Purpose:** Handles project management, milestones, tasks, files, and feedback.
- **Main Entities:** Project, Milestone, Task, ProjectFile, Feedback
- **Key Endpoints:**
  - `/api/projects` — CRUD for projects
  - `/api/projects/{id}/milestones` — Manage milestones
  - `/api/projects/{id}/tasks` — Manage tasks
  - `/api/projects/{id}/files` — Upload/download project files
  - `/api/projects/{id}/feedback` — Submit/view feedback

---

## 3. Inventory Service
**Purpose:** Manages materials, stock entries, inventory logs, suppliers, and alerts.
- **Main Entities:** Material, StockEntry, InventoryLog, Supplier, Alert
- **Key Endpoints:**
  - `/api/materials` — CRUD for materials
  - `/api/stock` — Stock in/out operations
  - `/api/suppliers` — Manage suppliers
  - `/api/alerts` — Inventory alerts

---

## 4. Communication Service
**Purpose:** Provides messaging, notifications, and file attachments for project collaboration.
- **Main Entities:** Thread, Message, Attachment, Notification
- **Key Endpoints:**
  - `/api/threads` — Start/view message threads
  - `/api/threads/{id}/messages` — Send/view messages
  - `/api/attachments` — Upload/download attachments
  - `/api/notifications` — User notifications

---

## 5. Payment Service
**Purpose:** Handles invoicing, payments, payment methods, and transaction history.
- **Main Entities:** Invoice, Payment, PaymentMethod, Transaction
- **Key Endpoints:**
  - `/api/invoices` — Create/view invoices
  - `/api/payments` — Make/view payments
  - `/api/payment-methods` — Manage payment methods
  - `/api/transactions` — Transaction history

---

## 6. Reporting Service
**Purpose:** Generates reports, tracks metrics, and logs system events for analytics and auditing.
- **Main Entities:** Report, Metric, Log
- **Key Endpoints:**
  - `/api/reports` — Create/view reports
  - `/api/reports/{id}/metrics` — Add/view metrics for a report
  - `/api/reports/logs` — Log/view system events

---

Each service is designed for modularity, scalability, and security, following best practices for RESTful APIs and microservice architecture.
