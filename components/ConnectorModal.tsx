'use client';
import Link from 'next/link';
import { X, LogIn, UserPlus } from 'lucide-react';

export default function ConnectorModal({
  open,
  onClose,
  title = 'Connectez-vous pour débloquer',
  message = 'Connectez-vous ou créez un compte pour exporter en PDF et accéder aux détails de calcul.',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-black text-slate-800 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{message}</p>
        <div className="flex flex-col gap-2">
          <Link
            href="/connexion"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors"
          >
            <LogIn size={16} />
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors"
          >
            <UserPlus size={16} />
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
