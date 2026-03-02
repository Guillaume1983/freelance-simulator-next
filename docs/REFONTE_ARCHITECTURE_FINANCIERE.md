# Refonte du système de calcul financier — Plan d'architecture

> **Statut :** En attente de validation  
> **Date :** 2 mars 2025

---

## 1. Cartographie des calculs existants

### 1.1 Fichiers concernés

| Fichier | Rôle actuel | Problèmes |
|---------|-------------|-----------|
| `lib/projections.ts` | Moteur unique (250 lignes) | Formules dispersées, pas de traçabilité, calculs directs du net |
| `lib/constants.ts` | Constantes (CFE, IK, plafonds, catalogue) | Taux fiscaux dupliqués dans projections.ts |
| `hooks/useSimulation.ts` | État + appel calculateRegimes | Dépend du format RegimeResult actuel |
| `components/ComparisonTable.tsx` | Affichage tableau + getDetailText | **Logique de détail du calcul dans l'UI** (lignes 168-189) |
| `components/ProjectionSection.tsx` | Affichage projection + getDetailText | **Duplication de getDetailText** (lignes 147-168) |
| `components/ExpandPanels.tsx` | computeRecap | **Calcul IK/dépenses dans l'UI** (lignes 10-24) |
| `components/TopCards.tsx` | Affichage fees | Utilise sim.resultats[0].fees (hardcodé Portage) |

### 1.2 Flux actuel (simplifié)

```
ProjectionParams
    → buildFinancialContext() → ctx (CA, depensesPro, IK, loyer, etc.)
    → calculateRegimes() → pour chaque statut :
        - if/else par statut avec formules en dur
        - res.fees, res.cotis, res.ir, res.beforeTax, res.net
        - res.net = beforeTax + loyer - ir + avantages (calcul direct)
    → RegimeResult[]
```

### 1.3 Problèmes identifiés

1. **Pas de traçabilité** : le net est calculé directement, pas comme somme de lignes
2. **Formules dupliquées** : barème IR, IK, taux cotis dans projections.ts
3. **Logique dans l'UI** : `getDetailText` reconstitue le calcul en texte (fragile)
4. **Statuts différents** : chaque statut a sa propre logique, pas de pipeline commun
5. **Loyer / avantages** : traités de manière ad hoc dans le net
6. **Paramètres non utilisés** : `remunerationDirigeantMensuelle`, `repartitionRemuneration` partiellement

---

## 2. Nouvelle architecture proposée

### 2.1 Structure des fichiers

```
lib/
├── financial/
│   ├── types.ts              # FinancialLine, FinancialPipeline, StatusId
│   ├── rates.ts              # Tous les taux (IR, cotis, IS, IK, etc.)
│   ├── pipeline.ts           # Pipeline unique (étapes 1 à 6)
│   ├── lines/
│   │   ├── production.ts     # Étape 1 — CA, TJM, jours
│   │   ├── depenses.ts       # Étape 2 — Dépenses pro
│   │   ├── optimisations.ts  # Étape 3 — IK, loyer, avantages
│   │   ├── statuts/
│   │   │   ├── portage.ts
│   │   │   ├── micro.ts
│   │   │   ├── eurl-ir.ts
│   │   │   ├── eurl-is.ts
│   │   │   └── sasu.ts
│   │   └── fiscalite.ts      # Étape 5 — IR foyer
│   └── index.ts              # runPipeline, export public
├── constants.ts              # CFE, catalogue charges (inchangé)
└── projections.ts            # Adapter pour appeler pipeline (rétrocompat)
```

### 2.2 Modèle FinancialLine

```typescript
// lib/financial/types.ts

export type StatusId = 'Portage' | 'Micro' | 'EURL IR' | 'EURL IS' | 'SASU';

export type LineCategory =
  | 'production'      // CA, TJM, jours
  | 'depense'        // Dépenses pro (sorties cash)
  | 'optimisation'   // IK, loyer, avantages
  | 'statut'         // Cotis, commission, IS, etc.
  | 'fiscalite'      // IR
  | 'synthese';      // Net final

export interface FinancialLine {
  id: string;
  label: string;
  category: LineCategory;
  amount: number;           // Montant affiché (€)
  cashImpact: number;       // Impact trésorerie (+ entrée, - sortie)
  fiscalImpact: number;     // Impact base imposable
  socialImpact: number;    // Impact cotisations sociales
  applicableStatuses: StatusId[];  // [] = tous
  sourceLines?: string[];  // IDs des lignes source (pour traçabilité)
  formula?: string;        // Formule explicative (ex: "CA × 7%")
}
```

### 2.3 Pipeline

