import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface LegalPageProps {
  title: string;
  children: ReactNode;
}

export default function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="border-b border-stone-200 bg-graphite-950 px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-lg tracking-[0.08em] text-paper">
          <span className="font-semibold">GARDEROB</span> <span className="font-normal text-stone-300">MEN</span>
        </Link>
      </div>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="mb-6 font-display text-2xl font-semibold text-graphite-950">{title}</h1>
        <div className="text-sm leading-relaxed text-graphite-700">{children}</div>
        <Link to="/" className="mt-10 inline-block text-sm font-medium text-graphite-600 underline underline-offset-2">
          ← Вернуться в магазин
        </Link>
      </main>
    </div>
  );
}
