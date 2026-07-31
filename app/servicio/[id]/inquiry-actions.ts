"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function submitInquiry(formData: FormData) {
  const serviceId = formData.get("service_id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  const admin = createAdminClient();

<<<<<<< HEAD
=======
  // Guardamos siempre la solicitud primero -- esto es lo que nos da
  // constancia de que este lead pasó por Coxiro, aunque después se
  // le redirija a un formulario externo de la propia empresa.
>>>>>>> 528f0a2c63b3c1b7d8ad12c8a1893c1bf0763791
  await admin.from("service_inquiries").insert({
    service_id: serviceId,
    name,
    email,
    message,
  });

<<<<<<< HEAD
  redirect(`/servicio/${serviceId}?inquiry_sent=1`);
}
=======
  const { data: service } = await admin
    .from("services")
    .select("inquiry_url")
    .eq("id", serviceId)
    .single();

  if (service?.inquiry_url) {
    redirect(service.inquiry_url);
  }

  redirect(`/servicio/${serviceId}?inquiry_sent=1`);
}
>>>>>>> 528f0a2c63b3c1b7d8ad12c8a1893c1bf0763791
