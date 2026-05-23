import { requireTenant, isProfessional } from "@/lib/auth/session";
import { AdminDashboard } from "./admin-dashboard";
import { ProfessionalDashboard } from "./professional-dashboard";

export default async function DashboardPage() {
  const session = await requireTenant();
  if (isProfessional(session)) {
    return <ProfessionalDashboard userId={session.user.id} tenantId={session.currentTenantId} userEmail={session.user.email ?? ""} />;
  }
  return <AdminDashboard userEmail={session.user.email ?? ""} />;
}
