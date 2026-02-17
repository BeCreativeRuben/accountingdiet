/**
 * Datastore: Neon Postgres when DATABASE_URL is set, otherwise in-memory (data lost on restart).
 * All functions are async.
 */

import { hasDatabase, getDb } from './db';

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

// ----- In-memory fallback (when DATABASE_URL not set) -----
const DEFAULT_CONSULTTYPES: Omit<StoreConsulttype, 'id'>[] = [
  { type: 'Intake: nieuwe patiënten - eerste consultatie (1:00)', prijs: 50 },
  { type: 'Lange opvolgconsultatie: educatiesessies (0:45)', prijs: 35 },
  { type: 'Korte opvolgconsultatie (0:30)', prijs: 25 },
  { type: 'Duo-intakegesprek (1:20)', prijs: 80 },
  { type: 'Duoconsultatie: lange opvolgconsultatie (1:00)', prijs: 55 },
  { type: 'Duoconsulatie: korte opvolgconsultatie (0:30)', prijs: 45 },
  { type: 'Online consultatie: intake (1:00)', prijs: 50 },
  { type: 'Eénmalige lichaamsanalyse + uitgebreide bespreking ervan (0:25)', prijs: 30 },
  { type: 'Online: lange opvolgconsultatie (0:45)', prijs: 35 },
  { type: 'Kennismakingsgesprek: twijfel je nog, plan een gratis (telefonisch)kennismakingsgesprek in (0:10)', prijs: null },
  { type: 'Online: korte opvolgconsultatie (0:15)', prijs: 25 },
];

const mem = {
  klanten: [] as StoreKlant[],
  afspraken: [] as StoreAfspraak[],
  uitgaven: [] as StoreUitgave[],
  consulttypes: [] as StoreConsulttype[],
  categorieen: [] as StoreCategorie[],
  pdfStore: new Map<number, string>(),
  nextKlantId: 1,
  nextAfspraakId: 1,
  nextUitgaveId: 1,
  nextConsulttypeId: 12,
  nextCategorieId: 1,
};

function initMemoryConsulttypes(): void {
  if (mem.consulttypes.length > 0) return;
  mem.consulttypes = DEFAULT_CONSULTTYPES.map((row, i) => ({ id: i + 1, ...row }));
}

// ----- Klanten -----
export async function getKlanten(): Promise<StoreKlant[]> {
  if (hasDatabase()) {
    const sql = getDb();
    const rows = await sql`SELECT id, voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering FROM klanten ORDER BY id`;
    return rows.map((r: any) => ({
      id: Number(r.id),
      voornaam: r.voornaam,
      achternaam: r.achternaam,
      email: r.email ?? null,
      telefoon: r.telefoon ?? null,
      startdatum: r.startdatum ? String(r.startdatum).slice(0, 10) : null,
      mutualiteit_id: r.mutualiteit_id != null ? Number(r.mutualiteit_id) : null,
      solidaris_uitzondering: Boolean(r.solidaris_uitzondering),
    }));
  }
  initMemoryConsulttypes();
  return mem.klanten;
}

export async function getKlantById(id: number): Promise<StoreKlant | undefined> {
  if (hasDatabase()) {
    const sql = getDb();
    const rows = await sql`SELECT id, voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering FROM klanten WHERE id = ${id}`;
    const r = rows[0] as any;
    if (!r) return undefined;
    return {
      id: Number(r.id),
      voornaam: r.voornaam,
      achternaam: r.achternaam,
      email: r.email ?? null,
      telefoon: r.telefoon ?? null,
      startdatum: r.startdatum ? String(r.startdatum).slice(0, 10) : null,
      mutualiteit_id: r.mutualiteit_id != null ? Number(r.mutualiteit_id) : null,
      solidaris_uitzondering: Boolean(r.solidaris_uitzondering),
    };
  }
  return mem.klanten.find((k) => k.id === id);
}

export async function insertKlant(row: Omit<StoreKlant, 'id'>): Promise<StoreKlant> {
  if (hasDatabase()) {
    const sql = getDb();
    const r = await sql`INSERT INTO klanten (voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering)
      VALUES (${row.voornaam}, ${row.achternaam}, ${row.email}, ${row.telefoon}, ${row.startdatum}, ${row.mutualiteit_id}, ${row.solidaris_uitzondering})
      RETURNING id, voornaam, achternaam, email, telefoon, startdatum, mutualiteit_id, solidaris_uitzondering`;
    const inserted = (r as any[])[0];
    return {
      id: Number(inserted.id),
      voornaam: inserted.voornaam,
      achternaam: inserted.achternaam,
      email: inserted.email ?? null,
      telefoon: inserted.telefoon ?? null,
      startdatum: inserted.startdatum ? String(inserted.startdatum).slice(0, 10) : null,
      mutualiteit_id: inserted.mutualiteit_id != null ? Number(inserted.mutualiteit_id) : null,
      solidaris_uitzondering: Boolean(inserted.solidaris_uitzondering),
    };
  }
  const id = mem.nextKlantId++;
  const k: StoreKlant = { ...row, id };
  mem.klanten.push(k);
  return k;
}

