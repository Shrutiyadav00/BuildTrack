# BuildTrack — Project Knowledge Base

> **IMPORTANT:** Ye file har developer aur AI agent ko code changes karne se PEHLE padhni chahiye.
> Isme project ka poora context hai — architecture, rules, conventions, aur active development plan.

---

## Project Overview

**BuildTrack** ek Construction ERP (Enterprise Resource Planning) system hai jo builders/contractors ke liye banaya gaya hai. Ye system builder ko apne projects, workers, finances, vendors, aur clients ko ek hi platform se manage karne mein help karta hai.

**Tagline:** Builder ke liye — Workers se lekar Clients tak, sab ek jagah.

---

## Tech Stack

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | LTS | Runtime |
| Express.js | 4.22.1 | REST API Framework |
| MongoDB | 7 (Docker) | Database |
| Mongoose | 9.6.2 | ODM |
| JWT (jsonwebtoken) | 9.0.3 | Auth tokens |
| bcryptjs | 3.0.3 | Password hashing |
| Multer | 2.1.1 | File uploads |
| Helmet | - | Security headers |
| Morgan | - | Request logging |
| express-rate-limit | - | Rate limiting |
| express-async-errors | - | Async error handling |

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 19.2.6 | UI Framework |
| React Router DOM | 6.30.3 | Client-side routing |
| Axios | 1.16.0 | HTTP client |
| Lucide React | 1.14.0 | Icon library |
| react-hot-toast | 2.6.0 | Notifications/toasts |
| date-fns | 4.1.0 | Date formatting |

### Infrastructure
| Tool | Purpose |
|------|---------|
| Docker + Docker Compose | Multi-container dev/prod |
| MongoDB 7 image | Database container |
| nginx | Frontend static serving (production) |

---

## Project Structure

```
buildtrack/
├── CLAUDE.md                    ← YE FILE — pehle padho
├── .gitignore
├── docker-compose.yml
│
├── backend/
│   ├── package.json
│   ├── .env                     ← gitignored, manually create
│   └── src/
│       ├── server.js            ← Express app entry point
│       ├── config/
│       │   └── db.js            ← MongoDB connection
│       ├── middleware/
│       │   └── auth.js          ← JWT protect + role authorize
│       ├── models/              ← Mongoose schemas
│       │   ├── User.js
│       │   ├── Project.js
│       │   ├── Task.js
│       │   ├── Worker.js
│       │   ├── Attendance.js
│       │   ├── Transaction.js
│       │   └── Document.js
│       ├── controllers/         ← Business logic
│       │   ├── authController.js
│       │   ├── projectController.js
│       │   ├── taskController.js
│       │   ├── workerController.js
│       │   ├── attendanceController.js
│       │   ├── transactionController.js
│       │   ├── documentController.js
│       │   └── dashboardController.js
│       ├── routes/              ← Express route definitions
│       │   ├── auth.js
│       │   ├── projects.js
│       │   ├── tasks.js
│       │   ├── workers.js
│       │   ├── attendance.js
│       │   ├── transactions.js
│       │   ├── documents.js
│       │   └── dashboard.js
│       ├── utils/
│       │   └── seed.js          ← Demo data seeding
│       └── uploads/             ← File storage (gitignored)
│
└── frontend/
    ├── package.json
    ├── .env                     ← gitignored, manually create
    ├── .gitignore
    └── src/
        ├── App.js               ← Route config + role guards
        ├── index.js             ← React entry point
        ├── context/
        │   ├── AuthContext.js   ← User state, login/logout
        │   └── SettingsContext.js ← Currency/language/country
        ├── pages/
        │   ├── auth/            Login.js, Register.js
        │   ├── dashboard/       Dashboard.js
        │   ├── projects/        Projects.js, ProjectDetail.js
        │   ├── workers/         Workers.js, Attendance.js
        │   ├── worker/          WorkerDashboard.js (worker portal)
        │   ├── finance/         Finance.js
        │   ├── documents/       Documents.js
        │   └── team/            Team.js (stub — to be implemented)
        ├── components/
        │   ├── layout/          Layout.js (main app shell + sidebar)
        │   └── TablePagination.js
        └── utils/
            ├── api.js           ← Axios instance + interceptors
            ├── currencies.js    ← Currency formatting
            ├── translations.js  ← i18n strings
            ├── mockApi.js       ← Mock API (REACT_APP_USE_MOCK=true)
            └── mockData.js      ← Mock data for offline dev
```

---

## Environment Variables

### Backend `.env` (create manually, never commit)
```
MONGO_URI=mongodb://admin:buildtrack2024@localhost:27017/buildtrack?authSource=admin
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
```

