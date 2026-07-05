# Inventory Pro

A simple full-stack inventory dashboard:
- **Backend:** FastAPI (in-memory data, REST API)
- **Frontend:** React + Vite (matches the dashboard design you shared)

```
inventory-pro/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── Dockerfile
    ├── nginx.conf
    ├── .dockerignore
    ├── .env.example
    └── src/
        ├── api.js
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Topbar.jsx
        │   ├── StatCard.jsx
        │   ├── Modal.jsx
        │   ├── RevenueChart.jsx
        │   ├── CustomersPieChart.jsx
        │   ├── LowStockAlerts.jsx
        │   └── RecentOrders.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Products.jsx
            ├── Customers.jsx
            └── Orders.jsx
```

## Option A: Run with Docker Compose (recommended)

Everything is containerized — no local Python/Node setup needed, just Docker.

```bash
cp .env.example .env        # adjust ports/URLs if needed, no real secrets required
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8001`
- API docs: `http://localhost:8001/docs`

All configuration (ports, CORS origins, the API URL the frontend calls) comes
from environment variables in `.env` — nothing is hardcoded in the images.
See `.env.example` at the project root, plus `backend/.env.example` and
`frontend/.env.example` for what each service accepts.

Notes:
- `VITE_API_URL` is baked into the frontend at **build** time (Vite env vars
  are compiled into the static bundle). If you change it, re-run
  `docker compose up --build` rather than just `docker compose restart`.
- To stop everything: `docker compose down`.
- To rebuild a single service after code changes:
  `docker compose up --build backend` or `... frontend`.

---

## Option B: Run locally without Docker

## 1. Run the backend

```bash
cd backend
cp .env.example .env          # optional, defaults work out of the box
python -m venv venv          # skip if you already have one
source venv/bin/activate      # on Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

- API base URL: `http://127.0.0.1:8001`
- Interactive docs: `http://127.0.0.1:8001/docs`

We use port **8001** instead of the default 8000 in case you already have
something (like Django/Gunicorn) running there.

## 2. Run the frontend

In a separate terminal:

```bash
cd frontend
cp .env.example .env          # optional, defaults to http://127.0.0.1:8001
npm install
npm run dev
```

- App URL: `http://127.0.0.1:5173`

The frontend is already configured (`src/api.js`) to call the backend at
`http://127.0.0.1:8001`. If you change the backend port, update that file.

## 3. What you get

The dashboard calls these backend endpoints on load:

| Endpoint | Purpose |
|---|---|
| `GET /api/dashboard/summary` | Total products / customers / orders / low stock counts |
| `GET /api/dashboard/revenue-by-product` | Data for the "Top Products by Revenue" bar chart |
| `GET /api/dashboard/top-customers` | Data for the "Top Customers" pie chart |
| `GET /api/dashboard/low-stock` | Low stock alert list |
| `GET /api/dashboard/recent-orders` | Recent orders table |

Plus full CRUD-style endpoints for `/api/products`, `/api/customers`, and
`/api/orders` (see `/docs` for the full schema) so you can extend the
Products / Customers / Orders pages next.

## Next steps

- Wire up the Products, Customers, and Orders sidebar pages (the API
  endpoints already exist — `getProducts()`, `getCustomers()`, `getOrders()`
  are ready in `src/api.js`).
- Swap the in-memory Python lists in `backend/main.py` for a real database
  (e.g. SQLite + SQLAlchemy) once you're ready to persist data.
