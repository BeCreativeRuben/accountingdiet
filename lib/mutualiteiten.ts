// Vaste lijst mutualiteiten – niet in Supabase. Klanten.mutualiteit_id verwijst naar id (1–5).

import { Mutualiteit } from '@/types';

export const MUTUALITEITEN: Mutualiteit[] = [
  { id: 1, naam: 'Christelijke Mutualiteit (CM)', maxSessiesPerJaar: 4, opmerking: 'Tegemoetkoming van 40 EUR vanaf 4 sessies per jaar' },
  { id: 2, naam: 'Liberale Mutualiteit (LM)', maxSessiesPerJaar: 6, opmerking: 'Tegemoetkoming van 5 EUR per consultatie, max 6 keer per jaar' },
  { id: 3, naam: 'Solidaris', maxSessiesPerJaar: 4, opmerking: 'Tegemoetkoming van 10 EUR per consultatie, max 4 keer per jaar. Met doktersattest: 8 keer per jaar (aangeven bij klant)' },
  { id: 4, naam: 'Helan', maxSessiesPerJaar: 1, opmerking: 'Jaarlijkse terugbetaling van 25 EUR per kalenderjaar' },
  { id: 5, naam: 'Vlaams en Neutraal Ziekenfonds (VNZ)', maxSessiesPerJaar: 5, opmerking: 'Tegemoetkoming van 10 EUR per consultatie, max 5 keer per jaar (max 50 EUR per jaar)' },
];

const byId: Record<number, Mutualiteit> = {};
MUTUALITEITEN.forEach((m) => { byId[m.id] = m; });

export function getMutualiteitById(id: number): Mutualiteit | undefined {
  return byId[id];
}

export function getMutualiteitNaam(id: number): string | null {
  const m = byId[id];
  return m ? m.naam : null;
}
