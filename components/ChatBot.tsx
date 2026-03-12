'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const { messages, sendMessage, status, error, clearError } = useChat();
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === 'streaming') return;
    sendMessage({ text });
    setInput('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900"
        aria-label={open ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl md:w-full md:max-w-md dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="font-semibold text-slate-800 dark:text-slate-50">Assistant Freelance Simulateur</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Questions sur les statuts (Micro, EURL, SASU…)</p>
          </div>
          <div
            ref={listRef}
            className="flex max-h-[min(60vh,400px)] min-h-[200px] flex-col gap-3 overflow-y-auto p-4 bg-white dark:bg-slate-900"
          >
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-100">
                <p className="font-medium">Erreur</p>
                <p className="mt-1">{error.message || 'Une erreur est survenue.'}</p>
                <button
                  type="button"
                  onClick={() => clearError?.()}
                  className="mt-2 text-xs underline text-red-700 dark:text-red-200"
                >
                  Fermer
                </button>
              </div>
            )}
            {messages.length === 0 && !error && (
              <p className="text-center text-sm text-slate-500">
                Posez une question sur les statuts freelance (Micro, EURL, SASU, portage…).
              </p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col gap-1 ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <span className="text-xs font-medium text-slate-400">
                  {message.role === 'user' ? 'Vous' : 'Assistant'}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-50'
                  }`}
                >
                  {message.parts?.map((part, i) => {
                    if (part.type === 'text') {
                      return (
                        <div key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                          {part.text}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
            {status === 'streaming' && (
              <div className="flex items-center gap-1 text-slate-400 dark:text-slate-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500 dark:bg-indigo-400" />
                <span className="text-xs">Réponse en cours…</span>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Votre question…"
                disabled={status === 'streaming'}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:placeholder-slate-400 dark:disabled:bg-slate-800"
              />
              <button
                type="submit"
                disabled={!input.trim() || status === 'streaming'}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600"
                aria-label="Envoyer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
