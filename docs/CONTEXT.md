# SteelFabPro: Project Context

## 💼 Overview

**SteelFabPro** is a next-generation digital platform designed to revolutionize the **steel fabrication industry**. By replacing outdated, paper-based workflows with a centralized, role-based web application, SteelFabPro streamlines inventory management, project tracking, communication, payments, and reporting for **clients**, **manufacturers**, and **administrators**.

The platform is built on a modular, microservices-based architecture, ensuring scalability and adaptability for real-world manufacturing environments.

---
## Tech Stack
 - Frontend: React.js (Web)
 - Backend: Spring Boot (Java)
 - Database: PostgreSQL
 - Cloud Platform: AWS (for scalable infrastructure, S3 for storage, EC2 for hosting)
 - Communication: RESTful APIs, potentially GraphQL for flexible data querying.
 - Containerization: Docker, Kubernetes (for orchestration)
 - DevOps: CI/CD pipelines (e.g., Jenkins, GitLab CI)

## 🗄️ Database Schema (Modular, Per Microservice)

### User Management
| Table         | Fields                                                                                 |
|---------------|----------------------------------------------------------------------------------------|
| users         | id (PK), email, password_hash, name, role_id (FK), status, created_at, updated_at      |
| roles         | id (PK), name, description                                                             |
| permissions   | id (PK), name, description                                                             |
| user_roles    | user_id (FK), role_id (FK)                                                             |
| audit_logs    | id (PK), user_id (FK), action, entity, entity_id, timestamp, details                   |

### Project Management
| Table           | Fields                                                                                       |
|-----------------|----------------------------------------------------------------------------------------------|
| projects        | id (PK), client_id (FK), name, description, status, start_date, end_date, created_at         |
| milestones      | id (PK), project_id (FK), name, due_date, status, completed_at                              |
| tasks           | id (PK), milestone_id (FK), assignee_id (FK), description, status, due_date, completed_at   |
| project_files   | id (PK), project_id (FK), file_url, file_type, uploaded_by (FK), uploaded_at                |
| feedback        | id (PK), project_id (FK), user_id (FK), comment, rating, created_at                        |

### Inventory Management
| Table           | Fields                                                                                       |
|-----------------|----------------------------------------------------------------------------------------------|
| materials       | id (PK), name, type, specification, unit, supplier_id (FK), min_stock, created_at           |
| stock_entries   | id (PK), material_id (FK), quantity, batch_no, received_at, expiry_date, location           |
| inventory_logs  | id (PK), material_id (FK), change_type, quantity, user_id (FK), timestamp, note             |
| suppliers       | id (PK), name, contact_info, address, created_at                                            |
| alerts          | id (PK), material_id (FK), alert_type, triggered_at, resolved_at, resolved_by (FK)          |

### Communication
| Table         | Fields                                                                                 |
|---------------|----------------------------------------------------------------------------------------|
| threads       | id (PK), project_id (FK), created_by (FK), created_at                                   |
| messages      | id (PK), thread_id (FK), sender_id (FK), content, sent_at, message_type                 |
| attachments   | id (PK), message_id (FK), file_url, file_type, uploaded_at                              |
| notifications | id (PK), user_id (FK), type, content, read, created_at                                  |

### Payment Management
| Table           | Fields                                                                                       |
|-----------------|----------------------------------------------------------------------------------------------|
| invoices        | id (PK), project_id (FK), amount, status, issued_at, due_date, paid_at                      |
| payments        | id (PK), invoice_id (FK), payer_id (FK), amount, payment_method_id (FK), paid_at            |
| payment_methods | id (PK), user_id (FK), type, details, is_default, created_at                                |
| transactions    | id (PK), payment_id (FK), gateway, transaction_ref, status, processed_at                    |

### Reporting & Analytics
| Table         | Fields                                                                                 |
|---------------|----------------------------------------------------------------------------------------|
| reports       | id (PK), type, generated_for (user/project), generated_by (FK), period, created_at      |
| metrics       | id (PK), report_id (FK), metric_name, value, recorded_at                                 |
| logs          | id (PK), service, level, message, timestamp, context                                    |

## 👥 User Roles & Responsibilities

### 1. Client
- Upload project specifications (CAD drawings, PDFs)
- Monitor project status and progress
- Communicate with manufacturers and administrators
- Make payments and access invoices
- Review weekly reports, provide feedback, and suggest changes

### 2. Manufacturer
- Manage inventory (stock in/out, low-stock alerts)
- Track fabrication tasks and work orders
- Submit progress reports and media
- Generate invoices and process payments
- Communicate with clients for updates and clarifications

