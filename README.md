# LuggageTrack ✈️🧳

LuggageTrack is a premium, real-time airline baggage tracking and logistics management platform. Built with a modern **React SPA (Vite)** frontend, a robust **Node.js + Express** REST API, and a persistent **PostgreSQL** database, it provides end-to-end transparency for baggage handlers, flight operations, and passengers.

---

## 🌟 Key Features

### 🏢 Operations & Staff Dashboards
*   **Check-In Desk**: Scan passenger boarding passes, verify bag weight limits, assign PNR records, and issue tracking tags.
*   **Loading Bay**: Load baggage onto specific flights and container carts with real-time status tracking.
*   **Handover Area**: Handle baggage arrival claim tracking and coordinate passenger pickup.
*   **User Management**: Admin-only console for CRUD operations, user role assignments, and account suspensions.

### 🔍 Passenger & Lost Baggage Support
*   **Tracking Search**: Public tracking panel using PNR code, Bag Tag ID, or passenger credentials.
*   **Lost Baggage Reports**: File lost baggage claims directly into the database. Operations staff can assign agents and update status alerts in real-time.
*   **Rules & Seating Policies**: Detailed guides on cabin class allowances, restricted items, and passenger seating regulations.

### 📊 System Telemetry & Metrics
*   **System Diagnostics**: Live dashboard displaying fluctuated cluster node health (CPU, Memory, Storage, and Network).
*   **Logistics Analytics**: Interactive data charts (using Recharts) to analyze mishandled baggage rates and load density.

---

## 🏗️ Architecture

```
                       Internet
                          │
                          ▼
              [AWS EC2 Ubuntu Instance]
                          │
       ┌──────────────────┴──────────────────┐
       │   Docker Container: frontend        │ (Nginx serving React build, port 80/443)
       │           ↕ HTTP proxy /api         │
       │   Docker Container: backend         │ (Node.js/Express API, port 3001)
       │           ↕ pg driver               │
       │   Docker Container: postgres        │ (PostgreSQL 16 DB, port 5432)
       └─────────────────────────────────────┘
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (or run via Docker)

### 1. Database Setup
Create a PostgreSQL database named `luggagetrack` and execute the schema and seed data found in:
👉 [`server/db/schema.sql`](file:///Users/bankimkamila/aws%20luaage%20bag/server/db/schema.sql)

### 2. Backend API
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment template and configure secrets:
   ```bash
   cp .env.example .env
   ```
4. Start the backend dev server (monitored by Nodemon):
   ```bash
   npm run dev
   ```

### 3. Frontend Web Client
1. Navigate to the project root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Running with Docker

You can run the entire database, backend API, and Nginx-served frontend using Docker Compose:

1. Configure `.env` variables using template values.
2. Run the Docker launch command:
   ```bash
   docker compose up -d --build
   ```
3. Access the application at `http://localhost`.

---

## ☁️ AWS EC2 Deployment

A bootstrap shell script and detailed guide are included for fast deployment to an AWS EC2 instance running Ubuntu 22.04 LTS:

*   **Setup Script**: [`deploy/setup-ec2.sh`](file:///Users/bankimkamila/aws%20luaage%20bag/deploy/setup-ec2.sh)
*   **Deployment Guide**: [`deploy/AWS-DEPLOY-GUIDE.md`](file:///Users/bankimkamila/aws%20luaage%20bag/deploy/AWS-DEPLOY-GUIDE.md)
