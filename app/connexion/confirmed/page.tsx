'use client';

import { useEffect } from 'react';
import { Check } from 'lucide-react';

export default function ConnexionConfirmedPage() {
  useEffect(() => {
    // Anciens liens qui pointent encore vers /connexion/confirmed : même effet que le nouveau flux.
    sessionStorage.setItem('emailConfirmedBanner', '1');
    const o = window.location.origin;
    window.location.replace(`${o}/?email_validated=1`);
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-12 md:py-20 flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <div className="mt-3 flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Check size={16} />
          Redirection…
        </div>
      </div>
    </main>
  );
}

