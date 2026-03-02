# Règles de calcul — Freelance Simulateur

Ce document décrit toutes les formules de calcul implémentées pour les charges, cotisations, impôts et autres indicateurs par statut. Il indique où modifier le code pour les mettre à jour.

---

## 📁 Emplacement des formules

| Élément | Fichier | Lignes |
|--------|---------|--------|
| **Moteur principal** | `lib/projections.ts` | 83-228 |
| **Constantes** (CFE, IK, plafonds, charges) | `lib/constants.ts` | 1-37 |
| **Parts fiscales** | `lib/projections.ts` | 235-242 |

---

## 1. Contexte financier commun (`buildFinancialContext`)

**Fichier :** `lib/projections.ts` (lignes 109-149)

### 1.1 Chiffre d'affaires (CA)

```
CA = TJM × jours × (1 + croissance)^(année - 1)
```

- **Paramètres :** `tjm`, `days`, `growthRate`, `annee`
- **Modifier :** ligne 118

### 1.2 Dépenses professionnelles (`depensesPro`)

```
depensesPro = Σ (chargeAmounts[id] × 12) pour chaque charge active
            + materielAnnuel / 3
```

- **Charges :** définies dans `lib/constants.ts` → `CHARGES_CATALOG`
- **Matériel :** amorti sur 3 ans (ligne 131)
- **Modifier :** lignes 125-131 ou `lib/constants.ts` pour ajouter des charges

### 1.3 Indemnités kilométriques (IK)

**Fichier :** `lib/projections.ts` (lignes 83-92) — fonction `getIK`

| Tranche km | Formule | Barème 4 CV | 5 CV | 6 CV | 7 CV+ |
|------------|---------|-------------|------|------|-------|
| 0 - 5 000 | km × a | 0.529 | 0.606 | 0.665 | 0.697 |
| 5 001 - 20 000 | km × b + 1 500 | 0.316 | 0.340 | 0.386 | 0.415 |
| > 20 000 | km × c | 0.370 | 0.407 | 0.455 | 0.486 |

- **Modifier :** lignes 84-91 (objet `b`)

### 1.4 CFE (Cotisation Foncière des Entreprises)

**Fichier :** `lib/constants.ts` (lignes 25-29)

| Taille ville | Montant annuel |
|---------------|----------------|
| Petite | 300 € |
| Moyenne | 550 € |
| Grande | 900 € |

- **Règle :** CFE = 0 € en année 1 (exonération création)
- **Modifier :** `lib/constants.ts` → `CFE_PAR_VILLE`

### 1.5 Seuil trimestre retraite

**Fichier :** `lib/constants.ts` (ligne 33)

- **Valeur :** 1 800 € (assimilé salarié) / 2 880 € (TNS)
- **Modifier :** `SEUIL_TRIMESTRE_RETRAITE`

---

## 2. Impôt sur le revenu (IR)

**Fichier :** `lib/projections.ts` (lignes 94-102) — fonction `computeIR`

Barème progressif 2026 (après abattement 10 %) :

| Tranche (par part) | Taux |
|--------------------|------|
| 0 - 11 294 € | 0 % |
| 11 294 - 28 797 € | 11 % |
| 28 797 - 82 341 € | 30 % |
| 82 341 - 177 106 € | 41 % |
| > 177 106 € | 45 % |

**Formule :** `base × 0.9 / parts` puis application des tranches.

- **Modifier :** lignes 95-101 (seuils et taux)

---

## 3. Calcul par statut (`calculateRegimes`)

**Fichier :** `lib/projections.ts` (lignes 152-228)

### 3.1 Micro-entreprise

**Lignes :** 176-183

| Élément | Formule |
|---------|---------|
| **Charges (fees)** | CFE uniquement |
| **Cotisations** | CA × 21,1 % (ou × 10,55 % si ACRE) |
| **Base avant IR** | CA - cotis - CFE |
| **IR** | Si prélèvement libératoire : CA × 2,2 % ; sinon : IR sur (CA × 66 % + revenus conjoint) |

- **Taux cotis :** ligne 177 (`0.211`, ACRE `0.5`)
- **Prélèvement libératoire :** ligne 182 (`0.022`)
- **Abattement BNC :** ligne 184 (`0.66` = 34 % d’abattement)

### 3.2 Portage salarial

**Lignes :** 184-192

| Élément | Formule |
|---------|---------|
| **Charges (fees)** | depensesPro + IK + commission (CA × fraisGestionPortage %) |
| **Base imposable** | CA - fees |
| **Cotisations** | base × 45 % (ou × 22,5 % si ACRE) |
| **Base avant IR** | base - cotis |
| **IR** | IR sur (beforeTax + loyer + revenus conjoint) |

