import RegistroForm from "./RegistroForm";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ["check-email"]?: string }>;
}) {
  const sp = await searchParams;
  return <RegistroForm searchParams={sp} />;
}
