// Type definitions for the application

export interface Klant {
  id: number;
  voornaam: string;
  achternaam: string;
  email?: string | null;
  telefoon?: string | null;
  startdatum?: string | null;
  mutualiteit_id?: number | null;
  solidaris_uitzondering?: boolean;
  mutualiteit_naam?: string | null;
}

export interface Afspraak {
  id: number;
  datum: string;
  klant_id: number;
  type_id: number;
  aantal: number;
  prijs: number;
  totaal: number;
  terugbetaalbaar: boolean;
  opmerking?: string | null;
  maand?: string | null;
  pdf_bestand?: string | null;
  voornaam?: string;
  achternaam?: string;
  type?: string;
  type_prijs?: number;
}

export interface Uitgave {
  id: number;
  datum: string;
  beschrijving: string;
  categorie_id?: number | null;
  bedrag: number;
  betaalmethode?: string | null;
  maand?: string | null;
  categorie?: string | null;
}

export interface Consulttype {
  id: number;
  type: string;
  prijs?: number | null;
}

export interface Mutualiteit {
  id: number;
  naam: string;
  maxSessiesPerJaar?: number | null;
  max_sessies_per_jaar?: number | null;
  opmerking?: string | null;
}

export interface Categorie {
  id: number;
  categorie: string;
}

export interface Dashboard {
  inkomsten: number;
  uitgaven: number;
  netto: number;
}

export interface Maandoverzicht {
  maand: string;
  inkomsten: number;
  uitgaven: number;
  netto: number;
}

export interface TerugbetalingSignaal {
  klant_id: number;
  voornaam: string;
  achternaam: string;
  mutualiteit_naam: string;
  sessies_terugbetaalbaar: number;
  melding: string;
  resterend?: number | null;
}
