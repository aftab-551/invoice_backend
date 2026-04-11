# Super Cheap Mechanic App - Backend

This is the backend service for the Super Cheap Mechanic App. It is a RESTful API built with Node.js and Express, designed to handle business logic for mechanic workshops including customer management, inventory, scheduling, and invoicing.

## 🚀 Tech Stack

| Technology                                              | Purpose                                                |
| :------------------------------------------------------ | :----------------------------------------------------- |
| **[Node.js](https://nodejs.org/)**                      | Runtime environment.                                   |
| **[Express.js](https://expressjs.com/)**                | Web framework for handling API routing and middleware. |
| **[Prisma](https://www.prisma.io/)**                    | Type-safe ORM for database interactions.               |
| **MySQL**                                               | Relational database for storing structured data.       |
| **[node-cron](https://github.com/node-cron/node-cron)** | Task scheduler for running background jobs.            |
| **[PDFKit](https://pdfkit.org/)**                       | Library for generating invoice PDFs on the fly.        |

## 📂 Architecture & Project Structure

The project follows a **Layered Architecture** to separate concerns:

```bash
backend/
├── prisma/
│   ├── schema.prisma       # Single source of truth for database schema
│   └── migrations/         # History of database changes
├── src/
│   ├── config/             # Config variables (DB, App settings)
│   ├── controllers/        # Request Handlers: extract data, call services, send responses
│   ├── services/           # Business Logic: complex operations, reusable functions (e.g., pdfGenerator)
│   ├── routes/             # API definition: maps URLs to controllers
│   ├── middleware/         # Interceptors: Error handling, Logging (if added)
│   ├── scheduler/          # Background Jobs: Notification logic
│   └── utils/              # Helpers: Date formatting, validation helpers
└── server.js               # Entry point: App init, DB connection, Scheduler start
```

## ⚙️ Key Features Deep Dive

### 1. Database Schema `prisma/schema.prisma`

The data model is relational. Key relationships include:

-   **Customers** have many **Schedules** and **Transactions**.
-   **Schedules** link a Customer to a **Product/Service** for a future date.
-   **Transactions** record the sale of a Product/Service.
-   **Invoices** aggregate multiple Transactions into a single billing entity.

### 2. Notification Scheduler `src/scheduler/notificationScheduler.js`

-   **Trigger:** Runs daily at **7:05 PM** (19:05) in the configured `TIME_ZONE` (default: `Asia/Karachi`).
-   **Logic:**
    1.  Calculates the time range for **Tomorrow** (Start of day to End of day).
    2.  Queries the `Schedule` table for any service due within that range.
    3.  Creates a generic "Reminder" in the `Notification` table for the Admin user.
    4.  These notifications are then fetched by the frontend to alert the user.

### 3. Invoice PDF Generation

-   **Endpoint:** `POST /api/invoices`
-   **Process:**
    1.  Receives a list of `customerTransactionIds`.
    2.  Creates an `Invoice` record linking these transactions.
    3.  Calls `pdfGenerator.service` to draw the PDF using **PDFKit**.
    4.  Streams the binary PDF data directly back to the client with `Content-Type: application/pdf`.

### 4. Error Handling `src/middleware/error.middleware.js`

-   A centralized error handling middleware intercepts any failed request.
-   It ensures a consistent JSON response format:
    ```json
    {
        "success": false,
        "status": 500,
        "message": "Error description",
        "stack": "..." // Only in development
    }
    ```

## 🛠️ Installation & Configuration

### Prerequisites

-   Node.js (v18+)
-   MySQL Server

### Setup Steps

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file:

    ```env
    PORT=3001
    DATABASE_URL="mysql://user:password@localhost:3306/mechanic_db"
    NODE_ENV="development"
    ```

3.  **Database Migration:**
    Push the Prisma schema to your local database:

    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Run Application:**
    -   **Dev Mode:** `npm run dev` (restarts on file changes via `nodemon`)
    -   **Production:** `node server.js`

## 🔌 API Endpoints Overview

All routes are prefixed with `/api`.

-   `GET /api/customers` - List all customers
-   `POST /api/customers` - Create a customer
-   `GET /api/schedules` - List all schedules (supports filtering)
-   `POST /api/products` - Add inventory item
-   `POST /api/invoices` - Generate Invoice PDF from transactions