export async function updateKlant(id: number, updates: Partial<Omit<StoreKlant, 'id'>>): Promise<StoreKlant | null> {
  if (hasDatabase()) {
    const existing = await getKlantById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    const sql = getDb();
    await sql`UPDATE klanten SET voornaam = ${merged.voornaam}, achternaam = ${merged.achternaam}, email = ${merged.email}, telefoon = ${merged.telefoon}, startdatum = ${merged.startdatum}, mutualiteit_id = ${merged.mutualiteit_id}, solidaris_uitzondering = ${merged.solidaris_uitzondering} WHERE id = ${id}`;
    return (await getKlantById(id)) ?? null;
  }
  const idx = mem.klanten.findIndex((k) => k.id === id);
  if (idx === -1) return null;
  mem.klanten[idx] = { ...mem.klanten[idx], ...updates };
  return mem.klanten[idx];
}

export async function deleteKlant(id: number): Promise<boolean> {
  if (hasDatabase()) {
    const existing = await getKlantById(id);
    if (!existing) return false;
    const sql = getDb();
    await sql`DELETE FROM klanten WHERE id = ${id}`;
    return true;
  }
  const idx = mem.klanten.findIndex((k) => k.id === id);
  if (idx === -1) return false;
  mem.klanten.splice(idx, 1);
  return true;
}

// ----- Afspraken -----
function rowToAfspraak(r: any): StoreAfspraak {
  return {
    id: Number(r.id),
    datum: String(r.datum).slice(0, 10),
    klant_id: Number(r.klant_id),
    type_id: Number(r.type_id),
    aantal: Number(r.aantal),
    prijs: Number(r.prijs),
    totaal: Number(r.totaal),
    terugbetaalbaar: Boolean(r.terugbetaalbaar),
    opmerking: r.opmerking ?? null,
    maand: r.maand ? String(r.maand).slice(0, 10) : null,
    pdf_bestand: r.pdf_bestand ?? null,
  };
}

export async function getAfspraken(): Promise<StoreAfspraak[]> {
  if (hasDatabase()) {
    const sql = getDb();
    const rows = await sql`SELECT * FROM afspraken ORDER BY datum DESC`;
    return (rows as any[]).map(rowToAfspraak);
  }
  return [...mem.afspraken].sort((a, b) => (b.datum < a.datum ? -1 : 1));
}

export async function getAfspraakById(id: number): Promise<StoreAfspraak | undefined> {
  if (hasDatabase()) {
    const sql = getDb();
    const rows = await sql`SELECT * FROM afspraken WHERE id = ${id}`;
    const r = (rows as any[])[0];
    return r ? rowToAfspraak(r) : undefined;
  }
  return mem.afspraken.find((a) => a.id === id);
}

export async function insertAfspraak(row: Omit<StoreAfspraak, 'id'>): Promise<StoreAfspraak> {
  if (hasDatabase()) {
    const sql = getDb();
    const r = await sql`INSERT INTO afspraken (datum, klant_id, type_id, aantal, prijs, totaal, terugbetaalbaar, opmerking, maand, pdf_bestand)
      VALUES (${row.datum}, ${row.klant_id}, ${row.type_id}, ${row.aantal}, ${row.prijs}, ${row.totaal}, ${row.terugbetaalbaar}, ${row.opmerking}, ${row.maand}, ${row.pdf_bestand})
      RETURNING *`;
    const inserted = (r as any[])[0];
    return rowToAfspraak(inserted);
  }
  const id = mem.nextAfspraakId++;
  const a: StoreAfspraak = { ...row, id };
  mem.afspraken.push(a);
  return a;
}

export async function updateAfspraak(id: number, updates: Partial<Omit<StoreAfspraak, 'id'>>): Promise<StoreAfspraak | null> {
  if (hasDatabase()) {
    const sql = getDb();
    const existing = await getAfspraakById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    await sql`UPDATE afspraken SET datum=${merged.datum}, klant_id=${merged.klant_id}, type_id=${merged.type_id}, aantal=${merged.aantal}, prijs=${merged.prijs}, totaal=${merged.totaal}, terugbetaalbaar=${merged.terugbetaalbaar}, opmerking=${merged.opmerking}, maand=${merged.maand}, pdf_bestand=${merged.pdf_bestand} WHERE id = ${id}`;
    return (await getAfspraakById(id)) ?? null;
  }
  const idx = mem.afspraken.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  mem.afspraken[idx] = { ...mem.afspraken[idx], ...updates };
  return mem.afspraken[idx];
}

