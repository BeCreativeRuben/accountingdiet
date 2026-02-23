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
  const currentYM = `${currentYear}`;

  /** Bepaal of datum in het huidige jaar valt (ook bij andere datumformaten). */
  const inCurrentYear = (dateStr: string | null): boolean => {
    if (!dateStr) return false;
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
    if (iso) return iso[1] === currentYM;
    const d = new Date(dateStr);
    return !Number.isNaN(d.getTime()) && d.getFullYear() === currentYear;
  };

  const klanten = await store.getKlanten();
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

  const afspraken = (await store.getAfspraken()).filter(
    (a) => a.terugbetaalbaar && (inCurrentYear(a.datum) || inCurrentYear(a.maand))
  );
  const countByKlant: Record<number, number> = {};
  afspraken.forEach((a) => {
    countByKlant[a.klant_id] = (countByKlant[a.klant_id] || 0) + 1;
  });

  const geinformeerdSet = await store.getTerugbetalingGeinformeerdKlantIds(currentYear);
  const out: TerugbetalingSignaal[] = [];

  for (const k of klanten) {
    if (!k.mutualiteit_id) continue;
    const mut = mutById[k.mutualiteit_id];
    if (!mut) continue;

    const sessies = countByKlant[k.id] || 0;
    const mutNaam = mut.naam.toLowerCase();
    let melding: string | null = null;
    let resterend: number | null = null;

    if (mutNaam.includes('christelijk') || mutNaam.includes('(cm)') || mutNaam === 'cm') {
      if (sessies >= 4) {
        melding = 'Tegemoetkoming van 40 EUR';
      } else if (sessies > 0) {
        const nog = 4 - sessies;
        melding = `Nog ${nog} sessie${nog === 1 ? '' : 's'} nodig voor tegemoetkoming van 40 EUR (vanaf 4 per jaar).`;
      }
    } else if (mutNaam.includes('liberaal') || mutNaam.includes('liberale') || mutNaam.includes('(lm)')) {
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
        resterend,
        klant_geinformeerd: geinformeerdSet.has(k.id)
      });
    }
  }

  return NextResponse.json(out);
}
