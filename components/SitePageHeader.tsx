import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/** En-tête commun : même grille que PageSettingsPageHeader (retour à gauche, titre centré). */
export function SitePageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-indigo-100 dark:border-slate-800 shrink-0">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-x-3 sm:gap-y-0">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 justify-self-start text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} className="shrink-0" />
            Retour à l&apos;accueil
          </Link>
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 sm:justify-center">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight text-center">
              {title}
            </h1>
          </div>
          <div className="hidden sm:block sm:min-h-0" aria-hidden />
        </div>
        {description ? (
          <div className="mt-1 flex flex-col items-center text-center gap-1">
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-snug max-w-2xl">
              {description}
            </p>
          </div>
        ) : null}
      </div>
    </header>
  );
}
