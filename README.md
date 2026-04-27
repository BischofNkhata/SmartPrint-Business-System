# SmartPrint Business System

## Project Identity & Vision

- **Project Name:** SmartPrint Business System
- **The Elevator Pitch:** A professional mobile-to-desktop MIS that helps print shop owners manage orders, customers, payments, expenses, and profitability in one place.
- **The Problem:** Small printing businesses struggle with scattered records, lost orders, unclear debt tracking, and poor visibility into profit or loss.

## Visuals & Live Links

- **Live Demo:** Not yet deployed (add your production URL here once hosted on Vercel/Netlify).
- **Screenshots (Hero View):** Dashboard home screen with color-coded KPI cards, order pipeline status, recent orders table, and clear action buttons for fast daily operations.

## Technical Implementation

- **The Tech Stack:**
  - Frontend: React, TypeScript, Vite, Zustand, Recharts, Lucide Icons
  - Backend: FastAPI, SQLAlchemy, Alembic
  - Styling: Custom design tokens and responsive CSS system
- **Standout Features:**
  - End-to-end order workflow (new order to delivery and payment collection)
  - Color-semantic KPI and reporting dashboards (revenue, costs, debt, profit/loss)
  - Customer debt tracking and payment history
  - Inventory and low-stock alerts for print supplies
  - Editable pricing table by subject and class level for fast quoting
- **The Challenge:** Building a consistent SaaS-grade UX with strong visual hierarchy, safe critical actions (confirmations for destructive/financial edits), and mobile-first speed for real business operations.

## Setup & Contribution

- **Prerequisites:**
  - Node.js 18+ and npm
  - Python 3.10+ and pip
- **Install Commands:**
  - Frontend:
    - `cd frontend`
    - `npm install`
    - `npm run dev`
  - Backend:
    - `cd backend`
    - `pip install -r requirements.txt`
    - `alembic upgrade head`
    - `uvicorn app.main:app --reload --port 8000`
- **Environment Variables:**
  - Yes, `.env` files are required.
  - Frontend (`frontend/.env`):
    - `VITE_API_BASE_URL=http://localhost:8000`
  - Backend (`backend/.env`):
    - `DATABASE_URL`
    - `CORS_ORIGINS`
    - `SECRET_KEY`

## About You

- **Social Links:**
  - LinkedIn: add-your-link
  - X/Twitter: add-your-link
  - Portfolio: add-your-link
- **License:** MIT (recommended default for open source projects)
