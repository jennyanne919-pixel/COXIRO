"use client";

import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./ui";

export type NavItem = { label: string; href: string; icon: IconName; soon?: boolean };

export default function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  const activo = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <nav className="flex flex-row md:flex-col gap-1 flex-1 overflow-x-auto md:overflow-visible">
      {items.map((item) => {
        const on = !item.soon && activo(item.href);
        const base =
          "flex items-center gap-2.5 text-sm rounded-xl px-3 py-2 whitespace-nowrap transition";
        if (item.soon) {
          return (
            <span key={item.label} className={`${base} text-cx-texto-osc-2/60 cursor-default`}>
              <Icon name={item.icon} className="w-[18px] h-[18px]" />
              {item.label}
              <span className="ml-auto text-[10px] uppercase tracking-wide bg-white/10 rounded-full px-1.5 py-0.5">
                pronto
              </span>
            </span>
          );
        }
        return (
          <a
            key={item.label}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={`${base} ${
              on
                ? "bg-white/10 text-white font-medium"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon
              name={item.icon}
              className={`w-[18px] h-[18px] ${on ? "text-cx-celeste" : ""}`}
            />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
