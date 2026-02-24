export type StatutJuridique = 'AE' | 'SASU';

export type SimulationResult = {
  ca: number;
  cotisations: number;
  impots: number;
  net: number;
};

export function calculateFreelance(ca: number, statut: StatutJuridique): SimulationResult {
  if (statut === 'AE') {
    const cotisations = ca * 0.211; // Taux AE 2026 simplifié
    return { ca, cotisations, impots: 0, net: ca - cotisations };
  } else {
    // Simulation simplifiée SASU (IS + Cotisations président)
    const frais = ca * 0.10; // 10% de frais estimés
    const cotisations = (ca - frais) * 0.45; 
    return { ca, cotisations, impots: 500, net: ca - cotisations - 500 };
  }
}