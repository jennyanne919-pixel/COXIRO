import { createClient } from "@/lib/supabase/server";
import ProviderSummary from "@/components/dashboard/ProviderSummary";
import ClientSummary from "@/components/dashboard/ClientSummary";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // el layout ya redirige a /login antes de esto

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "provider") {
    return <ProviderSummary userId={user.id} />;
  }

  return <ClientSummary userId={user.id} />;
}
