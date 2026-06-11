export type NiveauExp = "junior" | "confirme" | "senior";
export type RegionTjm = "idf" | "metropoles" | "autres";

export const NIVEAUX: NiveauExp[] = ["junior", "confirme", "senior"];
export const REGIONS: RegionTjm[] = ["idf", "metropoles", "autres"];

export const NIVEAU_LABELS: Record<NiveauExp, { short: string; full: string }> = {
  junior:   { short: "Junior",   full: "Junior (0 – 3 ans)" },
  confirme: { short: "Confirmé", full: "Confirmé (3 – 7 ans)" },
  senior:   { short: "Senior",   full: "Senior (7 ans et +)" },
};

export const REGION_LABELS: Record<RegionTjm, string> = {
  idf:        "Île-de-France",
  metropoles: "Grandes métropoles",
  autres:     "Autres régions",
};

export type TjmRange = { min: number; median: number; max: number };

export type MetierBarometre = {
  id: string;
  label: string;
  categorie: string;
  niveaux: Record<NiveauExp, Record<RegionTjm, TjmRange>>;
};

function r(min: number, median: number, max: number): TjmRange {
  return { min, median, max };
}

export const METIERS_BAROMETRE: MetierBarometre[] = [
  {
    id: "dev-frontend",
    label: "Dev web / frontend",
    categorie: "Tech",
    niveaux: {
      junior:   { idf: r(350, 420, 500), metropoles: r(300, 360, 450), autres: r(280, 330, 400) },
      confirme: { idf: r(520, 620, 750), metropoles: r(450, 530, 650), autres: r(400, 470, 580) },
      senior:   { idf: r(700, 830, 1000), metropoles: r(600, 720, 900), autres: r(550, 650, 800) },
    },
  },
  {
    id: "dev-backend",
    label: "Dev backend / fullstack",
    categorie: "Tech",
    niveaux: {
      junior:   { idf: r(370, 440, 530), metropoles: r(320, 380, 470), autres: r(290, 340, 420) },
      confirme: { idf: r(550, 660, 800), metropoles: r(470, 560, 680), autres: r(420, 500, 610) },
      senior:   { idf: r(750, 880, 1050), metropoles: r(640, 760, 920), autres: r(580, 690, 840) },
    },
  },
  {
    id: "data-ia",
    label: "Data / IA / Machine Learning",
    categorie: "Tech",
    niveaux: {
      junior:   { idf: r(420, 500, 600), metropoles: r(360, 430, 520), autres: r(320, 380, 470) },
      confirme: { idf: r(620, 740, 900), metropoles: r(530, 630, 780), autres: r(470, 560, 700) },
      senior:   { idf: r(870, 1040, 1250), metropoles: r(740, 890, 1080), autres: r(660, 800, 970) },
    },
  },
  {
    id: "devops",
    label: "DevOps / Cloud / SRE",
    categorie: "Tech",
    niveaux: {
      junior:   { idf: r(420, 500, 600), metropoles: r(360, 430, 520), autres: r(320, 380, 470) },
      confirme: { idf: r(600, 720, 880), metropoles: r(510, 610, 750), autres: r(450, 550, 680) },
      senior:   { idf: r(820, 960, 1150), metropoles: r(700, 830, 1000), autres: r(620, 740, 900) },
    },
  },
  {
    id: "cybersec",
    label: "Cybersécurité",
    categorie: "Tech",
    niveaux: {
      junior:   { idf: r(450, 540, 650), metropoles: r(380, 460, 560), autres: r(340, 410, 500) },
      confirme: { idf: r(680, 810, 980), metropoles: r(580, 690, 840), autres: r(510, 620, 750) },
      senior:   { idf: r(950, 1120, 1350), metropoles: r(810, 960, 1160), autres: r(720, 860, 1040) },
    },
  },
  {
    id: "design",
    label: "Design UX/UI",
    categorie: "Produit & Design",
    niveaux: {
      junior:   { idf: r(300, 360, 450), metropoles: r(260, 310, 390), autres: r(230, 280, 350) },
      confirme: { idf: r(460, 560, 690), metropoles: r(390, 470, 590), autres: r(350, 420, 530) },
      senior:   { idf: r(670, 800, 980), metropoles: r(570, 690, 850), autres: r(510, 620, 760) },
    },
  },
  {
    id: "product",
    label: "Product Management",
    categorie: "Produit & Design",
    niveaux: {
      junior:   { idf: r(380, 460, 560), metropoles: r(330, 390, 480), autres: r(290, 350, 430) },
      confirme: { idf: r(580, 700, 850), metropoles: r(490, 590, 720), autres: r(440, 530, 650) },
      senior:   { idf: r(820, 960, 1150), metropoles: r(700, 830, 1000), autres: r(620, 740, 900) },
    },
  },
  {
    id: "conseil",
    label: "Conseil en stratégie / transformation",
    categorie: "Conseil & Management",
    niveaux: {
      junior:   { idf: r(520, 620, 750), metropoles: r(440, 530, 640), autres: r(390, 470, 570) },
      confirme: { idf: r(780, 930, 1120), metropoles: r(660, 790, 960), autres: r(590, 710, 860) },
      senior:   { idf: r(1100, 1330, 1650), metropoles: r(940, 1150, 1430), autres: r(840, 1030, 1280) },
    },
  },
  {
    id: "marketing",
    label: "Marketing digital / Growth",
    categorie: "Marketing & Communication",
    niveaux: {
      junior:   { idf: r(280, 340, 430), metropoles: r(240, 290, 370), autres: r(210, 260, 330) },
      confirme: { idf: r(420, 520, 660), metropoles: r(360, 440, 560), autres: r(320, 390, 500) },
      senior:   { idf: r(640, 780, 970), metropoles: r(540, 670, 840), autres: r(480, 600, 750) },
    },
  },
  {
    id: "finance",
    label: "Finance / Contrôle de gestion / DAF",
    categorie: "Finance, Juridique & RH",
    niveaux: {
      junior:   { idf: r(400, 480, 580), metropoles: r(340, 410, 500), autres: r(300, 360, 450) },
      confirme: { idf: r(630, 750, 920), metropoles: r(540, 640, 790), autres: r(480, 570, 710) },
      senior:   { idf: r(950, 1160, 1450), metropoles: r(810, 1000, 1250), autres: r(720, 890, 1120) },
    },
  },
  {
    id: "juridique",
    label: "Juridique / Compliance",
    categorie: "Finance, Juridique & RH",
    niveaux: {
      junior:   { idf: r(420, 510, 630), metropoles: r(360, 430, 540), autres: r(320, 390, 480) },
      confirme: { idf: r(680, 820, 1020), metropoles: r(580, 700, 870), autres: r(510, 630, 780) },
      senior:   { idf: r(1000, 1240, 1600), metropoles: r(850, 1070, 1380), autres: r(760, 960, 1240) },
    },
  },
  {
    id: "rh",
    label: "RH / Recrutement / Formation",
    categorie: "Finance, Juridique & RH",
    niveaux: {
      junior:   { idf: r(300, 370, 460), metropoles: r(260, 320, 400), autres: r(230, 280, 360) },
      confirme: { idf: r(490, 590, 740), metropoles: r(420, 500, 630), autres: r(370, 450, 570) },
      senior:   { idf: r(720, 870, 1080), metropoles: r(610, 750, 930), autres: r(550, 670, 840) },
    },
  },
];

export const CATEGORIES_ORDER = [
  "Tech",
  "Produit & Design",
  "Conseil & Management",
  "Marketing & Communication",
  "Finance, Juridique & RH",
] as const;

export type BarometreCategorie = (typeof CATEGORIES_ORDER)[number];

export const DERNIERE_MISE_A_JOUR = "Janvier 2025";

export const SOURCES = [
  "Barômetre Freelance Malt 2024",
  "Barômetre Comet 2024",
  "Barômetre Freelance.com 2024",
  "APEC — Études rémunérations cadres 2024",
];
