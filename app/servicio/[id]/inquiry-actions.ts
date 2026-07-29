"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function submitInquiry(formData: FormData) {
  const serviceId = formData.get("service_id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  const admin = createAdminClient();

  await admin.from("service_inquiries").insert({
    service_id: serviceId,
    name,
    email,
    message,
  });

  redirect(`/servicio/${serviceId}?inquiry_sent=1`);
}
