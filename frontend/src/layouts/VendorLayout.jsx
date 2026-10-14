import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import VendorSidebar from "../components/vendor/VendorSidebar";
import VendorNavbar from "../components/vendor/VendorNavbar";

export default function VendorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f7fc]">

      <VendorSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="lg:ml-64">

        <VendorNavbar
          setIsOpen={setSidebarOpen}
        />

        <main>
          <Outlet />
        </main>

      </div>
    </div>
  );
}
