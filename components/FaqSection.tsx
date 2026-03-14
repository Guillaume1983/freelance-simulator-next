'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { FAQ_ITEMS } from '@/lib/faq';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        Questions fréquentes
      </h2>
      <ul className="space-y-2">
        {FAQ_ITEMS.map((item, index) => (
          <li
            key={index}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between gap-4 px-4 py-4 min-h-[48px] text-left font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="text-sm md:text-base wrap-break-word text-left">{item.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 shrink-0 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 shrink-0 text-slate-400" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 pt-0">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
