# Variante A — Bande de croissance annuelle

## Description
La bande de croissance annuelle est positionnée **sous le bandeau de navigation par années** (`YearNavStrip`), créant une zone distincte mais liée à la navigation temporelle. Cette approche met l'accent sur le lien contextuel entre le réglage de croissance et la sélection d'année.

---

## Structure de mise en page

### Mobile & Tablette (< 1024px)
```
┌─────────────────────────────────────────────┐
│      [An 1] [An 2] [An 3] [An 4] [An 5]     │  ← YearNavStrip
├─────────────────────────────────────────────┤
│  📈 Croissance CA vs An N : [  5 ] %  0–50% │  ← AnnualGrowthBand
├─────────────────────────────────────────────┤
│  [Je me lance en STATUT]                    │
├─────────────────────────────────────────────┤
│                                             │
│  Année 2                                    │
│  3 450 € / mois net                         │
│         ...                                 │
└─────────────────────────────────────────────┘
```

### Desktop (≥ 1024px)
```
┌────────────────────────────────┬──────────────────┐
│  [An 1][An 2][An 3][An 4][An 5]│ [Je me lance en]  │
├────────────────────────────────┼──────────────────┤
│  📈 Croissance CA vs An N : [5]%│    0–50%          │
├────────────────────────────────┴──────────────────┤
│                                                   │
│  Année 2        ╷  Revenu annuel + histogramme   │
│  3 450€/mois    ║                                 │
│       ...       ║                                 │
└───────────────────────────────────────────────────┘
```

---

## Style & Hiérarchie visuelle

### Conteneur (bande)
- **Fond** : Dégradé subtil `from-slate-50 to-slate-50/50` / dark `from-slate-800/60 to-slate-800/40`
- **Bordure** : `border-slate-200/60` (light) / `border-slate-700/60` (dark)
- **Padding** : `px-4 md:px-6 py-3.5`
- **Rayon** : `rounded-xl`
- **État normal** : Hover léger sur bordure

### Icône
- **Taille** : `w-5 h-5` avec gradient émeraude/teal
- **Symbole** : `TrendingUp` (Lucide) pour signifier la croissance

### Label
- **Texte** : "Croissance CA"
- **Taille** : `text-sm font-semibold`
- **Couleur** : `text-slate-700` / dark `text-slate-200`
- **Lien** : `htmlFor="growth-input-year-{yearIndex}"`

### Champ d'entrée
- **Largeur** : `w-14` (adapté pour 2–3 chiffres)
- **Fond** : Blanc / dark `slate-900/50`
- **Bordure** : `border-slate-200` / dark `border-slate-700`
- **Ombre** : `shadow-sm`
- **Padding** : `px-3 py-2`
- **Rayon** : `rounded-lg`
- **Focus** : Ring émeraude `focus:ring-emerald-400/50` / dark `focus:ring-emerald-500/40`

### Suffixe (%)
- **Texte** : "%" en gras
- **Couleur** : `text-slate-600` / dark `text-slate-300`

### État erreur (hors plage)
- **Bande** : Ring rouge `ring-1 ring-red-300/50` / dark `ring-red-700/30`
- **Input** : Texte rouge `text-red-700` / dark `text-red-400`
- **Focus** : Ring rouge `focus:ring-red-400/50` / dark `focus:ring-red-500/40`
- **Message** : "0–50 %" en texte rouge (visible sur mobile)

---

## Accessibilité (WCAG 2.1 AA)

### Étiquettage
- **Label visible** associé via `htmlFor="growth-input-year-{yearIndex}"`
- **Aria-label redondant** : `"Taux de croissance du chiffre d'affaires pour l'année {yearIndex+1}, par rapport à l'année {yearIndex}"`

### Description
- **Aria-describedby** : Pointe vers `growth-hint-{yearIndex}`
- **Texte d'aide** : "Valeur entre 0 et 50 %"

### Validation
- **Aria-invalid** : `true` si hors plage (0–50 %)
- **Feedback en temps réel** : L'erreur s'affiche immédiatement lors de la saisie

### Interaction au clavier
- Navigation tabulation standard (`Tab`, `Shift+Tab`)
- Arrows up/down pour ajuster la valeur (`min=0`, `max=50`, `step=1`)
- `Escape` non nécessaire (champ simple)

### Responsivité tactile
- **inputMode="numeric"** pour clavier mobile approprié
- **Min-height hauteur cliquable** : Inherited from parent flex layout (hauteur ≥ 36px)

---

## Comportements & États

### État normal (Année 2–5)
```tsx
// Valeur entre 0 et 50 %
<AnnualGrowthBand
  yearIndex={2}
  growthRate={5}
  onGrowthChange={(value) => updateGrowthYear(2, value)}
/>
```
- Affichage : "Croissance CA vs An 2 : [5] %"
- Couleur input : Slate normal
- Ring focus : Émeraude

