import RegistroForm from "./RegistroForm";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ["check-email"]?: string; ref?: string; role?: string }>;
}) {
  const sp = await searchParams;
  return <RegistroForm searchParams={sp} />;
}
