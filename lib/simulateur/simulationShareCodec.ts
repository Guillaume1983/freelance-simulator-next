import { CHARGES_CATALOG, DEFAULT_PORTAGE_COMM } from '@/lib/constants';
import type { CitySize } from '@/lib/projections';

/** Paramètre d’URL pour une simulation partagée (JSON base64url). */
export const SHARE_QUERY_KEY = 'sim';

export const SIMULATION_SHARE_APPLIED_EVENT = 'fs-simulation-share-applied';

export type SimulationShareAppliedDetail = { growthByYear: number[] };

const VALID_CITY: CitySize[] = ['petite', 'moyenne', 'grande'];
const VALID_MICRO = ['BNC', 'BIC_SERVICE', 'BIC_COMMERCE'] as const;
const VALID_TV = ['voiture', 'moto', 'cyclo50'] as const;

type ChargeCatalogId = (typeof CHARGES_CATALOG)[number]['id'];
const CHARGE_IDS = new Set<string>(CHARGES_CATALOG.map((c) => c.id));

export type SimulationSharePayloadV1 = {
  v: 1;
  tjm: number;
  days: number;
  na: 1 | 2;
  ne: number;
  si: number;
  km: number;
  cv: string;
  tv: (typeof VALID_TV)[number];
  ve: boolean;
  loy: number;
  secV: boolean;
  ac: string[];
  cam: Record<string, number>;
  mat: number;
  pc: number;
  tam: (typeof VALID_MICRO)[number];
  pl: boolean;
  rd: number;
  rr: number;
  avo: number;
  acre: boolean;
  cs: CitySize;
  gr: number;
  /** Croissance % par année (5 slots, aligné sur `projeterSurNAns`) ; omis si uniforme = `gr`. */
  g5?: number[];
};

function emptyChargeAmounts(): Record<string, number> {
  return CHARGES_CATALOG.reduce(
    (acc, c) => {
      acc[c.id] = 0;
      return acc;
    },
    {} as Record<string, number>,
  );
}

function clampInt(n: unknown, min: number, max: number, fallback: number): number {
  const x = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, Math.round(x)));
}

function clampNum(n: unknown, min: number, max: number, fallback: number): number {
  const x = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, x));
}

function utf8StringToBase64Url(json: string): string {
  const toUrl = (b64: string) => b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (typeof Buffer !== 'undefined') {
    return toUrl(Buffer.from(json, 'utf8').toString('base64'));
  }
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  // eslint-disable-next-line no-restricted-globals -- navigateur
  return toUrl(btoa(bin));
}

export function encodeSimulationSharePayload(
  input: Omit<SimulationSharePayloadV1, 'v'>,
): string {
  const payload: SimulationSharePayloadV1 = { v: 1, ...input };
  const json = JSON.stringify(payload);
  return utf8StringToBase64Url(json);
}

function base64UrlToUtf8(b64url: string): string | null {
  try {
    const pad = b64url.length % 4 === 0 ? '' : '='.repeat(4 - (b64url.length % 4));
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + pad;
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(b64, 'base64').toString('utf8');
    }
    // eslint-disable-next-line no-restricted-globals
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return null;
  }
}

export function decodeSimulationShareParam(raw: string): SimulationSharePayloadV1 | null {
  const json = base64UrlToUtf8(raw.trim());
  if (json == null) return null;
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  if (o.v !== 1) return null;

  const na = o.na === 2 ? 2 : 1;
  const tv = VALID_TV.includes(o.tv as any) ? (o.tv as (typeof VALID_TV)[number]) : 'voiture';
  const tam = VALID_MICRO.includes(o.tam as any) ? (o.tam as (typeof VALID_MICRO)[number]) : 'BNC';
  const cs = VALID_CITY.includes(o.cs as any) ? (o.cs as CitySize) : 'moyenne';

  const acRaw = Array.isArray(o.ac) ? o.ac : [];
  const ac = acRaw.filter((id): id is ChargeCatalogId => typeof id === 'string' && CHARGE_IDS.has(id));

  const camIn = o.cam && typeof o.cam === 'object' ? (o.cam as Record<string, unknown>) : {};
  const cam: Record<string, number> = emptyChargeAmounts();
  for (const id of CHARGE_IDS) {
    if (camIn[id] != null) cam[id] = clampNum(camIn[id], 0, 500_000, cam[id]);
  }

  let g5: number[] | undefined;
  if (Array.isArray(o.g5) && o.g5.length === 5) {
    g5 = o.g5.map((x) => clampInt(x, 0, 50, 0));
  }

  return {
    v: 1,
    tjm: clampInt(o.tjm, 0, 10_000, 400),
    days: clampInt(o.days, 0, 400, 200),
    na,
    ne: clampInt(o.ne, 0, 20, 0),
    si: clampNum(o.si, 0, 2_000_000, 0),
    km: clampInt(o.km, 0, 500_000, 0),
    cv: typeof o.cv === 'string' && /^([1-9]|1[0-6])$/.test(o.cv) ? o.cv : '6',
    tv,
    ve: Boolean(o.ve),
    loy: clampNum(o.loy, 0, 2_000_000, 0),
    secV: Boolean(o.secV),
    ac,
    cam,
    mat: clampNum(o.mat, 0, 500_000, 0),
    pc: clampNum(o.pc, 0, 30, DEFAULT_PORTAGE_COMM),
    tam,
    pl: Boolean(o.pl),
    rd: clampNum(o.rd, 0, 1, 1),
    rr: clampNum(o.rr, 0, 100, 0),
    avo: clampNum(o.avo, 0, 500_000, 0),
    acre: Boolean(o.acre),
    cs,
    gr: clampInt(o.gr, 0, 50, 2),
    g5,
  };
}

