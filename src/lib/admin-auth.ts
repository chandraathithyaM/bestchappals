import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Check if the currently signed-in Clerk user has admin role.
 * Admin role is set via Clerk Dashboard → Users → Metadata:
 *   publicMetadata: { "role": "admin" }
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return false;
    // Clerk stores publicMetadata in session claims
    const role = (sessionClaims as any)?.metadata?.role ||
                 (sessionClaims as any)?.publicMetadata?.role;
    return role === "admin" || role === "super_admin";
  } catch {
    return false;
  }
}

/**
 * Get current admin user details. Returns null if not admin.
 */
export async function getAdminUser() {
  try {
    const user = await currentUser();
    if (!user) return null;
    const role = (user.publicMetadata as any)?.role;
    if (role !== "admin" && role !== "super_admin") return null;
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      imageUrl: user.imageUrl,
      role,
    };
  } catch {
    return null;
  }
}

/**
 * Protect an API route — returns 401/403 response if not admin.
 * Use at the top of admin API route handlers.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  return null; // null = authorized, proceed
}