### Année 1 (pas de croissance)
```tsx
// Retourne null pour l'Année 1
if (yearIndex === 0) return null;
```
- La bande n'est pas rendue
- L'utilisateur ne voit que le titre "Année 1" et les résultats

### État erreur (hors plage)
```tsx
// Valeur > 50 % ou < 0 %
<AnnualGrowthBand
  yearIndex={3}
  growthRate={75}
  onGrowthChange={(value) => updateGrowthYear(3, value)}
/>
```
- Bande : Ring rouge `ring-1 ring-red-300/50`
- Input : Texte rouge
- Message d'erreur visible : "(0–50 %)"
- Validation : `Math.min(50, Math.max(0, Math.round(next)))`

### Focus & Hover
- **Hover bande** (normal) : Bordure plus claire `hover:border-slate-300/80`
- **Focus input** : Ring 2px `focus:ring-emerald-400/50`
- **Focus + erreur** : Ring 2px `focus:ring-red-400/50`

### Mode sombre
- **Bande** : `from-slate-800/60 to-slate-800/40`
- **Input** : `dark:bg-slate-900/50`
- **Bordure** : `dark:border-slate-700`
- **Texte** : `dark:text-slate-200`
- **Ring** : `dark:focus:ring-emerald-500/40` (normal) ou `dark:focus:ring-red-500/40` (erreur)

---

## Changement d'année

### Trigger
- Clic sur les boutons chevron gauche/droit de la carte
- Clic sur une vignette année dans `YearNavStrip`

### Effet
1. **safeYear** passe de 1 à 2 (ou 2→3, etc.)
2. **growthByYear[safeYear]** est relu depuis l'état (ex. `growthByYear[2]`)
3. Bande se met à jour avec la nouvelle valeur de croissance
4. L'input retrouve focus automatiquement sur desktop (si `window.innerWidth >= 768`)

---

## Intégration dans le composant parent

### Props du composant
```tsx
interface AnnualGrowthBandProps {
  yearIndex: number;              // 0–4 (Année 1–5)
  growthRate: number | undefined; // Valeur actuelle (0–50 %)
  onGrowthChange: (value: number) => void; // Callback: updateGrowthYear()
}
```

### Placement
```tsx
// Mobile & Tablette (< 1024px)
<div className="flex flex-col md:flex-row md:items-stretch gap-4 xl:hidden">
  <YearNavStrip {...} />
  <Link>{/* Je me lance en... */}</Link>
</div>
<AnnualGrowthBand {...} />  // ← ICI

// Desktop (≥ 1024px)
<div className="grid xl:grid-cols-2">
  <YearNavStrip {...} />
  <Link>{/* Je me lance en... */}</Link>
  <AnnualGrowthBand {...} />  // ← ICI dans xl:row-start-2 xl:col-start-1
  <Carte {...} />
</div>
```

---

## Responsive & Breakpoints

| Breakpoint | Comportement |
|------------|-------------|
| Mobile (< 640px) | Stack vertical, input 44px min-height, gap-3 |
| Tablette (640–1023px) | Flex row, gap-4, input visible full width |
| Desktop (≥ 1024px) | Grille CSS, full width, input à droite |

### Padding & Spacing
- **px** : `px-4` (mobile) → `md:px-6` (desktop)
- **py** : `py-3.5` (constant)
- **gap** : `gap-3` (col) → `sm:gap-4` (row)

---

## Validation & Logique

### Normalisation des valeurs
```typescript
const updateGrowthYear = useCallback((index: number, next: number) => {
  setGrowthByYear((prev) =>
    prev.map((v, i) => 
      i === index 
        ? Math.min(50, Math.max(0, Math.round(next))) // Clamp 0–50
        : v
    ),
  );
}, []);
```

### Détection d'erreur
```typescript
const isInvalid = currentValue < 0 || currentValue > 50;
```

### Focus automatique (desktop)
- **Déclenché** : Changement d'année ET `window.innerWidth >= 768`
- **Action** : `inputRef.current?.focus()`
- **Raison** : Améliore l'UX en positionnant le curseur sur le champ mis à jour

---

## Conclusion

La **Variante A** positionne le contrôle de croissance dans une bande discrète mais découvrable, directement sous la navigation par années. Cette approche :

✅ **Sépare** le contrôle du header (titre « Année N » reste dominant)  
✅ **Lie** explicitement la croissance à la navigation temporelle  
✅ **Hiérarchise** sans encombrement (bande secondaire, pas de "cadre dans le cadre")  
✅ **Accessible** (labels, ARIA, validation claire)  
✅ **Responsive** (mobile → desktop sans refonte majeure)  
✅ **Pro/Finance** (design subtil, gradient léger, palette slate/émeraude)
