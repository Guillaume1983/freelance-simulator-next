# Freelance Simulateur — guide pour Claude Code

Site Next.js (App Router) : comparateur et simulateurs de revenu net pour freelances / indépendants en France (portage, micro, EURL IR/IS, SASU). Production : https://www.freelance-simulateur.fr

## Commandes

```bash
npm run dev      # http://localhost:3000
npm run build    # vérifier avant de finir une tâche
npm run test     # Vitest
npm run lint     # ESLint
```

## Architecture (où chercher quoi)

| Zone | Rôle |
|------|------|
| `lib/projections.ts` | Moteur principal : projections 5 ans, IR, trimestres retraite |
| `lib/financial/` | Pipeline de calcul, lignes par statut (`lines/statuts/`), `rates.ts` |
| `lib/constants.ts` | Plafonds micro, CFE, portage, seuil retraite |
| `lib/financial/rates.ts` | PASS, barème IR, taux micro/portage/IS/PFU, TNS, IK |
| `context/SimulationContext.tsx` | État global de la simulation (comparateur / simulateur) |
| `components/comparateur/` | UI comparateur |
| `components/simulateur/` | UI simulateur par statut |
| `app/simulateur/[statut]/` | Pages SEO par statut (5 ans) |
| `app/simulateur/[statut]/[ca]/` | Paliers CA statiques (SEO) |
| `lib/seo/simulateurStatutContent.ts` | Titres, meta, H1, FAQ par statut (source unique SEO) |
| `lib/simulateur/paliers.ts` | Paliers CA, métadonnées paliers |
| `docs/REGLES_CALCUL.md` | Formules implémentées (référence technique) |
| `lib/faq.ts`, `lib/articles/` | Contenu éditorial |

## Règle critique — montants et taux

**Ne jamais inventer un montant, taux, plafond ou seuil fiscal** (code, texte SEO, FAQ, articles).

1. Lire `lib/constants.ts` et `lib/financial/rates.ts`
2. Réutiliser les constantes exportées (`PLAFOND_MICRO_BNC`, `RATES_2026`, etc.)
3. Dans le texte utilisateur : préférer « les plafonds en vigueur » ; si un chiffre est requis, le copier exactement depuis ces fichiers
4. Ne pas réutiliser des valeurs d’années précédentes

## Conventions de code

- **TypeScript**, React 19, Next.js 16, Tailwind 4
- **Français** pour tout texte visible (UI, SEO, erreurs utilisateur)
- **Diff minimal** : ne pas refactorer hors périmètre de la tâche
- **Pas de commit** sauf demande explicite de l’utilisateur
- **Pas de push** sauf demande explicite
- Ne pas committer `.env.local` ni secrets

## SEO

- Métadonnées statut : `lib/seo/simulateurStatutContent.ts` (éviter la dérive layout / contenu)
- Pages palier : `getPalierMetadataTitle` / `getPalierMetadataDescription` dans `lib/simulateur/paliers.ts`
- Sitemap : `app/sitemap.ts`
- JSON-LD : `lib/seo/jsonLd.ts`

## Variables d’environnement (`.env.local`, non versionné)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — auth
- `SUPABASE_SERVICE_ROLE_KEY` — suppression compte (secret, pas la clé anon)
- `RESEND_API_KEY` — e-mails contact / confirmation suppression
- Clés OpenAI / chat si utilisées par `/api/chat`

Sans `.env.local`, le site tourne en local mais auth / e-mail / chat peuvent être limités.

## Workflow recommandé

1. Comprendre la tâche et lire les fichiers concernés avant de modifier
2. Implémenter avec le minimum de fichiers touchés
3. `npm run build` et `npm run test` si la zone est couverte par des tests
4. Résumer les changements en français

## Tests existants

- `tests/seo/` — canonical, métadonnées paliers
- Autres tests Vitest selon les modules modifiés
