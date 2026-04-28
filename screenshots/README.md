<div align="center">

<br />

<img src="screenshots/Landing_page.jpg" alt="SmartPrint Business System — Landing Page" width="100%" />

<br /><br />

# SmartPrint Business System

**The all-in-one MIS for modern printing businesses.**  
Manage orders, customers, payments, inventory, and business analytics — from any device.

<br />

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

<br />

[**Live Demo**](#) &nbsp;·&nbsp; [**Documentation**](#) &nbsp;·&nbsp; [**Report a Bug**](#) &nbsp;·&nbsp; [**Request a Feature**](#)

<br />

</div>

---

## Why SmartPrint?

Most printing businesses still run on paper ledgers, WhatsApp messages, and mental math. SmartPrint replaces all of that with a single, elegant system that gives you complete control of your business — whether you're at your desk or on the shop floor.

> *"Know your profit. Track every order. Stop guessing."*

<br />

## 📸 Screenshots

### Dashboard — Desktop

<img src="screenshots/Desktop_Dashboard.jpg" alt="SmartPrint Desktop Dashboard" width="100%" />

> The full desktop experience — sidebar navigation, owner snapshot KPIs, production pipeline, and business-at-a-glance metrics all on one screen.

<br />

### Responsive Across Every Device

<table>
<tr>
<td width="65%" valign="top">

**Tablet**

<img src="screenshots/Tablet_Dashboard.jpg" alt="SmartPrint Tablet Dashboard" width="100%" />

</td>
<td width="35%" valign="top">

**Mobile**

<img src="screenshots/Mobile_Dashboard.jpg" alt="SmartPrint Mobile Dashboard" width="100%" />

</td>
</tr>
</table>

> On tablet, the layout compresses naturally with a bottom tab bar. On mobile, a slide-up drawer keeps secondary pages accessible without cluttering the interface.

<br />

### Secure Login

<div align="center">
<img src="screenshots/Login_page.jpg" alt="SmartPrint Login Page" width="60%" />
</div>

> Minimal, branded login screen backed by JWT authentication and Argon2 password hashing.

<br />

---

## ✦ Feature Overview

<table>
<tr>
<td width="50%">

### 📋 Order Management
Create orders in under 60 seconds. Track every job through a visual status pipeline from intake to delivery. Auto-generated order numbers, multi-subject line items, and real-time payment status.

</td>
<td width="50%">

### 👥 Customer Management
Centralized customer profiles with contact info, form levels, and complete order/payment history. Know exactly who owes what at a glance.

</td>
</tr>
<tr>
<td width="50%">

### 💳 Payments & Debt Tracking
Record payments via Cash, Airtel Money, TNM Mpamba, or other methods. Automatic balance calculation. Outstanding debt dashboard ensures nothing slips through the cracks.

</td>
<td width="50%">

### 📦 Inventory Control
Real-time stock tracking for paper, toner, binding tape, and cover paper. Configurable low-stock thresholds with instant alerts before you run out mid-job.

</td>
</tr>
<tr>
<td width="50%">

### 📊 Business Analytics
Revenue vs. expenses charts, profit/loss summaries, top-selling subjects, and customer rankings. Filter by week, month, quarter, or all time. Export to CSV in one click.

</td>
<td width="50%">

### 🏷️ Pricing Catalog
Pre-configured price table across all subjects and form levels. Prices auto-fill on new orders — no mental arithmetic required.

</td>
</tr>
</table>

<br />

---

## 🛠️ Technology Stack

### Frontend

| | Technology | Version | Purpose |
|---|---|---|---|
| ⚛️ | **React** | 19 | UI library with concurrent features |
| 🔷 | **TypeScript** | 5.x | Full type safety across the codebase |
| ⚡ | **Vite** | Latest | Build tool with instant HMR |
| 🎨 | **Tailwind CSS** | v4 | Utility-first styling system |
| 🗺️ | **React Router** | v7 | Lazy-loaded client-side routing |
| 🐻 | **Zustand** | Latest | Lightweight global state management |
| 📈 | **Recharts** | Latest | Composable analytics charts |
| 📅 | **date-fns** | Latest | Date formatting and manipulation |
| ✅ | **Zod + RHF** | Latest | Schema validation and form handling |

### Backend

| | Technology | Version | Purpose |
|---|---|---|---|
| 🐍 | **Python** | 3.11+ | Core runtime |
| 🚀 | **FastAPI** | Latest | High-performance ASGI REST API |
| 🗄️ | **PostgreSQL** | 16 | Primary relational database |
| 🔗 | **SQLAlchemy** | 2.0 | Type-mapped ORM |
| 🔄 | **Alembic** | Latest | Schema migrations |
| 🔐 | **PyJWT + Argon2** | Latest | Authentication and password hashing |
| ⚙️ | **Uvicorn** | Latest | Production ASGI server |

<br />

---

## 🏗️ Project Structure

```
smartprint/
│
├── backend/                        # FastAPI application
│   ├── alembic/                    # Database migration scripts
│   │   └── versions/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/                 # Versioned API endpoints
│   │   │       ├── auth.py
│   │   │       ├── customers.py
│   │   │       ├── orders.py
│   │   │       ├── payments.py
│   │   │       ├── expenses.py
│   │   │       ├── inventory.py
│   │   │       ├── pricing.py
│   │   │       └── reports.py
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic settings
│   │   │   ├── security.py         # JWT + Argon2
│   │   │   └── database.py         # SQLAlchemy session
│   │   ├── models/                 # ORM models
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── services/               # Business logic
│   │   └── main.py
│   ├── tests/
│   ├── alembic.ini
│   └── requirements.txt
│
├── frontend/                       # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/             # AppShell, Sidebar, BottomNav
│   │   │   └── ui/                 # Button, Card, Modal, Badge…
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── NewOrder.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── CustomerDetail.tsx
│   │   │   ├── Payments.tsx
│   │   │   ├── Expenses.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── Reports.tsx
│   │   ├── store/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── vercel.json
│
├── screenshots/                    # UI screenshots
└── README.md
```

<br />

---

## 🚀 Getting Started

### Prerequisites

```
Node.js     >= 18.0.0
Python      >= 3.11
PostgreSQL  >= 14
npm         >= 9.0.0
```

---

### 1 · Clone the Repository

```bash
git clone https://github.com/your-username/smartprint.git
cd smartprint
```

---

### 2 · Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**Configure environment variables:**

```bash
cp .env.example .env
```

```env
# .env
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/smartprint
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:5173
```

**Run migrations and start the server:**

```bash
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

> API running at `http://localhost:8000`  
> Swagger docs at `http://localhost:8000/docs`

---

### 3 · Frontend Setup

```bash
cd frontend
npm install
```

```env
# .env.local
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

```bash
npm run dev
```

> App running at `http://localhost:5173`

---

### 4 · Create Your First Admin Account

```bash
# From backend directory (venv activated)
python -m app.scripts.create_admin
```

Or via curl:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin", "email": "admin@smartprint.mw", "password": "secure-password"}'
```

<br />

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Obtain JWT access token |
| `POST` | `/auth/logout` | Invalidate session |
| `GET` | `/auth/me` | Get current user profile |

### Core Resources

| Resource | Endpoints |
|----------|-----------|
| **Orders** | `GET /orders` · `POST /orders` · `GET /orders/{id}` · `PATCH /orders/{id}` · `DELETE /orders/{id}` |
| **Customers** | `GET /customers` · `POST /customers` · `GET /customers/{id}` · `PATCH /customers/{id}` |
| **Payments** | `GET /payments` · `POST /payments` · `GET /payments/{id}` |
| **Expenses** | `GET /expenses` · `POST /expenses` · `DELETE /expenses/{id}` |
| **Inventory** | `GET /inventory` · `POST /inventory` · `PATCH /inventory/{id}` · `POST /inventory/{id}/adjust` |
| **Pricing** | `GET /pricing` · `PUT /pricing/{id}` |
| **Reports** | `GET /reports/summary` · `GET /reports/loans` · `GET /reports/top-subjects` |

### Example: Create an Order

```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "uuid-here",
    "items": [
      {
        "subject": "Biology",
        "category": "Science",
        "form_level": "Form 2",
        "quantity": 1,
        "unit_price": 1200
      }
    ],
    "amount_paid": 1200,
    "payment_method": "Cash"
  }'
