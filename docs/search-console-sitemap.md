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
