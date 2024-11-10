// src/components/Layout.js

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppNavbar from './Navbar'; // Ensure correct import path

const Layout = ({ auth, setAuth }) => {
  return (
    <>
      <AppNavbar auth={auth} setAuth={setAuth} />
      <Container className="mt-4">
        <Outlet />
      </Container>
    </>
  );
};

export default Layout;