- **Taux cotis :** ligne 188 (`0.45`, ACRE `0.5`)
- **Commission :** `ctx.fraisGestionPortage` (ligne 185)

### 3.3 EURL à l’IR

**Lignes :** 193-201

| Élément | Formule |
|---------|---------|
| **Charges (fees)** | depensesPro + IK + CFE |
| **Base imposable** | CA - fees |
| **Cotisations** | base × 40 % (ou × 10 % si ACRE) |
| **Base avant IR** | base - cotis |
| **IR** | IR sur (beforeTax + loyer + revenus conjoint) |

- **Taux cotis :** ligne 196 (`0.40`, ACRE `0.25`)

### 3.4 EURL à l’IS

**Lignes :** 201-212

| Élément | Formule |
|---------|---------|
| **Charges (fees)** | depensesPro + IK + CFE |
| **Résultat société** | CA - fees |
| **Base avant IR** | (CA - fees) / 1,45 (approximation charges sociales) |
| **Cotisations** | beforeTax × 45 % (ou × 11,25 % si ACRE) |
| **IS société** | max(0, résultat - beforeTax) × 25 % |
| **IR** | IR sur (beforeTax + loyer + revenus conjoint) |

- **Coefficient 1,45 :** ligne 203 (charges sociales sur rémunération)
- **Taux IS :** ligne 209 (`0.25`)
- **Note :** `remunerationDirigeantMensuelle` n’est pas encore utilisé dans le calcul.

### 3.5 SASU

**Lignes :** 213-223

| Élément | Formule |
|---------|---------|
| **Charges (fees)** | depensesPro + IK + CFE |
| **Résultat société** | CA - fees |
| **IS société** | base × 20 % |
| **Base avant IR** | base - IS |
| **IR** | beforeTax × 30 % (flat sur dividendes) |
| **Dividendes nets** | beforeTax × 70 % |

- **Taux IS :** ligne 215 (`0.20`)
- **Taux IR dividendes :** ligne 218 (`0.30`)
- **Note :** `repartitionRemuneration` n’est pas encore utilisé ; répartition fixe 0 % salaire / 100 % dividendes.

---

## 4. Parts fiscales

**Fichier :** `lib/projections.ts` (lignes 235-242) — fonction `computeTaxParts`

| Situation | Parts |
|-----------|-------|
| Célibataire | 1 |
| Couple | 2 |
| + 1 enfant | + 0,5 |
| + 2 enfants | + 1 |
| + 3 enfants | + 2 |
| + 4 enfants et plus | + (nb - 2) |

- **Modifier :** lignes 236-240

---

## 5. Plafonds Micro

**Fichier :** `lib/constants.ts` (lignes 34-36)

| Type | Plafond 2026 |
|------|--------------|
| BNC | 77 700 € |
| BIC | 188 700 € |

- **Modifier :** `PLAFOND_MICRO_BNC`, `PLAFOND_MICRO_BIC`

---

## 6. Catalogue des charges

**Fichier :** `lib/constants.ts` (lignes 14-23) — `CHARGES_CATALOG`

Chaque charge a : `id`, `name`, `amount` (montant mensuel par défaut).

Pour ajouter une charge :
1. Ajouter une entrée dans `CHARGES_CATALOG`
2. Les montants sont gérés via `chargeAmounts` dans `useSimulation`
3. Aucune modification dans `projections.ts` nécessaire

---

## 7. Comment mettre à jour les règles

### Taux de cotisations

- **Micro :** `lib/projections.ts` ligne 177
- **Portage :** ligne 188
- **EURL IR :** ligne 196
- **EURL IS :** lignes 204, 209
- **SASU :** lignes 215, 218

### Barème IR

- **Seuils et taux :** `lib/projections.ts` lignes 97-100

### Indemnités kilométriques

- **Barèmes :** `lib/projections.ts` lignes 84-91

### CFE

- **Montants :** `lib/constants.ts` lignes 25-29

### Plafonds Micro

- **Valeurs :** `lib/constants.ts` lignes 34-36

### Charges / dépenses

- **Catalogue :** `lib/constants.ts` lignes 14-23
- **Calcul dépenses :** `lib/projections.ts` lignes 125-131

---

## 8. Fichiers non utilisés (legacy)

- `lib/engine.ts` — ancien moteur, non utilisé
- `lib/calculations.ts` — ancien module, non utilisé

Le moteur actif est uniquement `lib/projections.ts`.
