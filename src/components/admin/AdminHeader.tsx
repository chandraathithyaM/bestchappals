"use client";

import { Menu, Bell, Moon, Sun, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";

interface AdminHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function AdminHeader({ onMenuClick, title }: AdminHeaderProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("admin-theme", next ? "dark" : "light");
  };

  return (
    <header className="admin-header">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onMenuClick}
          className="admin-btn-icon"
          id="admin-menu-toggle"
          style={{ display: "none" }}
        >
          <Menu size={18} />
        </button>
        <style>{`
          @media (max-width: 1024px) {
            #admin-menu-toggle { display: flex !important; }
          }
        `}</style>
        {title && (
          <h1 style={{
            fontSize: "1.1rem", fontWeight: 700,
            letterSpacing: "-0.02em",
          }}>
            {title}
          </h1>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Search */}
        <div style={{
          position: "relative",
          display: "none",
        }} className="admin-header-search">
          <Search size={15} style={{
            position: "absolute", left: 10, top: "50%",
            transform: "translateY(-50%)",
            color: "var(--admin-text-muted)",
          }} />
          <input
            className="admin-input"
            placeholder="Search..."
            style={{ paddingLeft: 34, width: 220, fontSize: "0.8rem" }}
          />
        </div>
        <style>{`
          @media (min-width: 768px) {
            .admin-header-search { display: block !important; }
          }
        `}</style>

        {/* Dark/Light toggle */}
        <button onClick={toggleTheme} className="admin-btn-icon" title="Toggle theme">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button className="admin-btn-icon" title="Notifications" style={{ position: "relative" }}>
          <Bell size={16} />
          <span style={{
            position: "absolute", top: 4, right: 4,
            width: 7, height: 7,
            background: "var(--admin-danger)",
            borderRadius: "50%",
            border: "2px solid var(--admin-surface)",
          }} />
        </button>

        {/* User button */}
        <div style={{ marginLeft: 4 }}>
          <UserButton afterSignOutUrl="/admin/login" appearance={{
            elements: { avatarBox: "w-8 h-8" }
          }} />
        </div>
      </div>
    </header>
  );
}
