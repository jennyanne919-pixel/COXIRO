"use client";

import { useRef } from "react";
import NodeBackground from "./NodeBackground";

export default function HeroSection({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  return (
    <section ref={containerRef as any} className={className}>
      <NodeBackground containerRef={containerRef} textRef={textRef} />
      <div ref={textRef} className="relative z-10">
        {children}
      </div>
    </section>
  );
}
