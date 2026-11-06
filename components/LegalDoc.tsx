// Contenedor con estilos para los textos legales (HTML estático propio).
export default function LegalDoc({ html }: { html: string }) {
  return (
    <article
      className={[
        "max-w-3xl mx-auto px-6 py-10 text-[15px] leading-relaxed text-cx-texto",
        "[&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-10 [&_h1]:mb-3",
        "[&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-2",
        "[&_p]:my-3",
        "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_li]:my-1",
        "[&_a]:text-cx-prof [&_a]:underline",
        "[&_strong]:font-semibold",
        "[&_.tabla]:overflow-x-auto [&_.tabla]:my-4",
        "[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
        "[&_th]:text-left [&_th]:bg-white [&_th]:border [&_th]:border-cx-borde [&_th]:px-3 [&_th]:py-2",
        "[&_td]:border [&_td]:border-cx-borde [&_td]:px-3 [&_td]:py-2 [&_td]:align-top",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
