// src/layouts/Layout.jsx

import { Outlet } from "react-router-dom";
import Navbar from "../components/Header";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <>
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </>
  );
};

export default Layout;