```

**Response:**

```json
{
  "id": "a3f1b2c4-...",
  "order_number": "ORD-2025-042",
  "total_amount": 1200,
  "amount_paid": 1200,
  "balance": 0,
  "order_status": "Pending",
  "payment_status": "Paid",
  "created_at": "2025-09-01T10:32:00Z"
}
```

<br />

---

## 🗄️ Data Models

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Customer   │──────<│    Order     │>──────│  OrderItem   │
│──────────────│       │──────────────│       │──────────────│
│ id           │       │ id           │       │ id           │
│ name         │       │ order_number │       │ order_id     │
│ phone        │       │ customer_id  │       │ subject      │
│ form_level   │       │ total_amount │       │ category     │
│ school       │       │ amount_paid  │       │ form_level   │
│ created_at   │       │ order_status │       │ quantity     │
└──────────────┘       │ pay_status   │       │ unit_price   │
                       └──────┬───────┘       └──────────────┘
                              │
                       ┌──────┴───────┐
                       │   Payment    │
                       │──────────────│
                       │ id           │
                       │ order_id     │
                       │ customer_id  │
                       │ amount       │
                       │ method       │
                       │ paid_at      │
                       └──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Expense    │       │  Inventory   │       │   Pricing    │
│──────────────│       │──────────────│       │──────────────│
│ id           │       │ id           │       │ id           │
│ category     │       │ name         │       │ subject      │
│ description  │       │ unit         │       │ category     │
│ amount       │       │ current_stock│       │ form_level   │
│ date         │       │ low_threshold│       │ price        │
└──────────────┘       │ cost_per_unit│       └──────────────┘
                       └──────────────┘
```

