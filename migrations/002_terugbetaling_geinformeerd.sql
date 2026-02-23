-- Terugbetaling: markeer per klant per jaar of de klant op de hoogte is gesteld
CREATE TABLE IF NOT EXISTS terugbetaling_geinformeerd (
  klant_id integer NOT NULL REFERENCES klanten(id) ON DELETE CASCADE,
  jaar integer NOT NULL,
  PRIMARY KEY (klant_id, jaar)
);

CREATE INDEX IF NOT EXISTS idx_terugbetaling_geinformeerd_jaar ON terugbetaling_geinformeerd(jaar);