export async function deleteAfspraak(id: number): Promise<boolean> {
  if (hasDatabase()) {
    const existing = await getAfspraakById(id);
    if (!existing) return false;
    const sql = getDb();
    await sql`DELETE FROM afspraken WHERE id = ${id}`;
    return true;
  }
  const idx = mem.afspraken.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  mem.afspraken.splice(idx, 1);
  mem.pdfStore.delete(id);
  return true;
}

export async function setAfspraakPdf(afspraakId: number, base64: string): Promise<void> {
  if (hasDatabase()) {
    const sql = getDb();
    await sql`INSERT INTO afspraak_pdf (afspraak_id, pdf_base64) VALUES (${afspraakId}, ${base64})
      ON CONFLICT (afspraak_id) DO UPDATE SET pdf_base64 = ${base64}`;
    return;
  }
  mem.pdfStore.set(afspraakId, base64);
}

export async function getAfspraakPdf(afspraakId: number): Promise<string | undefined> {
  if (hasDatabase()) {
    const sql = getDb();
    const rows = await sql`SELECT pdf_base64 FROM afspraak_pdf WHERE afspraak_id = ${afspraakId}`;
    const r = (rows as any[])[0];
    return r?.pdf_base64;
  }
  return mem.pdfStore.get(afspraakId);
}

// ----- Uitgaven -----
function rowToUitgave(r: any): StoreUitgave {
  return {
    id: Number(r.id),
    datum: String(r.datum).slice(0, 10),
    beschrijving: r.beschrijving,
    categorie_id: r.categorie_id != null ? Number(r.categorie_id) : null,
    bedrag: Number(r.bedrag),
    betaalmethode: r.betaalmethode ?? null,
    maand: r.maand ? String(r.maand).slice(0, 10) : null,
  };
}

export async function getUitgaven(): Promise<StoreUitgave[]> {
  if (hasDatabase()) {
    const sql = getDb();
    const rows = await sql`SELECT * FROM uitgaven ORDER BY datum DESC`;
    return (rows as any[]).map(rowToUitgave);
  }
  return [...mem.uitgaven].sort((a, b) => (b.datum < a.datum ? -1 : 1));
}

export async function insertUitgave(row: Omit<StoreUitgave, 'id'>): Promise<StoreUitgave> {
  if (hasDatabase()) {
    const sql = getDb();
    const r = await sql`INSERT INTO uitgaven (datum, beschrijving, categorie_id, bedrag, betaalmethode, maand)
      VALUES (${row.datum}, ${row.beschrijving}, ${row.categorie_id}, ${row.bedrag}, ${row.betaalmethode}, ${row.maand})
      RETURNING *`;
    return rowToUitgave((r as any[])[0]);
  }
  const id = mem.nextUitgaveId++;
  const u: StoreUitgave = { ...row, id };
  mem.uitgaven.push(u);
  return u;
}

export async function updateUitgave(id: number, updates: Partial<Omit<StoreUitgave, 'id'>>): Promise<StoreUitgave | null> {
  if (hasDatabase()) {
    const sql = getDb();
    const rows = await sql`SELECT * FROM uitgaven WHERE id = ${id}`;
    const existing = (rows as any[])[0];
    if (!existing) return null;
    const merged = { ...rowToUitgave(existing), ...updates };
    await sql`UPDATE uitgaven SET datum = ${merged.datum}, beschrijving = ${merged.beschrijving}, categorie_id = ${merged.categorie_id}, bedrag = ${merged.bedrag}, betaalmethode = ${merged.betaalmethode}, maand = ${merged.maand} WHERE id = ${id}`;
    const after = await sql`SELECT * FROM uitgaven WHERE id = ${id}`;
    return (after as any[]).length ? rowToUitgave((after as any[])[0]) : null;
  }
  const idx = mem.uitgaven.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  mem.uitgaven[idx] = { ...mem.uitgaven[idx], ...updates };
  return mem.uitgaven[idx];
}

export async function deleteUitgave(id: number): Promise<boolean> {
  if (hasDatabase()) {
    const sql = getDb();
    const rows = await sql`SELECT id FROM uitgaven WHERE id = ${id}`;
    if (!(rows as any[]).length) return false;
    await sql`DELETE FROM uitgaven WHERE id = ${id}`;
    return true;
  }
  const idx = mem.uitgaven.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  mem.uitgaven.splice(idx, 1);
  return true;
}

// ----- Consulttypes -----
export async function getConsulttypes(): Promise<StoreConsulttype[]> {
  if (hasDatabase()) {
    const sql = getDb();
    const rows = await sql`SELECT id, type, prijs FROM consulttypes ORDER BY type`;
    return (rows as any[]).map((r: any) => ({
      id: Number(r.id),
      type: r.type,
      prijs: r.prijs != null ? Number(r.prijs) : null,
    }));
  }
  initMemoryConsulttypes();
  return mem.consulttypes;
}

