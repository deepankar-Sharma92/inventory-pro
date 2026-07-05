"""
Inventory Pro - FastAPI Backend
--------------------------------
A simple in-memory inventory management API that powers the
Inventory Pro React dashboard (products, customers, orders, and
aggregated dashboard stats).

Run with:
    uvicorn main:app --reload --port 8001
"""

"""
Inventory Pro - FastAPI Backend
--------------------------------
A simple in-memory inventory management API that powers the
Inventory Pro React dashboard (products, customers, orders, and
aggregated dashboard stats).

Configuration is read from environment variables (see .env.example):
    CORS_ORIGINS   comma-separated list of allowed frontend origins
    APP_ENV        "development" | "production" (affects docs visibility)

Run with:
    uvicorn main:app --reload --port 8001
"""

import os
from datetime import date
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load variables from a local .env file if present (Docker Compose injects
# real environment variables directly, so this is a no-op in containers).
load_dotenv()

# ---------------------------------------------------------------------------
# Configuration (from environment variables — no hardcoded values)
# ---------------------------------------------------------------------------

APP_ENV = os.getenv("APP_ENV", "development")

# Comma-separated list, e.g. "http://localhost:5173,http://127.0.0.1:5173"
_default_origins = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

# Hide interactive docs in production unless explicitly enabled
_expose_docs = os.getenv("ENABLE_DOCS", "true").lower() == "true"

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Inventory Pro API",
    version="1.0.0",
    docs_url="/docs" if _expose_docs else None,
    redoc_url="/redoc" if _expose_docs else None,
)

# Allow the configured frontend origin(s) to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class Product(BaseModel):
    id: int
    name: str
    sku: str
    stock: int
    low_stock_threshold: int = 5
    price: float
    revenue: float = 0


class ProductCreate(BaseModel):
    name: str
    sku: str
    stock: int
    price: float
    low_stock_threshold: int = 5


class Customer(BaseModel):
    id: int
    name: str
    email: str
    total_spent: float = 0


class CustomerCreate(BaseModel):
    name: str
    email: str


class Order(BaseModel):
    id: int
    customer_id: int
    customer_name: str
    product_id: int
    product_name: str
    qty: int
    amount: float
    order_date: date


class OrderCreate(BaseModel):
    customer_id: int
    product_id: int
    qty: int


# ---------------------------------------------------------------------------
# In-memory "database"
# ---------------------------------------------------------------------------

products: List[Product] = [
    Product(id=1, name="Gaming Laptop", sku="SKU001", stock=5, price=85000, revenue=8500),
    Product(id=2, name="Wireless Mouse", sku="SKU002", stock=42, price=799, revenue=3200),
    Product(id=3, name="Mechanical Keyboard", sku="SKU003", stock=18, price=3499, revenue=6998),
    Product(id=4, name="27-inch Monitor", sku="SKU004", stock=9, price=15999, revenue=15999),
    Product(id=5, name="jlbakelf", sku="asnjfb", stock=5, price=200, revenue=800),
    Product(id=6, name="absjk.f", sku="as,bm.n,", stock=3, price=5, revenue=9240),
]

customers: List[Customer] = [
    Customer(id=1, name="dsvafa", email="dsvafa@example.com", total_spent=45),
    Customer(id=2, name="jagga", email="jagga@example.com", total_spent=10000),
    Customer(id=3, name="Ravi Kumar", email="ravi@example.com", total_spent=15999),
]

orders: List[Order] = [
    Order(id=9, customer_id=2, customer_name="jagga", product_id=6, product_name="absjk.f",
          qty=100, amount=10000, order_date=date(2026, 6, 28)),
    Order(id=4, customer_id=1, customer_name="dsvafa", product_id=6, product_name="absjk.f",
          qty=4, amount=20, order_date=date(2026, 6, 25)),
    Order(id=3, customer_id=1, customer_name="dsvafa", product_id=6, product_name="absjk.f",
          qty=5, amount=25, order_date=date(2026, 6, 24)),
]

_next_product_id = max(p.id for p in products) + 1
_next_customer_id = max(c.id for c in customers) + 1
_next_order_id = max(o.id for o in orders) + 1


# ---------------------------------------------------------------------------
# Root
# ---------------------------------------------------------------------------


@app.get("/")
def read_root():
    return {"message": "Inventory Pro API is running", "env": APP_ENV, "docs": "/docs" if _expose_docs else None}


# ---------------------------------------------------------------------------
# Dashboard (aggregated) endpoints
# ---------------------------------------------------------------------------


@app.get("/api/dashboard/summary")
def dashboard_summary():
    low_stock_items = [p for p in products if p.stock <= p.low_stock_threshold]
    return {
        "total_products": len(products),
        "total_customers": len(customers),
        "total_orders": len(orders),
        "low_stock": len(low_stock_items),
    }


@app.get("/api/dashboard/revenue-by-product")
def revenue_by_product():
    """Data for the 'Top Products by Revenue' bar chart."""
    top = sorted(products, key=lambda p: p.revenue, reverse=True)[:6]
    return [{"name": p.name, "revenue": p.revenue} for p in top]


@app.get("/api/dashboard/top-customers")
def top_customers():
    """Data for the 'Top Customers' pie chart."""
    top = sorted(customers, key=lambda c: c.total_spent, reverse=True)[:5]
    return [{"name": c.name, "value": c.total_spent} for c in top]


@app.get("/api/dashboard/low-stock")
def low_stock_alerts():
    low_stock_items = [p for p in products if p.stock <= p.low_stock_threshold]
    low_stock_items.sort(key=lambda p: p.stock)
    return [
        {"id": p.id, "name": p.name, "sku": p.sku, "stock": p.stock}
        for p in low_stock_items
    ]


