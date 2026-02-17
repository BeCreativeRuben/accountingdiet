/**
 * API test script: login, klanten, consulttype, afspraken, terugbetaling-signalen, dashboard.
 * Run: node scripts/test-api.mjs
 */
const BASE = 'http://localhost:3000';
const TOKEN = process.env.SECRET_TOKEN || 'Rubyrub123';
const thisYear = new Date().getFullYear();

const auth = () => ({ Authorization: `Bearer ${TOKEN}` });

async function main() {
  console.log('1. Login...');
  const loginRes = await fetch(`${BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: TOKEN }),
  });
  if (!loginRes.ok) {
    console.error('Login failed:', loginRes.status, await loginRes.text());
    process.exit(1);
  }
  const login = await loginRes.json();
  console.log('   OK', login);

  console.log('\n2. Consulttype aanmaken...');
  const ctRes = await fetch(`${BASE}/api/consulttypes`, {
    method: 'POST',
    headers: { ...auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'Eerste consult', prijs: 50 }),
  });
  const ct = await ctRes.json();
  if (ct.error) {
    console.log('   (bestaat al of fout)', ct);
  } else {
    console.log('   OK', ct);
  }

  console.log('\n3. Klanten aanmaken...');
  const k1Res = await fetch(`${BASE}/api/klanten`, {
    method: 'POST',
    headers: { ...auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voornaam: 'Jan', achternaam: 'Janssen', email: 'jan@test.be',
      mutualiteit_id: 3, solidaris_uitzondering: false,
    }),
  });
  const k1 = await k1Res.json();
  console.log('   Klant 1:', k1.id ? `id=${k1.id}` : k1);

  const k2Res = await fetch(`${BASE}/api/klanten`, {
    method: 'POST',
    headers: { ...auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voornaam: 'Marie', achternaam: 'Peeters', email: 'marie@test.be',
      mutualiteit_id: 2,
    }),
  });
  const k2 = await k2Res.json();
  console.log('   Klant 2:', k2.id ? `id=${k2.id}` : k2);

  const klantId1 = k1.id || 1;
  const klantId2 = k2.id || 2;

  console.log('\n4. Afspraken aanmaken (FormData) – datum in huidig jaar voor terugbetaling...');
  const typeId = ct.id || 1;
  const datum1 = `${thisYear}-02-10`;
  const datum2 = `${thisYear}-02-14`;

  const fd1 = new FormData();
  fd1.set('datum', datum1);
  fd1.set('klant_id', String(klantId1));
  fd1.set('type_id', String(typeId));
  fd1.set('aantal', '1');
  fd1.set('terugbetaalbaar', 'true');
  fd1.set('opmerking', 'Test afspraak Jan');

  const a1Res = await fetch(`${BASE}/api/afspraken`, {
    method: 'POST',
    headers: auth(),
    body: fd1,
  });
  const a1 = await a1Res.json();
  if (a1.error) {
    console.log('   Afspraak 1 fout:', a1);
  } else {
    console.log('   Afspraak 1 OK, id=', a1.id, 'datum=', datum1);
  }

  const fd2 = new FormData();
  fd2.set('datum', datum2);
  fd2.set('klant_id', String(klantId2));
  fd2.set('type_id', String(typeId));
  fd2.set('aantal', '1');
  fd2.set('terugbetaalbaar', 'true');

  const a2Res = await fetch(`${BASE}/api/afspraken`, {
    method: 'POST',
    headers: auth(),
    body: fd2,
  });
  const a2 = await a2Res.json();
  if (a2.error) {
    console.log('   Afspraak 2 fout:', a2);
  } else {
    console.log('   Afspraak 2 OK, id=', a2.id);
  }

  console.log('\n5. Terugbetaling-signalen ophalen...');
  const sigRes = await fetch(`${BASE}/api/terugbetaling-signalen`, { headers: auth() });
  const signalen = await sigRes.json();
  console.log('   Aantal signalen:', signalen.length);
  signalen.forEach((s, i) => {
    console.log(`   [${i + 1}] ${s.voornaam} ${s.achternaam} (${s.mutualiteit_naam}): ${s.melding}`);
  });

  console.log('\n6. Dashboard ophalen...');
  const dashRes = await fetch(`${BASE}/api/dashboard`, { headers: auth() });
  const dash = await dashRes.json();
  console.log('   Dashboard:', JSON.stringify(dash, null, 2).slice(0, 500) + '...');

  console.log('\n7. Afsprakenlijst ophalen...');
  const afsRes = await fetch(`${BASE}/api/afspraken`, { headers: auth() });
  const afspraken = await afsRes.json();
  console.log('   Aantal afspraken:', afspraken.length);

  console.log('\n8. Klantenlijst ophalen...');
  const klRes = await fetch(`${BASE}/api/klanten`, { headers: auth() });
  const klanten = await klRes.json();
  console.log('   Aantal klanten:', klanten.length);

  console.log('\n9. Uitgave toevoegen...');
  const uitRes = await fetch(`${BASE}/api/uitgaven`, {
    method: 'POST',
    headers: { ...auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      datum: `${thisYear}-02-01`,
      beschrijving: 'Test uitgave kantoor',
      bedrag: 25.5,
      betaalmethode: 'Bancontact',
    }),
  });
  const uit = await uitRes.json();
  if (uit.error) console.log('   Fout:', uit.error);
  else console.log('   OK, id=', uit.id);

  console.log('\n10. Maandoverzicht ophalen...');
  const maandRes = await fetch(`${BASE}/api/maandoverzicht`, { headers: auth() });
  const maand = await maandRes.json();
  console.log('   Maandoverzicht:', JSON.stringify(maand).slice(0, 300));

  console.log('\n--- Test afgerond ---');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
