"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, CreditCard,
  FolderTree, Ticket, X, LogOut, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { section: "Main" },
  { label: "Dashboard",  href: "/admin",            icon: LayoutDashboard },
  { label: "Products",   href: "/admin/products",   icon: Package },
  { label: "Orders",     href: "/admin/orders",      icon: ShoppingCart },
  { section: "Management" },
  { label: "Users",      href: "/admin/users",       icon: Users },
  { label: "Payments",   href: "/admin/payments",    icon: CreditCard },
  { label: "Categories", href: "/admin/categories",  icon: FolderTree },
  { label: "Coupons",    href: "/admin/coupons",     icon: Ticket },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="admin-sidebar-overlay"
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 39,
            display: "none",
          }}
        />
      )}
      <style>{`
        @media (max-width: 1024px) {
          .admin-sidebar-overlay { display: block !important; }
        }
      `}</style>

      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        {/* Brand */}
        <div className="admin-sidebar-brand">
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 900, fontSize: "0.85rem"
          }}>
            BC
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--admin-text)" }}>
              BEST<span>CHAPPALS</span>
            </span>
            <span style={{ fontSize: "0.6rem", color: "var(--admin-text-muted)", letterSpacing: "0.1em" }}>
              ADMIN PANEL
            </span>
          </div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="admin-btn-icon"
            style={{ marginLeft: "auto", display: "none" }}
            id="sidebar-close-btn"
          >
            <X size={16} />
          </button>
          <style>{`
            @media (max-width: 1024px) {
              #sidebar-close-btn { display: flex !important; }
            }
          `}</style>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar-nav">
          {NAV_ITEMS.map((item, i) => {
            if ("section" in item && !("href" in item)) {
              return (
                <div key={i} className="admin-sidebar-section">
                  {item.section}
                </div>
              );
            }
            const navItem = item as { label: string; href: string; icon: any };
            const Icon = navItem.icon;
            const active = isActive(navItem.href);
            return (
              <Link
                key={navItem.href}
                href={navItem.href}
                className={`admin-sidebar-link ${active ? "active" : ""}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{navItem.label}</span>
                {active && (
                  <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.5 }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: "12px",
          borderTop: "1px solid var(--admin-border)"
        }}>
          <Link
            href="/"
            className="admin-sidebar-link"
            style={{ color: "var(--admin-text-muted)", fontSize: "0.8rem" }}
          >
            <LogOut size={16} />
            <span>Back to Store</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
