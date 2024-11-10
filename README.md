# Expense Tracker

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
    - [Frontend](#frontend)
    - [Backend](#backend)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [API Endpoints](#api-endpoints)
9. [Usage](#usage)
    - [Export Data](#export-data)
    - [Reset All Data](#reset-all-data)

---

## 1. Introduction

The **Financial Dashboard Application** is a full-stack web application designed using Django and ReactJS to help users manage their personal finances effectively. It offers features such as tracking income and expenses, visualizing financial data through interactive charts, exporting data in JSON and CSV formats, and resetting all data with built-in safeguards to prevent accidental loss.

---

## 2. Features

- **User Authentication:** Secure login and registration using JWT (JSON Web Tokens).
- **Transaction Management:** Add, view, and manage income and expense transactions.
- **Data Visualization:** Interactive bar and pie charts to visualize daily expenses and expense distribution by category.
- **Data Export:** Export your financial data in JSON or CSV formats directly from the dashboard or the reset confirmation modal.
- **Data Reset:** Reset all your data with confirmation prompts to prevent accidental deletions.
- **Responsive Design:** Optimized for various devices and screen sizes.

---

## 3. Technologies Used

### Frontend

- **React:** JavaScript library for building user interfaces.
- **React Router:** For client-side routing.
- **React Bootstrap:** For responsive and styled UI components.
- **Chart.js & react-chartjs-2:** For creating interactive charts.
- **Axios:** For making HTTP requests.
- **JWT:** For handling user authentication.

### Backend

- **Django:** High-level Python web framework.
- **Django REST Framework (DRF):** For building RESTful APIs.
- **SQLite/PostgreSQL:** Database for storing user and transaction data.
- **django-cors-headers:** For handling Cross-Origin Resource Sharing (CORS).
- **JWT Authentication:** Secure authentication mechanism.

---

## 4. Prerequisites

Before setting up the project, ensure you have the following installed on your machine:

- **Python 3.8+**
- **Node.js 14+ and npm**
- **Git**

---

## 5. Installation

### Backend Setup

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/nageshnayak2000/ExpenseTracker.git
    cd ExpenseTracker/backend
    ```

2. **Create a Virtual Environment:**

    ```bash
    python -m venv env
    source env/bin/activate  # On Windows: env\Scripts\activate
    ```

3. **Install Dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4. **Apply Migrations:**

    ```bash
    python manage.py migrate
    ```

5. **Create a Superuser (Optional):**

    ```bash
    python manage.py createsuperuser
    ```

6. **Run the Development Server:**

    ```bash
    python manage.py runserver
    ```

    The backend server should now be running at [http://localhost:8000/](http://localhost:8000/).

### Frontend Setup

1. **Navigate to Frontend Directory:**

    ```bash
    cd ../frontend
    ```

2. **Install Dependencies:**

    ```bash
    npm install
    ```

3. **Run the Development Server:**

    ```bash
    npm start
    ```

    The frontend application should now be accessible at [http://localhost:3000/](http://localhost:3000/).

---

## 6. Configuration

Ensure that both the frontend and backend are correctly configured to communicate with each other. Key configurations include:

- **CORS Settings:** The backend should allow requests from the frontend’s origin. This is handled using `django-cors-headers`.
- **Environment Variables:** Properly set `REACT_APP_API_BASE_URL` in the frontend to point to the backend API.
- **Authentication Tokens:** Ensure that JWT tokens are correctly stored and included in the `Authorization` header for protected API endpoints.

---

## 7. Running the Application

1. **Start the Backend Server:**

    ```bash
    cd backend
    source env/bin/activate
    python manage.py runserver
    ```

2. **Start the Frontend Server:**

    ```bash
    cd frontend
    npm start
    ```

3. **Access the Application:**

    Open your browser and navigate to [http://localhost:3000/](http://localhost:3000/) to use the Financial Dashboard.

---

## 8. API Endpoints

### Authentication

- **Register:** `POST /api/register/`
- **Login:** `POST /api/login/`
- **Logout:** `POST /api/logout/`
- **Token Refresh:** `POST /api/token/refresh/`

### Transactions

- **List/Create Transactions:** `GET /api/transactions/` | `POST /api/transactions/`
- **Retrieve/Update/Delete Transaction:** `GET /api/transactions/<id>/` | `PUT /api/transactions/<id>/` | `DELETE /api/transactions/<id>/`

### Categories

- **List/Create Categories:** `GET /api/categories/` | `POST /api/categories/`
- **Retrieve/Update/Delete Category:** `GET /api/categories/<id>/` | `PUT /api/categories/<id>/` | `DELETE /api/categories/<id>/`

### Data Export

- **Export as JSON:** `GET /api/export/json/`
- **Export as CSV:** `GET /api/export/csv/`

### Data Reset

- **Reset All Data:** `DELETE /api/reset/`

---

## 9. Usage

### Export Data

You can export your financial data in either JSON or CSV format from two locations:

1. **Main Dashboard:**
    - **Select Format:** Choose between JSON or CSV from the dropdown menu.
    - **Export:** Click the “Export Data” button to download your data.

2. **Reset Confirmation Modal:**
    - **Initiate Reset:** Click the “Reset All Data” button.
    - **Export Before Reset:** In the confirmation modal, select the desired export format and click “Export Data Now” to download your data before resetting.

**Note:** It’s recommended to export your data before performing a reset to prevent accidental data loss.

### Reset All Data

1. **Initiate Reset:**
    - Click the “Reset All Data” button on the dashboard.

2. **Confirmation Modal:**
    - A modal will appear warning you about data deletion.
    - **Export Recommendation:** Export your data before proceeding.
    - **Confirm Reset:** Click “Reset All Data” to delete all your transactions and categories.

**Caution:** This action cannot be undone. Ensure you have exported your data if you wish to retain it.