export function payloadToGrowthByYear(p: SimulationSharePayloadV1): number[] {
  if (p.g5?.length === 5) return p.g5.map((n) => clampInt(n, 0, 50, 0));
  const y = clampInt(p.gr, 0, 50, 2);
  return [y, y, y, y, y];
}

type Setters = {
  setTjm: (n: number) => void;
  setDays: (n: number) => void;
  setNbAdultes: (n: 1 | 2) => void;
  setNbEnfants: (n: number) => void;
  setSpouseIncome: (n: number) => void;
  setKmAnnuel: (n: number) => void;
  setCvFiscaux: (s: string) => void;
  setTypeVehicule: (t: 'voiture' | 'moto' | 'cyclo50') => void;
  setVehiculeElectrique: (b: boolean) => void;
  setLoyerPercu: (n: number) => void;
  setSectionsActive: (s: { vehicule: boolean }) => void;
  setActiveCharges: (ids: string[]) => void;
  setChargeAmounts: (m: Record<string, number>) => void;
  setMaterielAnnuel: (n: number) => void;
  setPortageComm: (n: number) => void;
  setTypeActiviteMicro: (t: 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE') => void;
  setPrelevementLiberatoire: (b: boolean) => void;
  setRemunerationDirigeantMensuelle: (n: number) => void;
  setRepartitionRemuneration: (n: number) => void;
  setAvantagesOptimises: (n: number) => void;
  setAcreEnabled: (b: boolean) => void;
  setCitySize: (c: CitySize) => void;
  setGrowthRate: (n: number) => void;
};

export function applySimulationSharePayload(p: SimulationSharePayloadV1, setters: Setters): void {
  setters.setTjm(p.tjm);
  setters.setDays(p.days);
  setters.setNbAdultes(p.na);
  setters.setNbEnfants(p.ne);
  setters.setSpouseIncome(p.si);
  setters.setKmAnnuel(p.km);
  setters.setCvFiscaux(p.cv);
  setters.setTypeVehicule(p.tv);
  setters.setVehiculeElectrique(p.ve);
  setters.setLoyerPercu(p.loy);
  setters.setSectionsActive({ vehicule: p.secV });
  setters.setActiveCharges(p.ac);
  setters.setChargeAmounts({ ...emptyChargeAmounts(), ...p.cam });
  setters.setMaterielAnnuel(p.mat);
  setters.setPortageComm(p.pc);
  setters.setTypeActiviteMicro(p.tam);
  setters.setPrelevementLiberatoire(p.pl);
  setters.setRemunerationDirigeantMensuelle(p.rd);
  setters.setRepartitionRemuneration(p.rr);
  setters.setAvantagesOptimises(p.avo);
  setters.setAcreEnabled(p.acre);
  setters.setCitySize(p.cs);
  setters.setGrowthRate(p.gr);
}

export type ShareableSimulationState = {
  tjm: number;
  days: number;
  nbAdultes: 1 | 2;
  nbEnfants: number;
  spouseIncome: number;
  kmAnnuel: number;
  cvFiscaux: string;
  typeVehicule: 'voiture' | 'moto' | 'cyclo50';
  vehiculeElectrique: boolean;
  loyerPercu: number;
  sectionsActive: { vehicule: boolean };
  activeCharges: string[];
  chargeAmounts: Record<string, number>;
  materielAnnuel: number;
  portageComm: number;
  typeActiviteMicro: 'BNC' | 'BIC_SERVICE' | 'BIC_COMMERCE';
  prelevementLiberatoire: boolean;
  remunerationDirigeantMensuelle: number;
  repartitionRemuneration: number;
  avantagesOptimises: number;
  acreEnabled: boolean;
  citySize: CitySize;
  growthRate: number;
};

/** Normalise l’état du contexte pour l’encodage (évite exceptions sur champs atypiques). */
export function toShareableSimulationState(raw: Record<string, unknown>): ShareableSimulationState {
  const charges = emptyChargeAmounts();
  const camRaw = raw.chargeAmounts;
  if (camRaw && typeof camRaw === 'object' && !Array.isArray(camRaw)) {
    for (const c of CHARGES_CATALOG) {
      const id = c.id;
      const v = (camRaw as Record<string, unknown>)[id];
      charges[id] = clampNum(v, 0, 500_000, 0);
    }
  }

  const acRaw = raw.activeCharges;
  const activeCharges = Array.isArray(acRaw)
    ? acRaw.filter((id): id is ChargeCatalogId => typeof id === 'string' && CHARGE_IDS.has(id))
    : [];

  const sec = raw.sectionsActive;
  const vehicule =
    Boolean(sec && typeof sec === 'object' && !Array.isArray(sec) && (sec as { vehicule?: unknown }).vehicule);

  let typeVehicule: ShareableSimulationState['typeVehicule'] = 'voiture';
  if (raw.typeVehicule === 'moto' || raw.typeVehicule === 'cyclo50' || raw.typeVehicule === 'voiture') {
    typeVehicule = raw.typeVehicule;
  }

  let typeActiviteMicro: ShareableSimulationState['typeActiviteMicro'] = 'BNC';
  if (VALID_MICRO.includes(raw.typeActiviteMicro as (typeof VALID_MICRO)[number])) {
    typeActiviteMicro = raw.typeActiviteMicro as (typeof VALID_MICRO)[number];
  }

  let citySize: CitySize = 'moyenne';
  if (VALID_CITY.includes(raw.citySize as CitySize)) {
    citySize = raw.citySize as CitySize;
  }

  let cv = String(raw.cvFiscaux ?? '6').trim();
  if (!/^([1-9]|1[0-6])$/.test(cv)) cv = '6';

  return {
    tjm: clampInt(raw.tjm, 0, 10_000, 400),
    days: clampInt(raw.days, 0, 400, 200),
    nbAdultes: raw.nbAdultes === 2 ? 2 : 1,
    nbEnfants: clampInt(raw.nbEnfants, 0, 20, 0),
    spouseIncome: clampNum(raw.spouseIncome, 0, 2_000_000, 0),
    kmAnnuel: clampInt(raw.kmAnnuel, 0, 500_000, 0),
    cvFiscaux: cv,
    typeVehicule,
    vehiculeElectrique: Boolean(raw.vehiculeElectrique),
    loyerPercu: clampNum(raw.loyerPercu, 0, 2_000_000, 0),
    sectionsActive: { vehicule },
    activeCharges,
    chargeAmounts: charges,
    materielAnnuel: clampNum(raw.materielAnnuel, 0, 500_000, 0),
    portageComm: clampNum(raw.portageComm, 0, 30, DEFAULT_PORTAGE_COMM),
    typeActiviteMicro,
    prelevementLiberatoire: Boolean(raw.prelevementLiberatoire),
    remunerationDirigeantMensuelle: clampNum(raw.remunerationDirigeantMensuelle, 0, 1, 1),
    repartitionRemuneration: clampNum(raw.repartitionRemuneration, 0, 100, 0),
    avantagesOptimises: clampNum(raw.avantagesOptimises, 0, 500_000, 0),
    acreEnabled: Boolean(raw.acreEnabled),
    citySize,
    growthRate: clampInt(raw.growthRate, 0, 50, 2),
  };
}

/** URL `?sim=` avec origine de secours si besoin. */
export function buildSimulationSharePageUrl(
  pathname: string | null | undefined,
  token: string,
): string {
  const path =
    pathname && pathname.length > 0
      ? pathname.startsWith('/')
        ? pathname
        : `/${pathname}`
      : typeof window !== 'undefined'
        ? window.location.pathname || '/'
        : '/';

  let origin = typeof window !== 'undefined' ? window.location.origin : '';
  if (!origin || origin === 'null' || !/^https?:\/\//i.test(origin)) {
    origin = 'http://localhost:3000';
  }

  return `${origin}${path}?${SHARE_QUERY_KEY}=${encodeURIComponent(token)}`;
}

export function encodeSimulationShareFromState(
  state: ShareableSimulationState,
  growthByYear?: number[],
): string {
  const g = growthByYear?.length === 5 ? growthByYear.map((n) => clampInt(n, 0, 50, 0)) : null;
  const y0 = clampInt(state.growthRate, 0, 50, 2);
  const uniform = g && g.every((x) => x === y0);
  const g5 = g && !uniform ? g : undefined;

  const payload: Omit<SimulationSharePayloadV1, 'v'> = {
    tjm: state.tjm,
    days: state.days,
    na: state.nbAdultes,
    ne: state.nbEnfants,
    si: state.spouseIncome,
    km: state.kmAnnuel,
    cv: state.cvFiscaux,
    tv: state.typeVehicule,
    ve: state.vehiculeElectrique,
    loy: state.loyerPercu,
    secV: state.sectionsActive.vehicule,
    ac: [...state.activeCharges],
    cam: { ...state.chargeAmounts },
    mat: state.materielAnnuel,
    pc: state.portageComm,
    tam: state.typeActiviteMicro,
    pl: state.prelevementLiberatoire,
    rd: state.remunerationDirigeantMensuelle,
    rr: state.repartitionRemuneration,
    avo: state.avantagesOptimises,
    acre: state.acreEnabled,
    cs: state.citySize,
    gr: y0,
    g5,
  };
  return encodeSimulationSharePayload(payload);
}
