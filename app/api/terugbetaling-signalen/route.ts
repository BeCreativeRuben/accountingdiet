import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { getMutualiteitById } from '@/lib/mutualiteiten';
import * as store from '@/lib/store';
import { TerugbetalingSignaal } from '@/types';

export async function GET(request: NextRequest) {
  const auth = authenticateToken(request);
  if (!auth.authenticated) {
    return auth.response!;
  }

  const currentYear = new Date().getFullYear();
  const yearStart = `${currentYear}-01-01`;
  const yearEnd = `${currentYear + 1}-01-01`;

  const klanten = store.getKlanten();
  if (!klanten.length) {
    return NextResponse.json([]);
  }

  const mutById: Record<number, ReturnType<typeof getMutualiteitById>> = {};
  klanten.forEach((k) => {
    if (k.mutualiteit_id) {
      const m = getMutualiteitById(k.mutualiteit_id);
      if (m) mutById[k.mutualiteit_id] = m;
    }
  });

  const afspraken = store.getAfspraken().filter(
    (a) => a.terugbetaalbaar && a.datum >= yearStart && a.datum < yearEnd
  );
  const countByKlant: Record<number, number> = {};
  afspraken.forEach((a) => {
    countByKlant[a.klant_id] = (countByKlant[a.klant_id] || 0) + 1;
  });

  const out: TerugbetalingSignaal[] = [];

  for (const k of klanten) {
    if (!k.mutualiteit_id) continue;
    const mut = mutById[k.mutualiteit_id];
    if (!mut) continue;

    const sessies = countByKlant[k.id] || 0;
    const mutNaam = mut.naam.toLowerCase();
    let melding: string | null = null;
    let resterend: number | null = null;

    if (mutNaam.includes('christelijk') || mutNaam === 'cm') {
      if (sessies >= 4) melding = 'Tegemoetkoming van 40 EUR';
    } else if (mutNaam.includes('liberaal') || mutNaam === 'lm') {
      const max = 6;
      if (sessies > 0 && sessies <= max) {
        resterend = max - sessies;
        melding = `Tegemoetkoming van 5 EUR per consultatie. Nog ${resterend} keer recht op terugbetaling dit jaar.`;
      }
    } else if (mutNaam.includes('solidaris')) {
      const max = k.solidaris_uitzondering ? 8 : 4;
      if (sessies > 0 && sessies <= max) {
        resterend = max - sessies;
        const uitzonderingText = k.solidaris_uitzondering ? ' (met doktersattest)' : '';
        melding = `Tegemoetkoming van 10 EUR per consultatie${uitzonderingText}. Nog ${resterend} keer recht op terugbetaling dit jaar.`;
      }
    } else if (mutNaam.includes('helan')) {
      if (sessies === 1) melding = 'Jaarlijkse terugbetaling van 25 EUR per kalenderjaar';
    } else if (mutNaam.includes('vlaams') || mutNaam.includes('neutraal') || mutNaam === 'vnz') {
      const max = 5;
      if (sessies > 0 && sessies <= max) {
        resterend = max - sessies;
        melding = `Tegemoetkoming van 10 EUR per consultatie. Nog ${resterend} keer recht op terugbetaling dit jaar.`;
      }
    }

    if (melding) {
      out.push({
        klant_id: k.id,
        voornaam: k.voornaam,
        achternaam: k.achternaam,
        mutualiteit_naam: mut.naam,
        sessies_terugbetaalbaar: sessies,
        melding,
        resterend
      });
    }
  }

  return NextResponse.json(out);
}
