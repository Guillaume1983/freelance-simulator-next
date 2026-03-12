# Soumettre le sitemap dans Google Search Console

## 1. Accéder à Search Console

- Va sur **https://search.google.com/search-console**
- Connecte-toi avec le compte Google que tu veux associer au site.

## 2. Ajouter ou vérifier la propriété du site

- Si le site **n’est pas encore ajouté** : clique sur **« Ajouter une propriété »**.
- Choisis **« Préfixe d’URL »** et saisis : `https://freelance-simulateur.fr`
- Valide la propriété avec l’une des méthodes proposées :
  - **Fichier HTML** : télécharge le fichier fourni par Google et dépose-le à la racine de ton site (dossier `public/`), puis clique sur « Vérifier ».
  - **Balise HTML** : ajoute la balise meta dans le `<head>` de ta page d’accueil (par ex. dans `app/layout.tsx` via `metadata.verification` si tu utilises Next).
  - **DNS** (recommandé pour un domaine en propre) : ajoute l’enregistrement TXT proposé par Google dans la zone DNS de ton domaine chez OVH, puis clique sur « Vérifier ».

## 3. Soumettre le sitemap

- Une fois la propriété **vérifiée**, dans le menu de gauche : **« Sitemaps »** (ou « Plan du site »).
- Dans le champ **« Ajouter un sitemap »**, saisis :  
  **`sitemap.xml`**  
  (ou l’URL complète : `https://freelance-simulateur.fr/sitemap.xml` selon l’interface).
- Clique sur **« Envoyer »**.

Google va alors explorer les URLs listées dans ton sitemap. L’indexation peut prendre quelques heures à quelques jours.

## 4. (Optionnel) Demander l’indexation de pages clés

- Dans le menu de gauche : **« Inspection d’URL »**.
- Colle une URL (ex. `https://freelance-simulateur.fr/` ou `https://freelance-simulateur.fr/comparateur`).
- Si la page est connue, clique sur **« Demander une indexation »** pour prioriser son passage.

Tu peux le faire pour : `/`, `/comparateur`, `/simulateur`, `/reglages`, `/outils`.

## 5. Suivre les résultats

- Après quelques jours, consulte **« Performance »** pour voir les requêtes, impressions, clics et positions moyennes.
- Dans **« Couverture »** ou **« Pages »**, vérifie qu’il n’y a pas d’erreurs d’indexation.

---

## Dépannage : « Impossible de récupérer le sitemap »

Si Search Console affiche cette erreur alors que l’URL du sitemap s’ouvre bien dans le navigateur, vérifier les points suivants.

### 1. Propriété et URL du sitemap

- **Préfixe d’URL** : la propriété doit correspondre **exactement** à l’URL utilisée pour le sitemap.
  - Si la propriété est **`https://freelance-simulateur.fr`** (sans www), soumets : **`sitemap.xml`** ou **`https://freelance-simulateur.fr/sitemap.xml`**.
  - Si la propriété est **`https://www.freelance-simulateur.fr`**, le sitemap doit être accessible à **`https://www.freelance-simulateur.fr/sitemap.xml`**. Si ton site redirige tout le www vers la version sans www, ajoute une propriété **Préfixe d’URL** pour **`https://freelance-simulateur.fr`** (sans www) et soumets le sitemap dans cette propriété.
- Ne mélange pas www et non-www : utilise la même base que ta propriété.

### 2. Vérifier ce que « voit » Google

- Dans Search Console : **Paramètres** → **Test des robots** (ou **Outils** selon l’interface), ou **Sitemaps** → sur la ligne du sitemap, ouvre le rapport et regarde le message d’erreur détaillé.
- **Inspection d’URL** : colle **`https://freelance-simulateur.fr/sitemap.xml`** et lance l’inspection. Regarde si Google reçoit un **200** et du **XML** (et non une page HTML ou une redirection).

### 3. Tester comme un bot (en ligne de commande)

Sur ton PC, vérifie que le sitemap renvoie bien du XML et un code 200 :

```bash
curl -I "https://freelance-simulateur.fr/sitemap.xml"
```

Puis simule le User-Agent de Googlebot :

```bash
curl -I -A "Googlebot" "https://freelance-simulateur.fr/sitemap.xml"
```

- Le **code HTTP** doit être **200** (pas 301/302 si tu as soumis l’URL finale, pas 403/404/500).
- **Content-Type** doit être du type **`application/xml`** ou **`text/xml`** (pas `text/html`).

Si tu vois une redirection (301/302), utilise **l’URL finale** (après redirection) dans Search Console, ou corrige la propriété (www vs non-www) pour qu’elle corresponde à l’URL finale.

### 4. robots.txt

- Dans Search Console : **Paramètres** → **Test des robots** (ou **robots.txt** dans le rapport), vérifie que **Googlebot** est **autorisé** pour l’URL **`https://freelance-simulateur.fr/sitemap.xml`**.
- Le fichier **`app/robots.ts`** du projet autorise déjà **`/`** et référence le sitemap ; il ne doit pas contenir de règle qui interdirait **/sitemap.xml**.

### 5. Hébergeur et cache

- Si tu utilises un **CDN ou un cache** (Cloudflare, Vercel, etc.) : assure-toi qu’aucune règle ne bloque les requêtes dont le User-Agent est **Googlebot** et que **/sitemap.xml** n’est pas servi en HTML (page d’erreur ou page d’accueil).
- Après une mise en ligne ou un changement, attendre **quelques minutes** puis ressoumettre le sitemap ; parfois il faut **24–48 h** pour que l’erreur disparaisse.

### 6. Ressoumettre le sitemap

- Dans **Sitemaps**, supprime le sitemap en erreur (s’il existe une option pour le retirer).
- Ressaisis **`sitemap.xml`** (ou l’URL complète conforme à ta propriété) et clique sur **Envoyer**.
- Vérifie à nouveau après 24–48 h.
