import { KeyResult, Objective } from './types';
import { todayISO, todayStr, uid } from './utils';

function kr(text: string, weight: number, progress: number, note?: string): KeyResult {
  return {
    id: uid(),
    text,
    weight,
    progress: progress || 0,
    status: 'on',
    owner: '',
    department: '',
    dependsOn: '',
    project: '',
    history: progress ? [{ date: todayISO(), progress }] : [],
    updates: note ? [{ id: uid(), date: todayStr(), text: note }] : [],
  };
}

function okr(title: string, weight: number, krs: KeyResult[]): Objective {
  return { id: uid(), title, weight, krs, expandedUpdates: {} };
}

export function seedH2_2026(): Objective[] {
  const o1 = okr(
    'Marketing wird zum wichtigsten Wachstumstreiber für Neukunden. — Marketing muss einen signifikanten Beitrag zum Unternehmensziel von 20 Mio. € leisten.',
    40,
    [
      kr('Marketing generiert ≥ 20 Mio. € attribuierten Umsatz bis Ende 2026', 18, 0),
      kr('Performance Marketing steigert den monatlichen Umsatz auf 500.000 € bis 12/26', 10, 0),
      kr('ROAS beträgt kanalübergreifend ≥ 1,4', 7, 0),
      kr(
        'Mindestens 500.000 € des Neukundenumsatzes stammen aus nicht bezahlten Kanälen (SEO, Newsletter, Referral, YT, Social)',
        5,
        0,
        'Aktueller Stand -> Fredrik'
      ),
    ]
  );
  const o2 = okr('Marketing erhöht den Customer Lifetime Value bestehender Kunden. — Marketing endet nicht beim Kauf.', 28, [
    kr('Monatlicher Bestandskundenumsatz wird um mindestens 15 % gesteigert', 17, 0, 'Aktueller Stand -> Fredrik, Vergleich Dez 26/25'),
    kr('Winback-Kampagnen erzielen ≥40 % Reaktivierungsquote', 7, 0, 'Aktueller Stand -> Fredrik'),
    kr('Mindestens 30 % der Kunden kaufen innerhalb von 3 Monaten ein weiteres Produkt', 4, 0),
  ]);
  const o3 = okr(
    'HKCM wird zur sichtbarsten Investmentmarke im deutschsprachigen Raum. — Das zahlt auf langfristiges Wachstum ein.',
    14,
    [
      kr('600 Mio. organische Social-Impressions wurden bis Ende 2026', 3, 0, 'Owner: Creator'),
      kr('Organischer Website-Traffic wurde um 40 % gesteigert', 4, 0, 'Aktueller Stand: 37.000 · Owner: W&U'),
      kr('40.000 neue Newsletter-Abonnenten wurden akquiriert', 7, 0, 'Owner: W&U'),
    ]
  );
  o3.krs[0].department = 'Creator';
  o3.krs[1].department = 'W&U';
  o3.krs[2].department = 'W&U';
  const o4 = okr('Das Marketing arbeitet datengetrieben, effizient und skalierbar. — Das ist die interne Optimierung.', 12, [
    kr('Website-Relaunch erfolgreich abschließen', 3, 0, 'Owner: IT/KI'),
    kr('2 weitere Revenue Streams wurden erfolgreich am Markt platziert', 4, 0, 'Buch/ HKCM Shop'),
    kr('Loyalty Programm wurde vollständig ausgerollt', 4, 0),
    kr(
      'Die Abstimmung zwischen MKT, IT, KI, Buchhaltung, Support und Prod wurde deutlich verbessert',
      1,
      0,
      'wie wird das gemessen? · Owner: alle Abteilungen'
    ),
  ]);
  o4.krs[0].department = 'IT/KI';
  return [o1, o2, o3, o4];
}
