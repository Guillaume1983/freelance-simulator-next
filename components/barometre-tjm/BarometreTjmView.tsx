"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Info } from "lucide-react";
import {
  METIERS_BAROMETRE,
  NIVEAUX,
  REGIONS,
  NIVEAU_LABELS,
  REGION_LABELS,
  CATEGORIES_ORDER,
  DERNIERE_MISE_A_JOUR,
  SOURCES,
  type NiveauExp,
  type RegionTjm,
} from "@/lib/data/barometre-tjm";

const CATEGORY_COLORS: Record<string, string> = {
  "Tech":
    "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300",
  "Produit & Design":
    "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300",
  "Conseil & Management":
    "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
  "Marketing & Communication":
    "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300",
  "Finance, Juridique & RH":
    "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
};

type Row =
  | { type: "cat"; categorie: string }
  | { type: "metier"; id: string; label: string; categorie: string; niveaux: (typeof METIERS_BAROMETRE)[number]["niveaux"] };

export function BarometreTjmView() {
  const [niveau, setNiveau] = useState<NiveauExp>("confirme");
  const [region, setRegion] = useState<RegionTjm>("idf");

  const rows: Row[] = CATEGORIES_ORDER.flatMap((cat) => [
    { type: "cat" as const, categorie: cat },
    ...METIERS_BAROMETRE.filter((m) => m.categorie === cat).map((m) => ({
      type: "metier" as const,
      id: m.id,
      label: m.label,
      categorie: m.categorie,
      niveaux: m.niveaux,
    })),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">

        <Link
          href="/outils"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-6"
        >
          <ArrowLeft size={16} />
          Retour aux outils
        </Link>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Baromètre TJM Freelance 2025
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            TJM médian et fourchettes par métier, expérience et région
            {" · "}Mise à jour : {DERNIERE_MISE_A_JOUR}
          </p>
          <div className="mt-3 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            <Info size={15} className="mt-0.5 shrink-0 text-slate-400" />
            <span>
              Données agrégées depuis des baromètres freelance publiés ({SOURCES.join(", ")}).
              Fourchettes indicatives — non contractuelles.
            </span>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Niveau d'expérience
              </p>
              <div className="flex flex-wrap gap-2">
                {NIVEAUX.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNiveau(n)}
                    className={[
                      "px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all",
                      niveau === n
                        ? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600",
                    ].join(" ")}
                  >
                    {NIVEAU_LABELS[n].short}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                {NIVEAU_LABELS[niveau].full}
              </p>
            </div>

            <div className="sm:w-56">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Région
              </p>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionTjm)}
                className="w-full px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                {REGIONS.map((reg) => (
                  <option key={reg} value={reg}>
                    {REGION_LABELS[reg]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">
                    Métier
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    TJM médian
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hidden sm:table-cell">
                    Fourchette
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 hidden md:table-cell">
                    Simuler
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  if (row.type === "cat") {
                    return (
                      <tr key={"cat-" + row.categorie} className="bg-slate-50/80 dark:bg-slate-800/30">
                        <td
                          colSpan={4}
                          className={[
                            "px-5 py-2 text-xs font-bold uppercase tracking-wider",
                            CATEGORY_COLORS[row.categorie] ?? "",
                          ].join(" ")}
                        >
                          {row.categorie}
                        </td>
                      </tr>
                    );
                  }

                  const range = row.niveaux[niveau][region];
                  return (
                    <tr
                      key={row.id}
                      className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                        {row.label}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums font-bold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
                        {range.median.toLocaleString("fr-FR")} €/j
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-400 dark:text-slate-500 whitespace-nowrap hidden sm:table-cell">
                        {range.min.toLocaleString("fr-FR")}
                        {" – "}
                        {range.max.toLocaleString("fr-FR")} €/j
                      </td>
                      <td className="px-4 py-3.5 text-right hidden md:table-cell">
                        <Link
                          href="/outils?outil=tjm-revenu-net"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Tester
                          <Calculator size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA mobile */}
        <div className="flex md:hidden justify-center mb-6">
          <Link
            href="/outils?outil=tjm-revenu-net"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow"
          >
            <Calculator size={16} />
            Calculer mon revenu net depuis mon TJM
          </Link>
        </div>

        {/* Note méthodologique */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Données indicatives.</strong>{" "}
            Ces fourchettes sont agrégées depuis des baromètres publics et ne constituent pas un conseil tarifaire personnalisé.
            Les TJM réels varient selon la mission, le secteur client, la localisation précise et le mode de travail.
            {" "}Sources : {SOURCES.join(" · ")}.
          </p>
        </div>

        {/* Liens transversaux */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/outils?outil=net-tjm-cible" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            Calculer le TJM minimum pour un revenu net cible
          </Link>
          <Link href="/comparateur" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            Comparer tous les statuts juridiques
          </Link>
        </div>
      </div>
    </main>
  );
}