@app.get("/api/dashboard/recent-orders")
def recent_orders(limit: int = 5):
    recent = sorted(orders, key=lambda o: o.id, reverse=True)[:limit]
    return recent


# ---------------------------------------------------------------------------
# Products CRUD
# ---------------------------------------------------------------------------


@app.get("/api/products", response_model=List[Product])
def list_products():
    return products


@app.get("/api/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    for p in products:
        if p.id == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


@app.post("/api/products", response_model=Product, status_code=201)
def create_product(payload: ProductCreate):
    global _next_product_id
    product = Product(id=_next_product_id, revenue=0, **payload.dict())
    products.append(product)
    _next_product_id += 1
    return product


@app.put("/api/products/{product_id}", response_model=Product)
def update_product(product_id: int, payload: ProductCreate):
    for i, p in enumerate(products):
        if p.id == product_id:
            updated = Product(id=product_id, revenue=p.revenue, **payload.dict())
            products[i] = updated
            # keep order/customer records in sync with the new product name
            for o in orders:
                if o.product_id == product_id:
                    o.product_name = updated.name
            return updated
    raise HTTPException(status_code=404, detail="Product not found")


@app.delete("/api/products/{product_id}", status_code=204)
def delete_product(product_id: int):
    for i, p in enumerate(products):
        if p.id == product_id:
            products.pop(i)
            return
    raise HTTPException(status_code=404, detail="Product not found")


# ---------------------------------------------------------------------------
# Customers CRUD
# ---------------------------------------------------------------------------


@app.get("/api/customers", response_model=List[Customer])
def list_customers():
    return customers


@app.post("/api/customers", response_model=Customer, status_code=201)
def create_customer(payload: CustomerCreate):
    global _next_customer_id
    customer = Customer(id=_next_customer_id, total_spent=0, **payload.dict())
    customers.append(customer)
    _next_customer_id += 1
    return customer


@app.put("/api/customers/{customer_id}", response_model=Customer)
def update_customer(customer_id: int, payload: CustomerCreate):
    for i, c in enumerate(customers):
        if c.id == customer_id:
            updated = Customer(id=customer_id, total_spent=c.total_spent, **payload.dict())
            customers[i] = updated
            for o in orders:
                if o.customer_id == customer_id:
                    o.customer_name = updated.name
            return updated
    raise HTTPException(status_code=404, detail="Customer not found")


@app.delete("/api/customers/{customer_id}", status_code=204)
def delete_customer(customer_id: int):
    for i, c in enumerate(customers):
        if c.id == customer_id:
            if any(o.customer_id == customer_id for o in orders):
                raise HTTPException(
                    status_code=400,
                    detail="Cannot delete a customer that has existing orders",
                )
            customers.pop(i)
            return
    raise HTTPException(status_code=404, detail="Customer not found")


# ---------------------------------------------------------------------------
# Orders CRUD
# ---------------------------------------------------------------------------


@app.get("/api/orders", response_model=List[Order])
def list_orders():
    return sorted(orders, key=lambda o: o.id, reverse=True)


@app.post("/api/orders", response_model=Order, status_code=201)
def create_order(payload: OrderCreate):
    global _next_order_id

    customer = next((c for c in customers if c.id == payload.customer_id), None)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    product = next((p for p in products if p.id == payload.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if payload.qty > product.stock:
        raise HTTPException(status_code=400, detail="Not enough stock available")

    amount = payload.qty * product.price
    order = Order(
        id=_next_order_id,
        customer_id=customer.id,
        customer_name=customer.name,
        product_id=product.id,
        product_name=product.name,
        qty=payload.qty,
        amount=amount,
        order_date=date.today(),
    )

    # Side effects: reduce stock, bump revenue + customer spend
    product.stock -= payload.qty
    product.revenue += amount
    customer.total_spent += amount

    orders.append(order)
    _next_order_id += 1
    return order


def _reverse_order_effects(order: Order):
    """Undo the stock/revenue/spend side-effects of an existing order."""
    product = next((p for p in products if p.id == order.product_id), None)
    if product:
        product.stock += order.qty
        product.revenue -= order.amount
    customer = next((c for c in customers if c.id == order.customer_id), None)
    if customer:
        customer.total_spent -= order.amount


@app.put("/api/orders/{order_id}", response_model=Order)
def update_order(order_id: int, payload: OrderCreate):
    existing = next((o for o in orders if o.id == order_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="Order not found")

    customer = next((c for c in customers if c.id == payload.customer_id), None)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    product = next((p for p in products if p.id == payload.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Undo the old order's effect on stock/revenue/spend first
    _reverse_order_effects(existing)

    # Stock available for this update = current stock + qty we just gave back
    available = product.stock if product.id != existing.product_id else product.stock
    if payload.qty > available:
        # Re-apply the old effects before rejecting, so state isn't left inconsistent
        product.stock -= existing.qty
        product.revenue += existing.amount
        customer.total_spent += existing.amount
        raise HTTPException(status_code=400, detail="Not enough stock available")

    amount = payload.qty * product.price
    product.stock -= payload.qty
    product.revenue += amount
    customer.total_spent += amount

    existing.customer_id = customer.id
    existing.customer_name = customer.name
    existing.product_id = product.id
    existing.product_name = product.name
    existing.qty = payload.qty
    existing.amount = amount
    return existing


@app.delete("/api/orders/{order_id}", status_code=204)
def delete_order(order_id: int):
    for i, o in enumerate(orders):
        if o.id == order_id:
            _reverse_order_effects(o)
            orders.pop(i)
            return
    raise HTTPException(status_code=404, detail="Order not found")
