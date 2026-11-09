import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegistroForm from "./RegistroForm";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ["check-email"]?: string; ref?: string; role?: string; slug?: string }>;
}) {
  const sp = await searchParams;

  // Si ya hay sesión (por ejemplo, tras registrarse), no tiene sentido volver
  // a mostrar el registro: se va al panel. Evita ver un error de "usuario ya
  // registrado" cuando la cuenta se creó bien.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return <RegistroForm searchParams={sp} />;
}
