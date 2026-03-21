import type { Article } from './articleTypes';

export type { Article } from './articleTypes';

import { PORTAGE_ARTICLE } from './articles/portageArticle';
import { MICRO_ARTICLE } from './articles/microArticle';
import { EURL_IR_ARTICLE } from './articles/eurlIrArticle';
import { EURL_IS_ARTICLE } from './articles/eurlIsArticle';
import { SASU_ARTICLE } from './articles/sasuArticle';
import { LEGACY_CHOISIR_ARTICLE } from './articles/legacyChoisirStatutArticle';
import { LEGACY_IK_ARTICLE } from './articles/legacyIkArticle';
import { LEGACY_REMUNERATION_ARTICLE } from './articles/legacyRemunerationArticle';
import { LEGACY_TRESORERIE_ARTICLE } from './articles/legacyTresorerieArticle';

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** Articles historiques (contenu long, SEO) + guides par statut */
const LEGACY_ARTICLES: Article[] = [
  LEGACY_CHOISIR_ARTICLE,
  LEGACY_IK_ARTICLE,
  LEGACY_REMUNERATION_ARTICLE,
  LEGACY_TRESORERIE_ARTICLE,
];

const STATUT_ARTICLES: Article[] = [
  PORTAGE_ARTICLE,
  MICRO_ARTICLE,
  EURL_IR_ARTICLE,
  EURL_IS_ARTICLE,
  SASU_ARTICLE,
];

/** Plus récent en premier (date décroissante) */
export const ARTICLES: Article[] = [...STATUT_ARTICLES, ...LEGACY_ARTICLES].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