### Frontend `.env` (create manually, never commit)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_USE_MOCK=false
```

---

## Database Models (Current)

### User
```
name, email, phone, password (hashed), role, company, avatar, workerId, isActive
role enum: ['super_admin', 'admin', 'owner', 'manager', 'engineer', 'supervisor', 'worker', 'client']
```

### Project
```
name, type, description, address, location{lat,lng},
owner (ref User), leadEngineer (ref User), team[] (ref User),
client {name, email, phone},
budget {total, structure, labour, mep, finishing, misc},
contractValue, currency, startDate, endDate, completion%, status, phases[],
clientPortalEnabled, clientPortalToken
```

### Task
```
project, title, description, phase, priority, status,
assignedTo (ref User), createdBy, dueDate, completedAt, attachments[], notes
```

### Worker
```
owner (ref User), userId (ref User), name, idType, idNumber, phone,
trade (enum), payType, rate, currency,
payment {method, account, upi},
projects[], isActive, joinDate, leftDate
```

### Attendance
```
project, worker (ref Worker), date, status (present/absent/half_day/overtime),
markedBy, location, isRemote, notes, editHistory[]
```

### Transaction
```
project, type (material_purchase/labour_payment/advance/misc_expense/client_receipt/refund),
category, amount, currency, description, vendor (string), invoiceNo,
paymentMethod, status (pending/approved/rejected/paid),
date, worker, createdBy, approvedBy, receipt, notes
```

### Document
```
project, name, category, versions[] {versionNumber, fileUrl, status, uploadedBy, notes},
activeVersion, sharedWithClient, createdBy
```

---

## API Routes (Current)

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/me

GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/client-token

GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

GET    /api/workers
GET    /api/workers/me
POST   /api/workers
GET    /api/workers/:id
PUT    /api/workers/:id
DELETE /api/workers/:id
GET    /api/workers/:id/payroll

GET    /api/attendance/me
GET    /api/attendance/:projectId
POST   /api/attendance/:projectId
POST   /api/attendance/:projectId/bulk
PUT    /api/attendance/:id/edit

GET    /api/transactions/:projectId
POST   /api/transactions/:projectId
GET    /api/transactions/:projectId/summary
PUT    /api/transactions/:id
DELETE /api/transactions/:id

GET    /api/documents/:projectId
POST   /api/documents/:projectId
POST   /api/documents/:projectId/:id/version
PUT    /api/documents/:id/share
DELETE /api/documents/:id

GET    /api/dashboard
GET    /api/dashboard/project/:projectId

GET    /api/health
```

---

## Auth & Role System

### How Auth Works
1. Login → JWT token returned (expires in 7d)
2. Token stored in `localStorage`
3. Every request: `Authorization: Bearer <token>` header (auto-added by Axios interceptor)
4. `protect` middleware verifies token, attaches `req.user`
5. `authorize(...roles)` middleware checks `req.user.role`
6. 401 → auto logout + redirect to `/login`

### Role Groups (Practical Mapping)
```
Admin Group:    ['super_admin', 'admin', 'owner']         → Full access
Engineer Group: ['engineer', 'supervisor', 'manager']     → Projects + Workers (no Finance)
Worker:         ['worker']                                 → Worker Dashboard only
Client:         ['client']                                 → Client Portal only
```

### Frontend Route Guards
```
AdminRoute    → admin group only (non-admins redirected)
WorkerRoute   → worker role only
(ClientRoute  → to be added in build-2)
```

---

## Frontend Conventions

### API Calls
Always use `import api from '../utils/api'` — never raw fetch/axios.
```js
const res = await api.get('/projects');
const res = await api.post('/vendors', payload);
```

### Toast Notifications
```js
import toast from 'react-hot-toast';
toast.success('Saved!');
toast.error('Something went wrong');
```

### Icons
Always use Lucide React icons:
```js
import { Package, FileText, CreditCard } from 'lucide-react';
```

### Styling
- Global styles: `frontend/src/styles/global.css`
- CSS variables used: `--primary`, `--t1`, `--t2`, `--t3`, `--t4`, `--bg`, `--card`
- Class patterns: `btn`, `btn-primary`, `form-input`, `form-label`, `form-group`, `modal-overlay`, `modal`, `card`, `table-wrap`
- No external CSS framework — pure CSS with variables

### Translation
```js
const { t } = useSettings();
t('dashboard')  // returns translated string
```

---

## Docker Setup

```bash
# Start everything
docker-compose up -d

# Seed demo data
docker exec buildtrack-backend npm run seed

# View logs
docker-compose logs -f backend
```

### Docker Services
| Service | Port | Notes |
|---------|------|-------|
| MongoDB | 27017 | auth: admin/buildtrack2024 |
| Backend | 5000 | Node.js API |
| Frontend | 3000 (dev) / 80 (prod) | React / nginx |

---

## Demo Credentials (after seed)
```
Admin:      ahmed@buildtrack.com / password123
Engineer:   usman@buildtrack.com / password123
Supervisor: sara@buildtrack.com  / password123
Worker:     rafiq@buildtrack.com / password123
```

---

## Git Branching Rules