<br />

---

## 🚢 Deployment

### Frontend — Vercel

```bash
npm i -g vercel
cd frontend && vercel --prod
```

Set in the Vercel dashboard:
```
VITE_API_BASE_URL = https://your-api-domain.com/api/v1
```

---

### Backend — Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t smartprint-api .
docker run -p 8000:8000 --env-file .env smartprint-api
```

Always run `alembic upgrade head` before starting in a fresh environment.

**Recommended hosting:** Railway · Render · DigitalOcean App Platform · AWS / GCP

<br />

---

## 🧪 Running Tests

```bash
# Backend
cd backend && source venv/bin/activate
pytest
pytest --cov=app --cov-report=term-missing

# Frontend
cd frontend
npx tsc --noEmit    # Type check
npm run lint         # Lint
npm run build        # Build verification
```

<br />

---

## 🔒 Security

| Concern | Implementation |
|---------|---------------|
| **Password Storage** | Argon2 hashing — never stored in plaintext |
| **Authentication** | Stateless JWT access tokens with configurable expiry |
| **Authorization** | Role-based access control (`admin` / `user`) on all sensitive routes |
| **CORS** | Strict origin allowlist configured via environment variable |
| **SQL Injection** | Prevented by SQLAlchemy ORM parameterized queries |
| **Input Validation** | Pydantic schemas validate all incoming request payloads |

**For production deployments:** enforce HTTPS, use a cryptographically random `SECRET_KEY` (32+ chars), and never commit credentials to version control.

<br />

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change clearly"
git push origin feature/your-feature-name
# Open a Pull Request
```

**Commit convention:**

| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code restructuring, no logic change |
| `test:` | Tests added or updated |
| `chore:` | Build process or tooling changes |

<br />

---

## 📋 Roadmap

- [ ] SMS / WhatsApp order notifications via Africa's Talking API
- [ ] Multi-branch and multi-user support with role management
- [ ] Customer-facing order status page with shareable link
- [ ] Receipt PDF generation and email delivery
- [ ] Offline-first PWA mode with background sync
- [ ] Bulk order import via CSV upload
- [ ] Annual and custom date range reporting
- [ ] Automated low-stock reorder reminders

<br />

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<br />

---

<div align="center">

**SmartPrint Business System**

Built with precision for printing businesses that demand professional-grade tools.

<br />

*If SmartPrint helped your business, consider giving it a ⭐ on GitHub.*

</div>