```typescript
// lib/financial/pipeline.ts

export interface PipelineInput {
  tjm: number;
  days: number;
  growthRate: number;
  annee?: number;
  activeCharges: string[];
  chargeAmounts: Record<string, number>;
  materielAnnuel: number;
  materielActive: boolean;
  kmAnnuel: number;
  cvFiscaux: string;
  vehiculeActive: boolean;
  loyerPercu: number;
  loyerActive: boolean;
  avantagesOptimises: number;
  taxParts: number;
  spouseIncome: number;
  acreEnabled: boolean;
  citySize: CitySize;
  // Paramètres par statut
  portageComm: number;
  typeActiviteMicro: 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE';
  prelevementLiberatoire: boolean;
  remunerationDirigeantMensuelle: number;  // EURL IS
  repartitionRemuneration: number;         // SASU
}

export interface PipelineResult {
  statusId: StatusId;
  lines: FinancialLine[];
  net: number;  // Dérivé : Σ ligne où category='synthese' ou somme cashImpact
}

export function runPipeline(input: PipelineInput): PipelineResult[];
```

### 2.4 Étapes du pipeline (détail)

#### ÉTAPE 1 — Production

| Ligne | amount | cashImpact | fiscalImpact | socialImpact |
|-------|--------|------------|--------------|--------------|
| CA annuel HT | tjm × days × (1+g)^(n-1) | 0 | +montant | 0 |
| TJM | tjm | 0 | 0 | 0 |
| Jours facturés | days | 0 | 0 | 0 |

#### ÉTAPE 2 — Dépenses professionnelles

Pour chaque charge active (catalogue + matériel) :

| Ligne | cashImpact | fiscalImpact | socialImpact |
|-------|------------|--------------|--------------|
| Expert-comptable | -montant | -montant | 0 |
| ... | - | - | 0 |
| Matériel (amorti 3 ans) | -montant/3 | -montant/3 | 0 |

**Règle Micro :** fiscalImpact = 0 pour toutes les dépenses (sauf CFE).

#### ÉTAPE 3 — Optimisations fiscales

| Ligne | cashImpact | fiscalImpact | socialImpact |
|-------|------------|--------------|--------------|
| Indemnités km | 0 | -montant | 0 |
| Location bureau (côté société) | -loyer×12 | -loyer×12 | 0 |
| Location bureau (côté foyer) | +loyer×12 | +loyer×12 | 0 |
| Avantages exonérés | +montant | 0 | 0 |

#### ÉTAPE 4 — Calcul spécifique par statut

Chaque module statut reçoit les lignes des étapes 1-3 et produit :

- Lignes de cotisations / commission / IS
- Ligne rémunération (salaire / dividendes)
- applicableStatuses = [ce statut]

#### ÉTAPE 5 — Fiscalité du foyer

- Ligne IR foyer : calculée à partir de Σ fiscalImpact des lignes de revenus
- Barème IR dans un seul fichier `rates.ts`

#### ÉTAPE 6 — Net mensuel réel

```
NET = Σ cashImpact (revenus) + Σ cashImpact (avantages) - Σ cashImpact (impôts)
```

Aucun calcul direct. Le net est une ligne de synthèse dont amount = somme des impacts.

---

## 3. Fichier central des taux

```typescript
// lib/financial/rates.ts

export const RATES_2026 = {
  // IR
  ir: {
    abattement: 0.10,
    tranches: [
      { seuil: 11294, taux: 0 },
      { seuil: 28797, taux: 0.11 },
      { seuil: 82341, taux: 0.30 },
      { seuil: 177106, taux: 0.41 },
      { seuil: Infinity, taux: 0.45 },
    ],
  },
  // Cotisations
  micro: { cotis: 0.211, acre: 0.5 },
  portage: { cotis: 0.45, acre: 0.5 },
  eurlIr: { cotis: 0.40, acre: 0.25 },
  eurlIs: { cotis: 0.45, acre: 0.25 },
  // IS
  is: { taux: 0.25 },
  isSasu: { taux: 0.20 },
  // Prélèvement libératoire
  prelevementLiberatoire: 0.022,
  // Abattement Micro BNC
  abattementMicroBnc: 0.34,
  // Dividendes flat tax
  flatTaxDividendes: 0.30,
  // IK (barèmes)
  ik: { /* ... */ },
};
```

---

## 4. Fichiers à modifier

### 4.1 Créer (nouveaux)

