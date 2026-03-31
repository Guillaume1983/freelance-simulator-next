# Audit financier — simulateur freelance

*Dernière passe : formules affichées, chiffres et règles comptables.*

---

## Corrections appliquées

### 1. ACRE EURL IS
- **Problème** : `eurlIs.acre` était à `0.25` (75 % de réduction des cotisations).
- **Règle** : ACRE = exonération d’environ **50 %** des cotisations la 1ʳᵉ année (hors CSG/CRDS selon les cas).
- **Correction** : `acre: 0.5` dans `lib/financial/rates.ts` pour appliquer une réduction de 50 %.

### 2. Formule « Rémunération nette (avant IR) » — Micro
- **Problème** : La formule affichée ne faisait pas apparaître la **CFE** (CA − cotis uniquement).
- **Correction** : Dans `detailText.ts`, ajout de « − CFE » pour la Micro lorsque `micro_cfe` > 0.  
  + Formule explicite sur la ligne `micro_remuneration` : `Revenu avant IR = CA − cotisations − CFE`.

### 3. Formule fallback SASU (beforeTax)
- **Problème** : Le fallback affichait « (CA − fees) × 80 % (IS 20 %) », qui correspond au **résultat après IS**, pas aux dividendes bruts.
- **Correction** : Remplacement par un libellé explicite invitant à consulter le détail de la ligne (dividendes bruts = résultat après IS × % distribué).

### 4. Cotisations Micro — libellé fallback
- **Problème** : Le texte de détail des cotisations indiquait toujours « 21,1 % » (BNC), y compris pour BIC services (21,2 %) et BIC commerce (12,3 %).
- **Correction** : Utilisation du taux selon `typeActiviteMicro` (BNC / BIC_SERVICE / BIC_COMMERCE) dans le fallback.

---

## Cohérence générale vérifiée

| Zone | Statut |
|------|--------|
| **Pipeline** | Charges = dépenses pro + IK + loyer + avantages (Portage sans loyer). Commission portage bien déduite de la base. |
| **Trésorerie EURL IS / SASU** | `resultatSociete` déduit bien les avantages ; `cashInCompany` cohérent. |
| **PFU SASU** | Un seul impact cash (dans dividendes nets) ; ligne `sasu_ir` en `cashImpact: 0` pour éviter double déduction. |
| **TNS EURL IR** | Bénéfice = CA − (charges + CFE) ; cotis déductibles / non déductibles et formules détaillées cohérentes. |
| **Portage** | Pas de loyer dans les charges ; commission dans les formules (base = CA − charges − commission). |
| **Net final** | Somme des `cashImpact` (ligne net_final) ; optimisations (IK, loyer, avantages) bien en plus. |

---

## Points de vigilance (sans modification)

### Barème IR
- Les seuils dans `rates.ts` (11 294 €, 28 797 €, 82 341 €, 177 106 €) correspondent au barème indexé (ordre de grandeur 2024/2025). À **revalider** chaque année (loi de finances) pour rester à jour.

### ACRE dégressive
- En réalité, l’ACRE peut être dégressive au‑delà de 75 % du PASS (ex. 35 325 € en 2025). Le simulateur retient une réduction fixe (50 %) pour la 1ʳᵉ année ; c’est une simplification volontaire.

### Plafonds micro
- `PLAFOND_MICRO_BNC` (83 600 €) et `PLAFOND_MICRO_BIC` (203 100 €) : vérifier chaque année (souvent publiés au JO / impots.gouv). Mis à jour pour 2026-2028 (URSSAF autoentrepreneur, 20/02/2026).

### Libellés EURL IR et SASU (corrigés)
- **EURL IR** : la ligne affiche désormais « Revenu imposable (avant IR) » (bénéfice − cotis déductibles ; le cash avant IR est plus bas à cause de la CSG non déductible + CRDS).
- **SASU** : la ligne affiche désormais « Dividendes bruts (avant PFU) » pour la valeur avant application du PFU 30 %.

### Barème IK
- Les coefficients 4–7 cv dans `rates.ts` sont du type barème fiscal annuel. À mettre à jour avec le barème officiel (impots.gouv / service-public) si tu vises le centime près.

