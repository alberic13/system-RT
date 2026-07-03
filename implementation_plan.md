# Implementation Plan: RT Administrative Application

This plan outlines the architecture, database schema, API design, and frontend views for the RT management application. The project will be divided into `backend/` (Laravel API) and `frontend/` (React SPA) directories, satisfying the requirement that they are built separately.

## Directory Structure
- [NEW] `/backend`: Laravel 12 API with MySQL database integration.
- [NEW] `/frontend`: React SPA built with Vite, Tailwind CSS, Lucide icons, and Recharts/Chart.js.

---

## 1. Database Design (MySQL ERD)

We will use the following tables to manage the system state and history:

### Residents (`residents`)
Stores profile information of residents.
- `id` (INT, PK, Auto Increment)
- `name` (VARCHAR)
- `id_card_photo` (VARCHAR, stores file path for KTP photo)
- `status` (ENUM: `'tetap'`, `'kontrak'`)
- `phone` (VARCHAR)
- `is_married` (BOOLEAN)
- `created_at`, `updated_at`

### Houses (`houses`)
Stores houses in the residential area (20 houses total).
- `id` (INT, PK, Auto Increment)
- `house_code` (VARCHAR, e.g. "A-01", "B-05")
- `status` (ENUM: `'dihuni'`, `'tidak_dihuni'`)
- `created_at`, `updated_at`

### House Residents (`house_residents`)
Tracks the history of which resident lives in which house.
- `id` (INT, PK, Auto Increment)
- `house_id` (INT, FK -> `houses.id`, ON DELETE CASCADE)
- `resident_id` (INT, FK -> `residents.id`, ON DELETE CASCADE)
- `is_active` (BOOLEAN, represents current resident)
- `start_date` (DATE)
- `end_date` (DATE, NULLable)
- `created_at`, `updated_at`

### Payments (`payments`)
Logs monthly maintenance payments.
- `id` (INT, PK, Auto Increment)
- `house_id` (INT, FK -> `houses.id`)
- `resident_id` (INT, FK -> `residents.id`)
- `type` (ENUM: `'kebersihan'`, `'satpam'`)
- `amount` (INT, 15000 for Kebersihan, 100000 for Satpam)
- `month` (INT, 1-12)
- `year` (INT)
- `payment_date` (DATE)
- `status` (ENUM: `'lunas'`, `'belum_lunas'`)
- `created_at`, `updated_at`

### Expenses (`expenses`)
Logs RT expenditure (e.g. repairs, utility tokens).
- `id` (INT, PK, Auto Increment)
- `description` (VARCHAR)
- `amount` (INT)
- `date` (DATE)
- `created_at`, `updated_at`

---

## 2. Backend Implementation (Laravel API)

We will configure Laravel as a RESTful API.

### API Endpoints
- **Residents**:
  - `GET /api/residents` - List all residents
  - `POST /api/residents` - Create resident (with KTP photo upload)
  - `PUT /api/residents/{id}` - Update resident details
  - `DELETE /api/residents/{id}` - Delete resident
- **Houses**:
  - `GET /api/houses` - List houses, active resident details, and occupancy status
  - `POST /api/houses` - Add new house
  - `PUT /api/houses/{id}` - Edit house
  - `POST /api/houses/{id}/assign` - Link resident to house (updates active residency)
  - `GET /api/houses/{id}/history` - Historical list of residents for the house
- **Payments**:
  - `GET /api/payments` - List all recorded payments
  - `POST /api/payments` - Record a new payment (supports bulk monthly payment up to 12 months for Kebersihan)
  - `GET /api/billing-status` - Retrieve billing status for all houses for a given month and year (lunas / belum_lunas)
- **Expenses**:
  - `GET /api/expenses` - List all expenses
  - `POST /api/expenses` - Record new expense
  - `PUT /api/expenses/{id}` - Edit expense
  - `DELETE /api/expenses/{id}` - Delete expense
- **Dashboard & Reports**:
  - `GET /api/dashboard/summary` - Key metrics (residents, house status count, cash summary)
  - `GET /api/dashboard/finance-chart` - Monthly income vs expense data for 12 months (grouped for Recharts)
  - `GET /api/reports/monthly` - Detailed list of incomes and expenses for a selected month/year

---

## 3. Frontend Implementation (React SPA)

The frontend will be built in the `/frontend` directory. We will use:
- **Tailwind CSS** for a professional and modern layout.
- **Recharts** (or Chart.js) for premium dashboard visualizations.
- **Axios** for API requests.

### Views/Pages:
1. **Dashboard**:
   - Metrics cards (Total Residents, House occupancy rate, Monthly Balance, Remaining Balance).
   - Dynamic 12-month Income vs Expense comparison chart.
   - List of houses with outstanding bills for the current month.
2. **Resident Management**:
   - Table of residents with filters.
   - Create/Edit modals supporting file upload (KTP photo).
3. **House Management**:
   - Grid layout of the 20 houses colored by occupancy status.
   - Sidebar/Modal to assign residents, edit status, and view the historical list of past residents.
4. **Payments Management**:
   - Monthly billing matrix (grid indicating who has paid Satpam/Kebersihan for the selected month).
   - "Record Payment" form supporting multi-month selection (e.g. 1 year prepay for Kebersihan).
5. **Expenses & Financial Reports**:
   - Table of expenses with CRUD operations.
   - Monthly report generator showing detailed breakdown of incomes vs expenses for a specific month, and the remaining net cash.

---

## 4. Verification Plan

### Automated / Seed Verification
- Build seeders that insert 20 houses (15 occupied, 5 unoccupied) and pre-populate historical resident records.
- Seed monthly payments and expenses across the past 12 months to verify the dashboard chart works immediately.

### Manual Verification
- Deploy backend and frontend dev servers.
- Use browser testing to run through creation of residents, assigning them to houses, logging payments (verifying KTP photo storage), and rendering financial charts.
