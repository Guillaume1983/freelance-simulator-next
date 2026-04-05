import type { FinancialLine } from './types';

interface RegimeWithLines {
  id: string;
  ca: number;
  fees: number;
  cotis: number;
  beforeTax: number;
  ir: number;
  l?: number;
  depensesPro?: number;
  depensesProPortage?: number;
  indemnitesKm?: number;
  loyerPercu?: number;
  avantagesOptimises?: number;
  lines?: FinancialLine[];
}

export function getDetailTextFromLines(
  r: RegimeWithLines,
  rowKey: string,
  sim: { state: { tjm: number; days: number; taxParts: number; portageComm: number; typeActiviteMicro?: 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE' } },
  monthly = false
): string {
  const fmt = (v: number) => Math.round(v).toLocaleString('fr-FR') + ' €';
  const monthly12 = (formula: string) => monthly ? `(${formula}) ÷ 12` : formula;
  const lines = r.lines ?? [];

  const getLine = (id: string) => lines.find((l: FinancialLine) => l.id === id);
  const getFormula = (id: string) => getLine(id)?.formula;

  switch (rowKey) {
    case 'ca':
      return getFormula('ca_annuel') ?? `${sim.state.tjm} € × ${sim.state.days} jours`;
    case 'fees': {
      if (r.id === 'Micro') {
        const type = sim.state.typeActiviteMicro ?? 'BNC';
        const abattements = { BNC: 34, BIC_SERVICE: 50, BIC_COMMERCE: 71 };
        const labels = { BNC: 'BNC', BIC_SERVICE: 'BIC services', BIC_COMMERCE: 'BIC commerce' };
        const base = `Cotisations et IR : base sur le CA avec abattement forfaitaire (${abattements[type]} % ${labels[type]}). Les dépenses catalogue ci-dessous ne réduisent pas cette base.`;
        const cfe = getLine('micro_cfe')?.amount ?? 0;
        const dep = getLine('micro_depenses_reelles')?.amount ?? 0;
        const parts: string[] = [base];
        if (cfe > 0) {
          parts.push(`CFE (hors abattement, payée sur trésorerie) : ${fmt(cfe)} / an.`);
        }
        if (dep > 0) {
          parts.push(
            `Dépenses professionnelles saisies : ${fmt(dep)} / an (sorties de trésorerie après impôt ; elles réduisent le « disponible » sans modifier cotisations ni IR).`
          );
        }
        return parts.join('\n\n');
      }
      // Portage : toujours afficher le calcul explicite (dépenses pro + IK + avantages, pas de loyer)
      if (r.id === 'Portage') {
        const dep = r.depensesProPortage ?? 0;
        const ik = r.indemnitesKm ?? 0;
        const avantages = r.avantagesOptimises ?? 0;
        const total = dep + ik + avantages;
        const parts: string[] = [
          `Charges = dépenses pro + IK + avantages exonérés`,
          `= ${fmt(dep)} + ${fmt(ik)} + ${fmt(avantages)} = ${fmt(total)}`,
        ];
        if (dep > 0) parts.push(`• Dépenses pro (acceptées en portage) : ${fmt(dep)}`);
        if (ik > 0) parts.push(`• Indemnités kilométriques : ${fmt(ik)}`);
        if (avantages > 0) parts.push(`• Avantages exonérés : ${fmt(avantages)}`);
        return parts.join('\n');
      }
      // EURL / SASU : détail depuis les lignes (dépenses + IK + loyer + avantages + CFE dans le total r.fees)
      const depenseLines = lines.filter((l: FinancialLine) => l.category === 'depense');
      const ikLine = getLine('indemnites_km');
      const loyerLine = getLine('loyer_percu');
      const avantagesLine = getLine('avantages');
      const cfeLine =
        getLine('sasu_cfe') ?? getLine('eurl_ir_cfe') ?? getLine('eurl_is_cfe');
      const parts: string[] = [];
      if (depenseLines.length > 0) {
        const totalDepenses = depenseLines.reduce((s, l) => s + l.amount, 0);
        const detail = depenseLines.map(l => `  • ${l.label} : ${fmt(l.amount)}${l.formula ? ` (${l.formula})` : ''}`).join('\n');
        parts.push(`Dépenses professionnelles : ${fmt(totalDepenses)}\n${detail}`);
      }
      if (ikLine && ikLine.amount > 0) {
        parts.push(`Indemnités kilométriques : ${fmt(ikLine.amount)}${ikLine.formula ? ` (${ikLine.formula})` : ''}`);
      }
      if (loyerLine && loyerLine.amount > 0) {
        parts.push(`Loyer (location bureau) : ${fmt(loyerLine.amount)}${loyerLine.formula ? ` (${loyerLine.formula})` : ''}`);
      }
      if (avantagesLine && avantagesLine.amount > 0) {
        parts.push(`Avantages exonérés : ${fmt(avantagesLine.amount)}`);
      }
      if (cfeLine && cfeLine.amount > 0) {
        parts.push(`CFE (cotisation foncière des entreprises) : ${fmt(cfeLine.amount)} / an`);
      }
      if (parts.length === 0 && r.fees > 0) {
        return `Charges d’exploitation : ${fmt(r.fees)} / an (détail non disponible pour ce statut)`;
      }
      if (parts.length === 0) return 'Aucune charge professionnelle';
      return parts.join('\n');
    }
    case 'optimisations': {
      const ik = getLine('indemnites_km')?.amount ?? 0;
      const loyer = getLine('loyer_percu')?.amount ?? 0;
      const avantages = getLine('avantages')?.amount ?? 0;
      const parts: string[] = [];
      if (ik > 0) parts.push(`Indemnités kilométriques : ${fmt(ik)}\n  Coût pour l'entreprise (inclus dans "Charges") et remboursement net, exonéré de cotisations et d'IR.`);
      if (loyer > 0) parts.push(`Loyer perçu (location bureau) : ${fmt(loyer)}\n  Coût pour la société (inclus dans "Charges") et revenu foncier pour le foyer.`);
      if (avantages > 0) parts.push(`Avantages exonérés (CE, chèques vacances, mutuelle…) : ${fmt(avantages)}\n  Coût employeur (inclus dans "Charges") mais avantage net pour vous, sans cotisations sociales ni IR dans les plafonds légaux.`);
      if (parts.length === 0) return 'Aucune optimisation activée (IK, loyer, avantages)';
      return parts.join('\n');
    }
    case 'portageCommission': {
      if (r.id !== 'Portage') return 'Non applicable';
      const line = getLine('portage_commission');
      return line?.formula ?? `CA × ${sim.state.portageComm}%`;
    }
    case 'cotis': {
      const line = getLine('portage_cotis') ?? getLine('micro_cotis') ?? getLine('eurl_ir_cotis') ?? getLine('eurl_is_cotis');
      if (line?.formula) return line.formula;
      const typeMicro = sim.state.typeActiviteMicro ?? 'BNC';
      const tauxMicro: Record<string, string> = { BNC: '21,1 %', BIC_SERVICE: '21,2 %', BIC_COMMERCE: '12,3 %' };
      return r.id === 'Micro' ? `CA × ${tauxMicro[typeMicro]} (micro ${typeMicro})` : r.id === 'Portage' ? 'Base nette × 45 %' : r.id === 'EURL IR' ? '(CA − Charges) × ~40 % (TNS)' : r.id === 'EURL IS' ? 'Salaire net × 45 %' : 'IS 20 % (inclus)';
    }
    case 'beforeTax': {
      // CAS SPÉCIFIQUES (EURL IS / SASU) : on ignore volontairement line.formula
      // pour pouvoir expliquer clairement la CFE et le lien avec le résultat société.
      if (r.id === 'EURL IS') {
        const cfe = getLine('eurl_is_cfe')?.amount ?? 0;
        const baseText = `Base avant impôt = salaire net du dirigeant (part du résultat société affectée au salaire).`;
        return monthly12(
          cfe > 0
            ? `${baseText}\nCFE annuelle prise en compte dans les charges de la société : ${fmt(cfe)}.`
            : baseText
        );
      }
      if (r.id === 'SASU') {
        const cfe = getLine('sasu_cfe')?.amount ?? 0;
        const salaire = getLine('sasu_remuneration')?.amount ?? 0;
        const divBruts = (getLine('sasu_dividendes')?.amount ?? 0) > 0
          ? (getLine('sasu_dividendes')!.amount / 0.70)
          : 0;
        const parts: string[] = [];
        if (salaire > 0) parts.push(`Salaire net ${fmt(salaire)}`);
        if (divBruts > 0) parts.push(`Dividendes bruts ${fmt(divBruts)}`);
        const baseText = `Revenu brut = ${parts.join(' + ')}.`;
        return monthly12(
          cfe > 0
            ? `${baseText}\nCFE annuelle prise en compte dans le calcul du résultat société : ${fmt(cfe)}.`
            : baseText
        );
      }

      const line =
        getLine('portage_remuneration') ??
        getLine('micro_remuneration') ??
        getLine('eurl_ir_remuneration') ??
        getLine('eurl_is_remuneration') ??
        getLine('sasu_remuneration') ??
        getLine('sasu_dividendes');
      if (line?.formula) return monthly12(line.formula);

      // CAS GÉNÉRAL : Construire la formule : CA − charges − [commission si Portage] − [CFE si Micro] − cotis
      const terms: string[] = [fmt(r.ca)];
      if (r.fees > 0) terms.push(`− ${fmt(r.fees)} (charges)`);
      if (r.id === 'Portage') {
        const comm = getLine('portage_commission')?.amount ?? 0;
        if (comm > 0) terms.push(`− ${fmt(comm)} (commission)`);
      }
      if (r.id === 'Micro') {
        const cfe = getLine('micro_cfe')?.amount ?? 0;
        if (cfe > 0) terms.push(`− ${fmt(cfe)} (CFE)`);
      }
      if (r.cotis > 0) terms.push(`− ${fmt(r.cotis)}`);
      return monthly12(terms.join(' '));
    }
    case 'ir': {
      if (r.id === 'SASU') {
        const pfuLine = getLine('sasu_pfu');
        const irLine = getLine('sasu_ir');
        const parts: string[] = [];
        if (pfuLine?.formula) parts.push(pfuLine.formula);
        if (irLine?.formula) parts.push(irLine.formula);
        return parts.join('\n\n') || 'PFU 30 % sur dividendes';
      }
      const line = getLine('portage_ir') ?? getLine('micro_ir') ?? getLine('eurl_ir_ir') ?? getLine('eurl_is_ir');
      if (line?.formula) return line.formula;
      if (r.id === 'Micro') return 'Barème IR (base = CA × 66%)';
      return `Barème progressif IR (${sim.state.taxParts} parts)`;
    }
    case 'net': {
      if (r.id === 'Micro') {
        const dep = getLine('micro_depenses_reelles')?.amount ?? 0;
        const base = `${fmt(r.beforeTax)} − ${fmt(r.ir)}`;
        if (dep > 0) {
          return monthly12(`${base} − ${fmt(dep)} (dépenses professionnelles, trésorerie)`);
        }
        return monthly12(base);
      }
      const ik = getLine('indemnites_km')?.amount ?? 0;
      const loyerPercu = getLine('loyer_percu')?.amount ?? 0;
      const avantages = getLine('avantages')?.amount ?? 0;

      const parts: string[] = [`${fmt(r.beforeTax)} − ${fmt(r.ir)}`];
      if (loyerPercu > 0) parts.push(`+ Loyer ${fmt(loyerPercu)}`);
      if (ik > 0) parts.push(`+ IK ${fmt(ik)}`);
      if (avantages > 0) parts.push(`+ Avantages ${fmt(avantages)}`);

      return monthly12(parts.join(' '));
    }
    case 'cashInCompany': {
      const cash = (r as { cashInCompany?: number }).cashInCompany;
      if (cash == null || cash === 0) return 'Non applicable ou 0';
      return `Trésorerie laissée en société après impôt sur les sociétés : ${fmt(cash)} /an`;
    }
    default:
      return '';
  }
}