### Branch Naming
```
main          → production-ready code only
build-1       → Sprint 1: Org Scoping + Role Helpers
build-2       → Sprint 2: Subscription System
build-3       → Sprint 3: User Management
build-4       → Sprint 4: Role-Based Nav + Route Guards
build-5       → Sprint 5: Notification System
build-6       → Sprint 6: Client Portal
build-7       → Sprint 7: Vendor + Purchase Order Module
build-8       → Sprint 8: Dashboard + Budget Alerts
build-9       → Sprint 9: Site Diary + Inventory + Reports
```

### Rules
- **Koi bhi feature directly `main` pe nahi jaata**
- Har sprint ek `build-N` branch pe hota hai
- Sprint complete hone ke baad PR/merge `main` mein
- CLAUDE.md ko har sprint ke baad update karo (naye models/routes document karo)

---

## Planned Features (Development Roadmap)

### build-1 — Org Scoping + Role Helpers
- [ ] `User` model: `organizationId` field add
- [ ] `authController.register`: auto-set `organizationId = user._id`
- [ ] All controllers: scope queries to `organizationId`
- [ ] `auth.js` middleware: `adminOnly`, `engineerUp`, `clientOnly` helpers

### build-2 — Subscription System
- [ ] `Subscription` model (plan, status, startDate, endDate, trialUsed)
- [ ] Auto-create trial on register (30 days)
- [ ] `subscriptionGate` middleware (402 on expired)
- [ ] `/api/subscription` routes
- [ ] Frontend: Subscription page, warning banner, 402 interceptor

### build-3 — User Management
- [ ] `User` model: `clientProjectId` field add
- [ ] `/api/users` routes (invite, list, update, deactivate)
- [ ] Frontend: Team page (full — replaces stub), InviteUserModal

### build-4 — Role-Based Nav + Route Guards
- [ ] `App.js`: `ClientRoute`, `EngineerRoute` guards
- [ ] `Layout.js`: role-filtered nav items
- [ ] `AuthContext.js`: `isAdmin()`, `isEngineer()`, `isClient()` helpers

### build-5 — Notification System
- [ ] `Notification` model
- [ ] `notify.js` utility
- [ ] `/api/notifications` routes
- [ ] Frontend: `NotificationBell` component

### build-6 — Client Portal
- [ ] `PaymentSchedule` model
- [ ] `Project` model: `clientUserId`, `budgetSpent` fields
- [ ] `/api/payment-schedules` routes
- [ ] `/api/client/*` routes (activity feed, payments, builder profile, documents)
- [ ] Frontend: `ClientLayout`, all client portal pages
- [ ] Wire notifications: task complete → client notify, phase start → client notify

### build-7 — Vendor + Purchase Order
- [ ] `Vendor` model
- [ ] `PurchaseOrder` model
- [ ] `Transaction` model: `poRef` field
- [ ] `generatePO.js` PDF utility (pdfkit)
- [ ] `emailService.js` (nodemailer)
- [ ] `/api/vendors` + `/api/purchase-orders` routes
- [ ] PO paid → `project.budgetSpent` deduction logic
- [ ] Frontend: Vendor pages, PO pages, POLineItems component

### build-8 — Dashboard + Budget Alerts
- [ ] `dashboardController`: budget alerts, pending payments, PO summary
- [ ] Frontend: `BudgetAlert`, `BudgetVsActual` (recharts) components
- [ ] Finance page: PO tab, budget vs actual chart

### build-9 — Site Diary + Inventory + Reports
- [ ] `SiteDiary` model + routes
- [ ] `Inventory` model + routes (stock in/out, low stock notify)
- [ ] `reportsController` (payroll PDF, budget report)
- [ ] Frontend: SiteDiary tab, Inventory tab, Reports page

---

## Important Conventions for AI Agents

1. **Org Scoping:** Har query mein `owner: req.user.organizationId || req.user._id` use karo — kabhi bhi unscoped queries mat karo.

2. **Subscription Gate:** Naye routes banate waqt `protect + adminOnly + requireActiveSubscription` lagao. `/api/auth` aur `/api/subscription` pe gate nahi lagta.

3. **Notifications:** Koi bhi significant action (PO paid, payment received, task complete, phase start) ke baad `notify()` util call karo.

4. **Role Checks:** Frontend mein role checks ke liye `user.role` directly check karo ya `AuthContext` ke helper functions use karo.

5. **No Direct DB Queries in Routes:** Business logic sirf controllers mein hogi, routes sirf middleware + controller call karenge.

6. **Error Handling:** `express-async-errors` installed hai — async functions mein try-catch nahi chahiye, errors automatically catch ho jaate hain.

7. **PDF Files:** Generated PDFs `uploads/po/` directory mein save honge.

8. **Email Config:** `.env` se `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` use karo.

---

## Last Updated
- **Date:** June 2026
- **Current Branch:** `main` (initial commit — all existing features)
- **Next Branch:** `build-1` (Org Scoping + Role Helpers)
