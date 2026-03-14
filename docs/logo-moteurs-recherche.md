# Changer le logo vu par les moteurs de recherche

Ce que les moteurs (et les utilisateurs) utilisent comme « logo » vient de plusieurs endroits. Voici quoi modifier.

---

## Si tu as reçu une planche (une seule image avec tous les assets)

Découpe chaque zone dans un éditeur (Photopea, GIMP, Figma, etc.) et exporte dans **`public/`** avec les noms et tailles ci‑dessous :

| Zone sur la planche | Enregistrer sous | Dimensions cible |
|---------------------|------------------|------------------|
| Petit icône (bar chart bleu) | `public/favicon.png` | 32×32 px |
| Grand carré avec logo + « freelance-simulateur.fr » (fond transparent) | `public/logo.png` | 512×512 px |
| Carré fond bleu/violet avec logo blanc | `public/apple-touch-icon.png` | 180×180 px |
| Rectangle « Freelance Simulateur » + sous-titre (réseaux sociaux) | `public/og-image.png` | 1200×630 px |

### Avec GIMP

1. **Ouvrir la planche** : Fichier → Ouvrir → sélectionne ton image.
2. **Pour chaque zone** (favicon, logo, apple-touch-icon, og-image) :
   - Choisir l’outil **Sélection rectangulaire** (R).
   - Sélectionner uniquement la zone voulue (sans les textes de légende si possible).
   - **Image → Recadrer vers la sélection** (ou Ctrl+Shift+R) pour ne garder que la zone.
   - **Image → Échelle et taille de l’image** : saisir la largeur et la hauteur cible (voir le tableau ci‑dessus), valider.
   - **Fichier → Exporter sous** : aller dans le dossier **`public/`** du projet et enregistrer avec le **nom exact** du fichier (ex. `favicon.png`, `logo.png`, etc.).
   - Dans la boîte d’export PNG, valider. Puis **Fichier → Rouvrir** la planche (ou Annuler les modifications) pour passer à la zone suivante.
3. **Astuce** : pour ne pas rouvrir la planche à chaque fois, utilise **Édition → Annuler** (Ctrl+Z) après chaque export pour revenir à la planche complète, ou travaille sur une copie (Fichier → Créer une copie).

Une fois les 4 fichiers dans **`public/`**, redéploie le site : le layout les utilise déjà.

---

## 1. Favicon (onglet du navigateur et parfois dans les résultats Google)

- **Fichier** : dépose **`favicon.png`** dans **`public/`**.
- **Taille** : 32×32 ou 48×48 px.
- Le layout référence déjà ce fichier via `metadata.icons.icon`. Dès que tu remplaces `public/favicon.png`, le nouvel icône est utilisé.

---

## 2. Logo « marque » pour Google (schéma et résultats)

- **Fichier** : dépose **`logo.png`** (ou `.jpg`) dans **`public/`**.
- **Recommandé** : image carrée, au moins **112×112 px** (idéal **512×512**), fond transparent ou uni.
- Ce logo est utilisé dans le **JSON-LD** (schéma `WebApplication`) via la constante `LOGO_URL` dans **`app/layout.tsx`**. Si tu utilises un autre nom de fichier (ex. `logo-marque.png`), modifie cette constante :

  ```ts
  const LOGO_URL = `${SITE_URL}/logo-marque.png`;
  ```

Google peut s’en servir pour la marque à côté des résultats ou dans les connaissances. La mise à jour peut prendre du temps (jours/semaines).

---

## 3. Icône Apple (appareils iOS / « ajouter à l’écran d’accueil »)

- **Fichier** : **`public/apple-touch-icon.png`**.
- **Taille** : 180×180 px.
- Le layout le référence déjà avec `metadata.icons.apple`. Remplacer le fichier suffit.

---

## 4. Image de partage (réseaux sociaux)

- C’est **`public/og-image.png`** (1200×630 px), utilisé pour Open Graph et Twitter, pas pour le « logo » des moteurs. Pour changer l’image vue lors du partage d’un lien, remplace ce fichier (voir métadonnées dans `app/layout.tsx`).

---

## Récap des fichiers dans `public/`

| Fichier               | Rôle principal                          |
|-----------------------|------------------------------------------|
| `favicon.png`         | Icône onglet navigateur / petit logo SEO |
| `logo.png`            | Logo marque (schéma + éventuel logo Google) |
| `apple-touch-icon.png`| Icône « ajouter à l’accueil » (iOS)      |
| `og-image.png`        | Image de partage (réseaux sociaux)       |

Après avoir ajouté ou remplacé ces fichiers, redéploie le site. Pour le logo dans les résultats Google, il n’y a pas de mise à jour manuelle : Google met à jour quand il repasse sur le site.
