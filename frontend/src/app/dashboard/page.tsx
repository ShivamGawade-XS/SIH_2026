import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Server Component — reads cookie on the server, no client-side flash
export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/dashboard/login");
  }

  const session = await verifySession(token);

  if (!session) {
    redirect("/dashboard/login");
  }

  return (
    <DashboardClient
      user={{
        name: session.name,
        email: session.email ?? "",
        role: session.role as "FIELD_OFFICER" | "LAB_ANALYST" | "ADMIN",
      }}
    />
  );
}
