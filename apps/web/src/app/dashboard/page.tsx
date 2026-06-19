import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-steel-900">แดชบอร์ด</h1>
      <p className="mt-2 text-steel-600">
        ยินดีต้อนรับ, {user.name ?? user.email}
      </p>
    </div>
  );
}
