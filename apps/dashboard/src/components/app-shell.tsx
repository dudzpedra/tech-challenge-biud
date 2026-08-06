import Link from "next/link";
import { ReactNode } from "react";

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link
              className="text-lg font-semibold tracking-tight text-slate-900"
              href="/"
            >
              BIUD Transações
            </Link>
            <p className="text-sm text-slate-600">
              Monitoramento assíncrono via Kafka
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-slate-600">{description}</p>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}