### 3. Administrator
- Oversee all projects, users, and inventory
- Configure thresholds, roles, and templates
- Generate analytics and comprehensive reports
- Resolve client-manufacturer disputes
- Maintain system-wide settings and integrations

---

## 🧱 Architecture Overview

- **System Type:** Microservices Architecture
- **Frontend:** React.js (Web), React Native (Planned for Mobile)
- **Backend:** Spring Boot (Java)
- **Communication:** RESTful APIs (GraphQL planned)
- **Database:** PostgreSQL (separate schemas per service)
- **API Gateway:** Centralized routing, load balancing, and authentication
- **Containerization:** Docker (Kubernetes planned for orchestration)

---

## 🧩 Microservices & Domains

| Microservice           | Responsibilities                                                      |
|-----------------------|-----------------------------------------------------------------------|
| User Management       | Authentication, roles, profile management                              |
| Project Management    | Project creation, milestones, task tracking                            |
| Inventory Management  | Stock levels, material logs, low-stock alerts                          |
| Communication         | In-app chat, file attachments, notifications (email/SMS)               |
| Payment Management    | Invoice generation, payment status, gateway integration (e.g., Stripe) |
| Reporting & Analytics | Dashboards, weekly reports, performance insights                       |

---

## 🛠️ Core Functional Modules

- **Inventory Tracking:** Manage steel types, components, consumables, batch/serial numbers
- **Project Lifecycle:** End-to-end workflow from client submission to fabrication, feedback, and delivery
- **OCR Support:** Digitize handwritten notes from the manufacturing floor
- **Visual Proofs:** Attach photo/video uploads to weekly reports
- **Payment Gateway:** Integrate with Stripe for milestone-based billing
- **Analytics:** Track material usage, project profitability, and workforce efficiency

---

## ☁️ External Integrations

- **AWS S3:** File storage for CAD files, videos, and PDFs
- **Stripe:** Payment gateway integration
- **SendGrid:** Email/SMS notification service
- **OCR Service:** Extract data from handwritten notes
- **CAD/CAM Integration (Planned):** Automate design-to-fabrication workflows
- **BI Tools:** Dashboard analytics and business insights

---

## 🔮 Future Enhancements

- 📊 Predictive analytics & maintenance using machine learning
- 📡 IoT integration for real-time machine monitoring
- 🔗 Blockchain-based supply chain transparency
- 🧠 AR interfaces for guided steel assembly
- 📱 Full-featured mobile apps (iOS/Android)
- 🧾 Accounting software integration (e.g., Tally, ZohoBooks)

---

## 🧪 Open Source References

| Project      | Description                                         | Relevance                        |
|--------------|-----------------------------------------------------|----------------------------------|
| ERPNext      | Full ERP for manufacturing (Python)                 | End-to-end feature inspiration   |
| Aureus ERP   | Modular Laravel ERP                                 | Demonstrates modular logic       |
| GreaterWMS   | Warehouse management with stock workflows           | Inventory logic reference        |
| mes4u        | MES in Spring Boot + Vue.js                         | Directly aligned architecture    |
| iPlusMES     | .NET-based MES for real-time operations             | Manufacturing execution model    |
| Libre        | OEE + monitoring (Grafana + InfluxDB)               | Dashboard/analytics ideas        |

---

## 👨‍💻 Developer Notes

- Ensure code is modular and service-specific
- Adhere to REST conventions for API endpoints
- Enforce strict RBAC for all roles
- Use JWT or OAuth2 for secure authentication flows
- Log key activities for audit trails (especially in Admin & Payment modules)
- Implement graceful failure and rollback in payment and inventory modules

## 📁 Optimal Folder Structure

```
SteelFabPro/
│
├── frontend/                # React.js web app
├── mobile/                  # React Native mobile app (planned)
├── services/                # All backend microservices
│   ├── user-service/
│   ├── project-service/
│   ├── inventory-service/
│   ├── communication-service/
│   ├── payment-service/
│   └── reporting-service/
├── gateway/                 # API gateway (routing, auth, etc.)
├── shared/                  # Shared libraries, DTOs, configs
├── infra/                   # Infrastructure-as-code, Docker, K8s, CI/CD
├── docs/                    # Documentation
└── README.md
```

- Each microservice contains its own `src/`, `resources/`, `Dockerfile`, and `tests/`.
- `shared/` holds code and configs reused across services (e.g., auth, error handling, DTOs).
- `infra/` includes deployment scripts, manifests, and CI/CD configs.
- `docs/` for all documentation, diagrams, and context files.

---
