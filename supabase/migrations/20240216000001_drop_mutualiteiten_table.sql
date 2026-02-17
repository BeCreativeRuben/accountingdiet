-- Mutualiteiten zitten niet meer in Supabase; vaste lijst in de app (lib/mutualiteiten.ts).
-- Klanten behouden mutualiteit_id als getal (1-5) dat naar die vaste lijst verwijst.

-- Verwijder FK van klanten naar mutualiteiten, daarna de tabel
ALTER TABLE IF EXISTS klanten DROP CONSTRAINT IF EXISTS klanten_mutualiteit_id_fkey;
DROP TABLE IF EXISTS mutualiteiten;