### PASS
- `PASS = 47_100` (commentaire « 2025 ») : à mettre à jour selon la valeur officielle (URSSAF / Légifrance) pour l’année simulée.

---

## Validation des calculs avec des outils officiels

Vous pouvez recouper les montants du simulateur avec les outils suivants (sources officielles ou agrégateurs reconnus).

### Impôt sur le revenu (IR)
- **Simulateur officiel impots.gouv.fr**  
  [impots.gouv.fr/particulier/je-calcule-mes-impots](https://impots.gouv.fr/particulier/je-calcule-mes-impots)  
  Modèle simplifié (revenus courants) ou **modèle complet** (revenus d’activité libérale, BNC, etc.). Permet de vérifier l’IR à partir du revenu imposable et du nombre de parts.
- **Simulateur détaillé (barème 2026 sur revenus 2025)**  
  [simulateur-ir-ifi.impots.gouv.fr](https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/complet/index.htm)  
  Pour une estimation au plus près du barème officiel (tranches, abattement 10 %, parts).

**À faire** : entrer le même revenu imposable et les mêmes parts que dans notre simulateur (ex. EURL IR : irBase + loyer + revenus du conjoint) et comparer l’IR affiché.

### Cotisations sociales (TNS, micro, portage)
- **Simulateur revenus indépendants (URSSAF / Mon-Entreprise)**  
  [mon-entreprise.urssaf.fr/simulateurs/indépendant](https://mon-entreprise.urssaf.fr/simulateurs/ind%C3%A9pendant)  
  Revenus 2025 : CA, charges, rémunération nette après cotisations, revenu après impôt. Adapté aux TNS (EURL IR, professions libérales) et à la micro.
- **Simulateur auto-entrepreneur**  
  [urssaf.fr – simulateurs – cotisations auto-entrepreneur](https://www.urssaf.fr/accueil/outils-documentation/simulateurs/cotisations-auto-entrepeneur.html)  
  Pour comparer les cotisations Micro (taux BNC / BIC, ACRE si applicable).

**À faire** : saisir un CA et des charges pro identiques, comparer cotisations et net après cotisations. Les montants peuvent différer légèrement (tranches TNS, options ACRE, plafonds annuels).

### Dividendes et PFU (SASU)
- L’IR / PFU sur dividendes est inclus dans le simulateur IR impots.gouv (modèle complet, catégorie « revenus de capitaux mobiliers »). Saisir les dividendes bruts et vérifier le prélèvement forfaitaire (30 % : 12,8 % IR + 17,2 % prélèvements sociaux).

### En résumé
| Élément à valider | Outil recommandé |
|-------------------|------------------|
| IR (barème, parts) | impots.gouv.fr – Je calcule mes impôts (modèle complet) |
| Cotisations TNS / micro | mon-entreprise.urssaf.fr – Simulateur indépendant |
| Cotisations auto-entrepreneur | urssaf.fr – Simulateur auto-entrepreneur |
| PFU sur dividendes | impots.gouv.fr (modèle complet, RCM) |

Les résultats restent **indicatifs** ; ils ne se substituent pas aux décomptes réels (URSSAF, avis d’imposition). Utiles pour vérifier l’ordre de grandeur et la cohérence des formules.

---

## Résumé

- **Corrections** : ACRE EURL IS, formules Micro avec CFE, fallback SASU, taux cotis Micro, **libellés EURL IR** (« Revenu imposable (avant IR) ») et **SASU** (« Dividendes bruts (avant PFU) ») dans le tableau comparatif et les projections.
- La **logique des calculs** (bases, cotisations, IS, IR, net, trésorerie, optimisations) est **cohérente** avec les règles modélisées.
- **Validation** : la section « Validation des calculs avec des outils officiels » ci‑dessus indique comment recouper les montants avec impots.gouv.fr (IR) et mon-entreprise.urssaf.fr / urssaf.fr (cotisations).
- Les **points de vigilance** restants concernent la **mise à jour annuelle** des barèmes et plafonds (IR, micro, PASS, IK).
