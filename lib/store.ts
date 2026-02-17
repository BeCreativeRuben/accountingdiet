/**
 * In-memory datastore (Supabase vervangen).
 * Data gaat verloren bij herstart van de server.
 */

export interface StoreKlant {
  id: number;
  voornaam: string;
  achternaam: string;
  email: string | null;
  telefoon: string | null;
  startdatum: string | null;
  mutualiteit_id: number | null;
  solidaris_uitzondering: boolean;
}

export interface StoreAfspraak {
  id: number;
  datum: string;
  klant_id: number;
  type_id: number;
  aantal: number;
  prijs: number;
  totaal: number;
  terugbetaalbaar: boolean;
  opmerking: string | null;
  maand: string | null;
  pdf_bestand: string | null;
}

export interface StoreUitgave {
  id: number;
  datum: string;
  beschrijving: string;
  categorie_id: number | null;
  bedrag: number;
  betaalmethode: string | null;
  maand: string | null;
}

export interface StoreConsulttype {
  id: number;
  type: string;
  prijs: number | null;
}

export interface StoreCategorie {
  id: number;
  categorie: string;
}

const klanten: StoreKlant[] = [];
const afspraken: StoreAfspraak[] = [];
const uitgaven: StoreUitgave[] = [];
const consulttypes: StoreConsulttype[] = [];
const categorieen: StoreCategorie[] = [];
const pdfStore = new Map<number, string>(); // afspraak id -> base64

let nextKlantId = 1;
let nextAfspraakId = 1;
let nextUitgaveId = 1;
let nextConsulttypeId = 1;
let nextCategorieId = 1;

// --- Klanten
export function getKlanten(): StoreKlant[] {
  return klanten;
}

export function getKlantById(id: number): StoreKlant | undefined {
  return klanten.find((k) => k.id === id);
}

export function insertKlant(row: Omit<StoreKlant, 'id'>): StoreKlant {
  const id = nextKlantId++;
  const k: StoreKlant = { ...row, id };
  klanten.push(k);
  return k;
}

export function updateKlant(id: number, updates: Partial<Omit<StoreKlant, 'id'>>): StoreKlant | null {
  const i = klanten.findIndex((k) => k.id === id);
  if (i === -1) return null;
  klanten[i] = { ...klanten[i], ...updates };
  return klanten[i];
}

export function deleteKlant(id: number): boolean {
  const i = klanten.findIndex((k) => k.id === id);
  if (i === -1) return false;
  klanten.splice(i, 1);
  return true;
}

// --- Afspraken
export function getAfspraken(): StoreAfspraak[] {
  return [...afspraken].sort((a, b) => (b.datum < a.datum ? -1 : 1));
}

export function getAfspraakById(id: number): StoreAfspraak | undefined {
  return afspraken.find((a) => a.id === id);
}

export function insertAfspraak(row: Omit<StoreAfspraak, 'id'>): StoreAfspraak {
  const id = nextAfspraakId++;
  const a: StoreAfspraak = { ...row, id };
  afspraken.push(a);
  return a;
}

export function updateAfspraak(id: number, updates: Partial<Omit<StoreAfspraak, 'id'>>): StoreAfspraak | null {
  const i = afspraken.findIndex((a) => a.id === id);
  if (i === -1) return null;
  afspraken[i] = { ...afspraken[i], ...updates };
  return afspraken[i];
}

export function deleteAfspraak(id: number): boolean {
  const i = afspraken.findIndex((a) => a.id === id);
  if (i === -1) return false;
  afspraken.splice(i, 1);
  pdfStore.delete(id);
  return true;
}

export function setAfspraakPdf(afspraakId: number, base64: string): void {
  pdfStore.set(afspraakId, base64);
}

export function getAfspraakPdf(afspraakId: number): string | undefined {
  return pdfStore.get(afspraakId);
}

// --- Uitgaven
export function getUitgaven(): StoreUitgave[] {
  return [...uitgaven].sort((a, b) => (b.datum < a.datum ? -1 : 1));
}

export function insertUitgave(row: Omit<StoreUitgave, 'id'>): StoreUitgave {
  const id = nextUitgaveId++;
  const u: StoreUitgave = { ...row, id };
  uitgaven.push(u);
  return u;
}

export function updateUitgave(id: number, updates: Partial<Omit<StoreUitgave, 'id'>>): StoreUitgave | null {
  const i = uitgaven.findIndex((u) => u.id === id);
  if (i === -1) return null;
  uitgaven[i] = { ...uitgaven[i], ...updates };
  return uitgaven[i];
}

export function deleteUitgave(id: number): boolean {
  const i = uitgaven.findIndex((u) => u.id === id);
  if (i === -1) return false;
  uitgaven.splice(i, 1);
  return true;
}

// --- Consulttypes
export function getConsulttypes(): StoreConsulttype[] {
  return consulttypes;
}

export function getConsulttypeById(id: number): StoreConsulttype | undefined {
  return consulttypes.find((c) => c.id === id);
}

export function insertConsulttype(row: Omit<StoreConsulttype, 'id'>): StoreConsulttype {
  const id = nextConsulttypeId++;
  const c: StoreConsulttype = { ...row, id };
  consulttypes.push(c);
  return c;
}

export function updateConsulttype(id: number, updates: Partial<Omit<StoreConsulttype, 'id'>>): StoreConsulttype | null {
  const i = consulttypes.findIndex((c) => c.id === id);
  if (i === -1) return null;
  consulttypes[i] = { ...consulttypes[i], ...updates };
  return consulttypes[i];
}

export function deleteConsulttype(id: number): boolean {
  const i = consulttypes.findIndex((c) => c.id === id);
  if (i === -1) return false;
  consulttypes.splice(i, 1);
  return true;
}

// --- Categorieën
export function getCategorieen(): StoreCategorie[] {
  return categorieen;
}

export function getCategorieById(id: number): StoreCategorie | undefined {
  return categorieen.find((c) => c.id === id);
}

export function insertCategorie(row: Omit<StoreCategorie, 'id'>): StoreCategorie {
  const id = nextCategorieId++;
  const c: StoreCategorie = { ...row, id };
  categorieen.push(c);
  return c;
}

export function updateCategorie(id: number, updates: Partial<Omit<StoreCategorie, 'id'>>): StoreCategorie | null {
  const i = categorieen.findIndex((c) => c.id === id);
  if (i === -1) return null;
  categorieen[i] = { ...categorieen[i], ...updates };
  return categorieen[i];
}

export function deleteCategorie(id: number): boolean {
  const i = categorieen.findIndex((c) => c.id === id);
  if (i === -1) return false;
  categorieen.splice(i, 1);
  return true;
}
