This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Suppression de compte (RGPD)

La route `POST /api/account/delete` exige la variable d’environnement **`SUPABASE_SERVICE_ROLE_KEY`** : c’est la clé **secrète** `service_role` (Dashboard Supabase → **Settings** → **API** → *service_role* **secret**). Ce n’est **pas** la clé `anon` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Si tu mets la clé anon par erreur, l’API renvoie une erreur du type `not_admin` / 403. À ajouter dans `.env.local` et sur l’hébergeur (Vercel, etc.), **sans** préfixe `NEXT_PUBLIC_`.

Après une suppression réussie, un **e-mail de confirmation** est envoyé à l’utilisateur via **Resend** (même clé que le formulaire de contact : **`RESEND_API_KEY`**). Si la clé est absente, la suppression reste effectuée mais aucun mail n’est parti (voir les logs serveur).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
