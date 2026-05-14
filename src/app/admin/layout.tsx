"use client";

import { useState } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { AdminToastProvider } from "@/components/admin/AdminToast";
import "./globals-admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-root">
      <AdminToastProvider>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="admin-main">
          {children}
        </main>
      </AdminToastProvider>
    </div>
  );
}
