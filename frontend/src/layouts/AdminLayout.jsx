import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminNavbar from "../components/admin/AdminNavbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="
        min-h-screen
        bg-(--admin-bg)
        text-(--admin-text)
        transition-colors
        duration-200
      "
    >
      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="lg:ml-64 min-h-screen">
        <AdminNavbar setIsOpen={setSidebarOpen} />

        <main className="min-h-[calc(100vh-72px)] bg-(--admin-bg)">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
