"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLoginPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn && user) {
      const role = (user.publicMetadata as any)?.role;
      if (role === "admin" || role === "super_admin") {
        router.push("/admin");
      }
    }
  }, [isSignedIn, user, router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      padding: 20,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "1.2rem", fontWeight: 900, color: "#fff",
          }}>
            BC
          </div>
          <h1 style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "1.5rem", fontWeight: 800, color: "#fff",
            letterSpacing: "-0.03em",
          }}>
            Admin Dashboard
          </h1>
          <p style={{
            color: "#94a3b8", fontSize: "0.85rem", marginTop: 8,
          }}>
            Sign in to manage BestChappals
          </p>
        </div>
        <SignIn
          routing="hash"
          afterSignInUrl="/admin"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white/10 backdrop-blur-md border border-white/10",
            }
          }}
        />
      </div>
    </div>
  );
}
