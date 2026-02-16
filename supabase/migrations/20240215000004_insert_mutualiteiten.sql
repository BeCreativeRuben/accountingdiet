-- Insert mutualiteiten with their specific reimbursement rules
-- Run this AFTER removing tenant isolation (run migration 20240215000002_complete_single_user_setup.sql first)

-- Ensure unique constraint exists on naam (if not already added by migration 20240215000002)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'mutualiteiten_naam_key'
    ) THEN
        ALTER TABLE mutualiteiten ADD CONSTRAINT mutualiteiten_naam_key UNIQUE (naam);
    END IF;
END $$;

-- Insert or update mutualiteiten with their rules
INSERT INTO mutualiteiten (naam, max_sessies_per_jaar, opmerking) VALUES
('Christelijke Mutualiteit (CM)', 4, 'Tegemoetkoming van 40 EUR vanaf 4 sessies per jaar')
ON CONFLICT (naam) DO UPDATE SET max_sessies_per_jaar = 4, opmerking = 'Tegemoetkoming van 40 EUR vanaf 4 sessies per jaar';

INSERT INTO mutualiteiten (naam, max_sessies_per_jaar, opmerking) VALUES
('Liberale Mutualiteit (LM)', 6, 'Tegemoetkoming van 5 EUR per consultatie, max 6 keer per jaar')
ON CONFLICT (naam) DO UPDATE SET max_sessies_per_jaar = 6, opmerking = 'Tegemoetkoming van 5 EUR per consultatie, max 6 keer per jaar';

INSERT INTO mutualiteiten (naam, max_sessies_per_jaar, opmerking) VALUES
('Solidaris', 4, 'Tegemoetkoming van 10 EUR per consultatie, max 4 keer per jaar. Met doktersattest: 8 keer per jaar (aangeven bij klant)')
ON CONFLICT (naam) DO UPDATE SET max_sessies_per_jaar = 4, opmerking = 'Tegemoetkoming van 10 EUR per consultatie, max 4 keer per jaar. Met doktersattest: 8 keer per jaar (aangeven bij klant)';

INSERT INTO mutualiteiten (naam, max_sessies_per_jaar, opmerking) VALUES
('Helan', 1, 'Jaarlijkse terugbetaling van 25 EUR per kalenderjaar')
ON CONFLICT (naam) DO UPDATE SET max_sessies_per_jaar = 1, opmerking = 'Jaarlijkse terugbetaling van 25 EUR per kalenderjaar';

INSERT INTO mutualiteiten (naam, max_sessies_per_jaar, opmerking) VALUES
('Vlaams en Neutraal Ziekenfonds (VNZ)', 5, 'Tegemoetkoming van 10 EUR per consultatie, max 5 keer per jaar (max 50 EUR per jaar)')
ON CONFLICT (naam) DO UPDATE SET max_sessies_per_jaar = 5, opmerking = 'Tegemoetkoming van 10 EUR per consultatie, max 5 keer per jaar (max 50 EUR per jaar)';
