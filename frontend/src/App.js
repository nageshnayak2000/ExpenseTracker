// src/App.js

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Register from "./components/Auth/Register";
import Login from "./components/Auth/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import TransactionList from "./components/Transactions/TransactionList";
import TransactionForm from "./components/Transactions/TransactionForm";
import CategoryList from "./components/Categories/CategoryList";
import CategoryForm from "./components/Categories/CategoryForm";
import Layout from "./components/Layout"; // Import the Layout component
import { ErrorProvider } from "./context/ErrorContext";

function App() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // Optionally, decode token to get user info
      // Example using jwt-decode:
      // const decoded = jwt_decode(token);
      // setAuth({ username: decoded.username, user_id: decoded.user_id });
      setAuth(true); // Simplified for this example
    }
  }, []);

  return (
    <ErrorProvider>
      <Router>
        <Routes>
          {/* Wrap routes with the Layout component */}
          <Route path="/" element={<Layout auth={auth} setAuth={setAuth} />}>
            {/* Public Routes */}
            <Route
              path="register"
              element={auth ? <Navigate to="/dashboard" /> : <Register />}
            />
            <Route
              path="login"
              element={
                auth ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Login setAuth={setAuth} />
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="dashboard"
              element={
                <PrivateRoute auth={auth}>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="transactions"
              element={
                <PrivateRoute auth={auth}>
                  <TransactionList />
                </PrivateRoute>
              }
            />
            <Route
              path="transactions/add"
              element={
                <PrivateRoute auth={auth}>
                  <TransactionForm />
                </PrivateRoute>
              }
            />
            <Route
              path="categories"
              element={
                <PrivateRoute auth={auth}>
                  <CategoryList />
                </PrivateRoute>
              }
            />
            <Route
              path="categories/add"
              element={
                <PrivateRoute auth={auth}>
                  <CategoryForm />
                </PrivateRoute>
              }
            />

            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" />} />
            {/* Catch-all route for undefined paths */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </Router>
    </ErrorProvider>
  );
}

// PrivateRoute component to protect routes
const PrivateRoute = ({ children, auth }) => {
  return auth ? children : <Navigate to="/login" replace />;
};

export default App;