-- Laura Boekhoudsysteem – Neon Postgres schema (single user, no tenant)
-- Run once in Neon: Dashboard → SQL Editor → paste this file → Run
-- Zet DATABASE_URL in .env (Neon quickstart "Recommended for most uses" connection string)

-- Consulttypes
CREATE TABLE IF NOT EXISTS consulttypes (
  id serial PRIMARY KEY,
  type text NOT NULL,
  prijs numeric(10,2)
);

-- Categorieën
CREATE TABLE IF NOT EXISTS categorieen (
  id serial PRIMARY KEY,
  categorie text NOT NULL
);

-- Klanten (mutualiteit_id = 1–5 from fixed list in app)
CREATE TABLE IF NOT EXISTS klanten (
  id serial PRIMARY KEY,
  voornaam text NOT NULL,
  achternaam text NOT NULL,
  email text,
  telefoon text,
  startdatum date,
  mutualiteit_id integer,
  solidaris_uitzondering boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_klanten_mutualiteit ON klanten(mutualiteit_id);

-- Afspraken
CREATE TABLE IF NOT EXISTS afspraken (
  id serial PRIMARY KEY,
  datum date NOT NULL,
  klant_id integer NOT NULL REFERENCES klanten(id) ON DELETE CASCADE,
  type_id integer NOT NULL REFERENCES consulttypes(id) ON DELETE RESTRICT,
  aantal integer DEFAULT 1,
  prijs numeric(10,2) NOT NULL,
  totaal numeric(10,2) NOT NULL,
  terugbetaalbaar boolean DEFAULT false,
  opmerking text,
  maand date,
  pdf_bestand text
);

CREATE INDEX IF NOT EXISTS idx_afspraken_datum ON afspraken(datum);
CREATE INDEX IF NOT EXISTS idx_afspraken_maand ON afspraken(maand);
CREATE INDEX IF NOT EXISTS idx_afspraken_klant ON afspraken(klant_id);

-- PDF opslag per afspraak (base64)
CREATE TABLE IF NOT EXISTS afspraak_pdf (
  afspraak_id integer PRIMARY KEY REFERENCES afspraken(id) ON DELETE CASCADE,
  pdf_base64 text NOT NULL
);

-- Uitgaven
CREATE TABLE IF NOT EXISTS uitgaven (
  id serial PRIMARY KEY,
  datum date NOT NULL,
  beschrijving text NOT NULL,
  categorie_id integer REFERENCES categorieen(id) ON DELETE SET NULL,
  bedrag numeric(10,2) NOT NULL,
  betaalmethode text,
  maand date
);

CREATE INDEX IF NOT EXISTS idx_uitgaven_datum ON uitgaven(datum);
CREATE INDEX IF NOT EXISTS idx_uitgaven_maand ON uitgaven(maand);

-- Seed default consulttypes (Laura's list)
INSERT INTO consulttypes (id, type, prijs) VALUES
  (1, 'Intake: nieuwe patiënten - eerste consultatie (1:00)', 50),
  (2, 'Lange opvolgconsultatie: educatiesessies (0:45)', 35),
  (3, 'Korte opvolgconsultatie (0:30)', 25),
  (4, 'Duo-intakegesprek (1:20)', 80),
  (5, 'Duoconsultatie: lange opvolgconsultatie (1:00)', 55),
  (6, 'Duoconsulatie: korte opvolgconsultatie (0:30)', 45),
  (7, 'Online consultatie: intake (1:00)', 50),
  (8, 'Eénmalige lichaamsanalyse + uitgebreide bespreking ervan (0:25)', 30),
  (9, 'Online: lange opvolgconsultatie (0:45)', 35),
  (10, 'Kennismakingsgesprek: twijfel je nog, plan een gratis (telefonisch)kennismakingsgesprek in (0:10)', NULL),
  (11, 'Online: korte opvolgconsultatie (0:15)', 25)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence so new consulttypes get id >= 12
SELECT setval('consulttypes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM consulttypes));
