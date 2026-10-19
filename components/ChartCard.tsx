"use client";

import React from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  className?: string; // controla la altura, p. ej. "h-[420px]"
  action?: React.ReactNode;
  children: React.ReactNode;
}

// Contenedor visual común para todas las gráficas del dashboard
export default function ChartCard({ title, subtitle, className = "h-[420px]", action, children }: ChartCardProps) {
  return (
    <div className={`flex w-full flex-col rounded-xl border border-linea bg-panel p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-semibold leading-tight text-tinta">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-bruma">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="min-h-0 w-full flex-1">{children}</div>
    </div>
  );
}