export async function getConsulttypeById(id: number): Promise<StoreConsulttype | undefined> {
  if (hasDatabase()) {
    const sql = getDb();
    const rows = await sql`SELECT id, type, prijs FROM consulttypes WHERE id = ${id}`;
    const r = (rows as any[])[0];
    return r ? { id: Number(r.id), type: r.type, prijs: r.prijs != null ? Number(r.prijs) : null } : undefined;
  }
  initMemoryConsulttypes();
  return mem.consulttypes.find((c) => c.id === id);
}

export async function insertConsulttype(row: Omit<StoreConsulttype, 'id'>): Promise<StoreConsulttype> {
  if (hasDatabase()) {
    const sql = getDb();
    const r = await sql`INSERT INTO consulttypes (type, prijs) VALUES (${row.type}, ${row.prijs}) RETURNING *`;
    const inserted = (r as any[])[0];
    return { id: Number(inserted.id), type: inserted.type, prijs: inserted.prijs != null ? Number(inserted.prijs) : null };
  }
  const id = mem.nextConsulttypeId++;
  const c: StoreConsulttype = { ...row, id };
  mem.consulttypes.push(c);
  return c;
}

export async function updateConsulttype(id: number, updates: Partial<Omit<StoreConsulttype, 'id'>>): Promise<StoreConsulttype | null> {
  if (hasDatabase()) {
    const sql = getDb();
    const existing = await getConsulttypeById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    await sql`UPDATE consulttypes SET type = ${merged.type}, prijs = ${merged.prijs} WHERE id = ${id}`;
    return (await getConsulttypeById(id)) ?? null;
  }
  const idx = mem.consulttypes.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  mem.consulttypes[idx] = { ...mem.consulttypes[idx], ...updates };
  return mem.consulttypes[idx];
}

export async function deleteConsulttype(id: number): Promise<boolean> {
  if (hasDatabase()) {
    const existing = await getConsulttypeById(id);
    if (!existing) return false;
    const sql = getDb();
    await sql`DELETE FROM consulttypes WHERE id = ${id}`;
    return true;
  }
  const idx = mem.consulttypes.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  mem.consulttypes.splice(idx, 1);
  return true;
}

// ----- Categorieën -----
export async function getCategorieen(): Promise<StoreCategorie[]> {
  if (hasDatabase()) {
    const sql = getDb();
    const rows = await sql`SELECT id, categorie FROM categorieen ORDER BY categorie`;
    return (rows as any[]).map((r: any) => ({ id: Number(r.id), categorie: r.categorie }));
  }
  return mem.categorieen;
}

export async function getCategorieById(id: number): Promise<StoreCategorie | undefined> {
  if (hasDatabase()) {
    const sql = getDb();
    const rows = await sql`SELECT id, categorie FROM categorieen WHERE id = ${id}`;
    const r = (rows as any[])[0];
    return r ? { id: Number(r.id), categorie: r.categorie } : undefined;
  }
  return mem.categorieen.find((c) => c.id === id);
}

export async function insertCategorie(row: Omit<StoreCategorie, 'id'>): Promise<StoreCategorie> {
  if (hasDatabase()) {
    const sql = getDb();
    const r = await sql`INSERT INTO categorieen (categorie) VALUES (${row.categorie}) RETURNING *`;
    const inserted = (r as any[])[0];
    return { id: Number(inserted.id), categorie: inserted.categorie };
  }
  const id = mem.nextCategorieId++;
  const c: StoreCategorie = { ...row, id };
  mem.categorieen.push(c);
  return c;
}

export async function updateCategorie(id: number, updates: Partial<Omit<StoreCategorie, 'id'>>): Promise<StoreCategorie | null> {
  if (hasDatabase()) {
    const existing = await getCategorieById(id);
    if (!existing) return null;
    const categorie = updates.categorie ?? existing.categorie;
    const sql = getDb();
    await sql`UPDATE categorieen SET categorie = ${categorie} WHERE id = ${id}`;
    return (await getCategorieById(id)) ?? null;
  }
  const idx = mem.categorieen.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  mem.categorieen[idx] = { ...mem.categorieen[idx], ...updates };
  return mem.categorieen[idx];
}

export async function deleteCategorie(id: number): Promise<boolean> {
  if (hasDatabase()) {
    const existing = await getCategorieById(id);
    if (!existing) return false;
    const sql = getDb();
    await sql`DELETE FROM categorieen WHERE id = ${id}`;
    return true;
  }
  const idx = mem.categorieen.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  mem.categorieen.splice(idx, 1);
  return true;
}