| Fichier | Description |
|---------|-------------|
| `lib/financial/types.ts` | FinancialLine, StatusId, LineCategory |
| `lib/financial/rates.ts` | Tous les taux 2026 |
| `lib/financial/pipeline.ts` | Orchestrateur du pipeline |
| `lib/financial/lines/production.ts` | Étape 1 |
| `lib/financial/lines/depenses.ts` | Étape 2 |
| `lib/financial/lines/optimisations.ts` | Étape 3 |
| `lib/financial/lines/statuts/portage.ts` | Module Portage |
| `lib/financial/lines/statuts/micro.ts` | Module Micro |
| `lib/financial/lines/statuts/eurl-ir.ts` | Module EURL IR |
| `lib/financial/lines/statuts/eurl-is.ts` | Module EURL IS |
| `lib/financial/lines/statuts/sasu.ts` | Module SASU |
| `lib/financial/lines/fiscalite.ts` | Étape 5 — IR |
| `lib/financial/index.ts` | runPipeline, export |

### 4.2 Modifier

| Fichier | Modifications |
|---------|---------------|
| `lib/projections.ts` | Adapter pour appeler `runPipeline`, mapper `PipelineResult` → `RegimeResult` (rétrocompat) |
| `hooks/useSimulation.ts` | Adapter si signature de calculateRegimes change ; garder même interface |
| `components/ComparisonTable.tsx` | Remplacer `getDetailText` par lecture des `sourceLines` / `formula` des FinancialLine |
| `components/ProjectionSection.tsx` | Idem |
| `components/ExpandPanels.tsx` | computeRecap : utiliser les lignes du pipeline ou un helper dédié |

### 4.3 Conserver (inchangé)

| Fichier | Raison |
|---------|--------|
| `lib/constants.ts` | CHARGES_CATALOG, CFE_PAR_VILLE, plafonds — garder |
| `components/TopCards.tsx` | Affichage uniquement — adapter la source de données |

---

## 5. Interface de traçabilité

Chaque montant affiché dans l'UI pourra :

```typescript
// Exemple : ligne "Net mensuel" pour Portage
const netLine = result.lines.find(l => l.id === 'net_final');
// netLine.sourceLines = ['remuneration_portage', 'loyer_percu', 'avantages', 'ir_foyer']
// netLine.formula = "Rémunération + Loyer - IR + Avantages"
```

L'UI pourra afficher un tooltip ou une modale "Détail du calcul" en listant les lignes sources.

---

## 6. Plan de migration

### Phase 1 — Création du moteur (sans toucher à l'existant)

1. Créer `lib/financial/` avec types, rates, pipeline
2. Implémenter les étapes 1 à 6
3. Tests unitaires sur le pipeline (mêmes résultats que l'ancien moteur)

### Phase 2 — Branchement

1. Modifier `projections.ts` pour appeler `runPipeline`, mapper vers `RegimeResult`
2. Vérifier que l'UI affiche les mêmes résultats

### Phase 3 — Traçabilité UI

1. Exposer les `FinancialLine` dans le résultat (nouveau champ `lines` dans RegimeResult)
2. Adapter `getDetailText` pour utiliser les lignes
3. Permettre le clic "Détail" pour afficher les lignes sources

### Phase 4 — Nettoyage

1. Supprimer les formules dupliquées de `projections.ts`
2. Supprimer `getDetailText` manuel

---

## 7. Contraintes de rétrocompatibilité

- `RegimeResult` doit rester compatible (ca, fees, cotis, ir, beforeTax, net, etc.)
- `useSimulation` ne doit pas changer d'interface publique
- Les composants qui lisent `sim.resultats` doivent continuer à fonctionner
- Les données Supabase (simulation_settings) inchangées

---

## 8. Validation attendue

Avant de coder, merci de valider :

1. **Structure FinancialLine** : les 3 impacts (cash, fiscal, social) sont-ils suffisants ?
2. **Pipeline en 6 étapes** : est-ce aligné avec votre vision ?
3. **Modules par statut** : un fichier par statut vous convient-il ?
4. **Rétrocompat** : garder RegimeResult pour l'UI est-il acceptable (ou préférez-vous que l'UI consomme directement les FinancialLine) ?

---

## 9. Schéma du flux cible

```
PipelineInput
    │
    ├─► Étape 1: production.ts     → [CA, TJM, jours]
    │
    ├─► Étape 2: depenses.ts       → [expert-comptable, bureau, ...]
    │
    ├─► Étape 3: optimisations.ts  → [IK, loyer_societe, loyer_foyer, avantages]
    │
    ├─► Étape 4: statuts/xxx.ts    → pour chaque statut :
    │       [commission, cotis, IS, remuneration, ...]
    │
    ├─► Étape 5: fiscalite.ts      → [IR_foyer]
    │
    └─► Étape 6: synthèse          → [net_final] = Σ cashImpact
            │
            │
            ▼
    PipelineResult[] (un par statut)
        - lines: FinancialLine[]
        - net: number (dérivé)
```

---

**En attente de votre validation pour procéder à l'implémentation.**
