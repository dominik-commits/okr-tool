import { Confidence, Initiative, KeyResult, KrType, Objective, ProgressHistoryEntry, UpdateEntry } from './types';
import { isoToDe, uid } from './utils';

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function history(points: Array<[daysAgo: number, progress: number]>): ProgressHistoryEntry[] {
  return points.map(([daysAgo, progress]) => ({ date: daysAgoISO(daysAgo), progress }));
}

function update(daysAgo: number, text: string): UpdateEntry[] {
  return [{ id: uid(), date: isoToDe(daysAgoISO(daysAgo)), text }];
}

interface KrSeed {
  text: string;
  weight: number;
  krType: KrType;
  current: string;
  currentValue: number | null;
  target: string;
  targetValue: number | null;
  baseline?: string;
  baselineValue?: number | null;
  progress?: number;
  confidence: Confidence;
  owner?: string;
  department?: string;
  blocker?: string;
  nextAction?: string;
  initiatives?: Initiative[];
  history?: ProgressHistoryEntry[];
  updates?: UpdateEntry[];
}

function kr(seed: KrSeed): KeyResult {
  return {
    id: uid(),
    text: seed.text,
    weight: seed.weight,
    progress: seed.progress ?? 0,
    owner: seed.owner ?? '',
    department: seed.department ?? '',
    dependsOn: '',
    project: '',
    history: seed.history ?? [],
    updates: seed.updates ?? [],
    krType: seed.krType,
    current: seed.current,
    currentValue: seed.currentValue,
    target: seed.target,
    targetValue: seed.targetValue,
    baseline: seed.baseline ?? '',
    baselineValue: seed.baselineValue ?? null,
    confidence: seed.confidence,
    blocker: seed.blocker ?? '',
    nextAction: seed.nextAction ?? '',
    initiatives: seed.initiatives ?? [],
  };
}

function okr(title: string, weight: number, owner: string, krs: KeyResult[]): Objective {
  return { id: uid(), title, weight, owner, krs, expandedUpdates: {} };
}

export function seedH2_2026(): Objective[] {
  const o1 = okr(
    'Marketing wird zum wichtigsten Wachstumstreiber für Neukunden. — Marketing muss einen signifikanten Beitrag zum Unternehmensziel von 20 Mio. € leisten.',
    40,
    'Dominik Kümmel',
    [
      kr({
        text: 'Marketing generiert ≥ 20 Mio. € attribuierten Umsatz bis Ende 2026',
        weight: 18,
        krType: 'numeric_increase',
        current: '9,0 Mio. €',
        currentValue: 9.0,
        target: '20 Mio. €',
        targetValue: 20,
        baseline: '0 €',
        baselineValue: 0,
        confidence: 'Medium',
        owner: 'Dominik',
        department: 'Marketing',
        nextAction: 'Q4-Kampagnenplanung mit Performance-Team abstimmen.',
        history: history([
          [40, 22],
          [26, 31],
          [10, 40],
          [2, 45],
        ]),
        updates: update(2, 'Umsatz zieht mit Sommerkampagnen spürbar an.'),
      }),
      kr({
        text: 'Performance Marketing steigert den monatlichen Umsatz auf 500.000 € bis 12/26',
        weight: 10,
        krType: 'numeric_increase',
        current: '225.000 €',
        currentValue: 225000,
        target: '500.000 €',
        targetValue: 500000,
        baseline: '0 €',
        baselineValue: 0,
        confidence: 'High',
        owner: 'Amir',
        department: 'Performance Marketing',
        nextAction: 'Skalierung Google Search im Oktober fortsetzen.',
        history: history([
          [35, 24],
          [21, 33],
          [8, 40],
          [1, 45],
        ]),
        updates: update(1, 'Google Search Restructure zeigt erste positive Effekte.'),
      }),
      kr({
        text: 'ROAS beträgt kanalübergreifend ≥ 1,4',
        weight: 7,
        krType: 'numeric_increase',
        current: '1,11',
        currentValue: 1.11,
        target: '1,40',
        targetValue: 1.4,
        baseline: '1,00',
        baselineValue: 1.0,
        confidence: 'Low',
        owner: 'Amir',
        department: 'Performance Marketing',
        blocker: 'Creative Fatigue auf den größten Meta-Kampagnen.',
        nextAction: 'Neue Creative-Batches bis 18.09. live schalten.',
        initiatives: [
          { name: 'Meta Creative Scaling', status: 'In Progress' },
          { name: 'CRO Landingpages', status: 'Planned' },
        ],
        history: history([
          [21, 40],
          [14, 34],
          [7, 30],
          [1, 27],
        ]),
        updates: update(1, 'ROAS sinkt seit drei Updates in Folge, Creatives ermüden sichtbar.'),
      }),
      kr({
        text: 'Mindestens 500.000 € des Neukundenumsatzes stammen aus nicht bezahlten Kanälen (SEO, Newsletter, Referral, YT, Social)',
        weight: 5,
        krType: 'numeric_increase',
        current: '230.000 €',
        currentValue: 230000,
        target: '500.000 €',
        targetValue: 500000,
        baseline: '0 €',
        baselineValue: 0,
        confidence: 'High',
        owner: 'Fredrik',
        department: 'Content / Redaktion',
        nextAction: 'SEO-Content-Kalender für Q4 finalisieren.',
        history: history([
          [30, 26],
          [16, 34],
          [6, 41],
          [1, 46],
        ]),
        updates: update(1, 'Organischer Traffic aus SEO-Content wächst planmäßig.'),
      }),
    ]
  );

  const o2 = okr(
    'Marketing erhöht den Customer Lifetime Value bestehender Kunden. — Marketing endet nicht beim Kauf.',
    28,
    'Fredrik',
    [
      kr({
        text: 'Monatlicher Bestandskundenumsatz wird um mindestens 15 % gesteigert',
        weight: 17,
        krType: 'percentage',
        current: '+6,5 %',
        currentValue: 6.5,
        target: '+15 %',
        targetValue: 15,
        baseline: '0 %',
        baselineValue: 0,
        confidence: 'High',
        owner: 'Fredrik',
        department: 'CRM / E-Mail',
        nextAction: 'Winback-Segment auf E-Mail-Flow 2 ausweiten.',
        history: history([
          [28, 20],
          [15, 30],
          [6, 38],
          [1, 43],
        ]),
        updates: update(1, 'Vergleich Sep 26/25: CRM-Flows greifen wie geplant.'),
      }),
      kr({
        text: 'Winback-Kampagnen erzielen ≥ 40 % Reaktivierungsquote',
        weight: 7,
        krType: 'percentage',
        current: '12 %',
        currentValue: 12,
        target: '40 %',
        targetValue: 40,
        baseline: '0 %',
        baselineValue: 0,
        confidence: 'Medium',
        owner: 'Fredrik',
        department: 'CRM / E-Mail',
        blocker: 'Offer-Mechanik wird aktuell A/B-getestet.',
        nextAction: 'Testergebnis bis 22.09. auswerten.',
        initiatives: [{ name: 'Winback Offer-Test', status: 'In Progress' }],
        history: history([
          [24, 18],
          [12, 24],
          [4, 30],
        ]),
        updates: update(4, 'A/B-Test für Winback-Angebot läuft, Ergebnis Ende September.'),
      }),
      kr({
        text: 'Mindestens 30 % der Kunden kaufen innerhalb von 3 Monaten ein weiteres Produkt',
        weight: 4,
        krType: 'percentage',
        current: '8 %',
        currentValue: 8,
        target: '30 %',
        targetValue: 30,
        baseline: '0 %',
        baselineValue: 0,
        confidence: 'Medium',
        owner: 'Fredrik',
        department: 'Produkt',
        nextAction: 'Cross-Sell-Modul im Checkout testen.',
        history: history([
          [20, 15],
          [9, 20],
          [3, 27],
        ]),
        updates: update(3, 'Cross-Sell-Test im Checkout ist in Vorbereitung.'),
      }),
    ]
  );

  const o3 = okr(
    'HKCM wird zur sichtbarsten Investmentmarke im deutschsprachigen Raum. — Das zahlt auf langfristiges Wachstum ein.',
    14,
    'Creator / W&U',
    [
      kr({
        text: '600 Mio. organische Social-Impressions wurden bis Ende 2026 erzielt',
        weight: 3,
        krType: 'numeric_increase',
        current: '468 Mio.',
        currentValue: 468,
        target: '600 Mio.',
        targetValue: 600,
        baseline: '0',
        baselineValue: 0,
        confidence: 'High',
        owner: 'Creator-Team',
        department: 'Creator',
        nextAction: 'Format-Mix beibehalten, Frequenz leicht erhöhen.',
        initiatives: [{ name: 'Creator Content Sprint', status: 'In Progress' }],
        history: history([
          [30, 40],
          [17, 58],
          [7, 70],
          [1, 78],
        ]),
        updates: update(1, 'Reichweite entwickelt sich deutlich über Plan.'),
      }),
      kr({
        text: 'Organischer Website-Traffic wurde um 40 % gesteigert',
        weight: 4,
        krType: 'numeric_increase',
        current: '36.000',
        currentValue: 36000,
        target: '44.100',
        targetValue: 44100,
        baseline: '31.500',
        baselineValue: 31500,
        confidence: 'Medium',
        owner: 'W&U',
        department: 'W&U',
        nextAction: 'Zwei weitere Pillar-Pages im September veröffentlichen.',
        initiatives: [{ name: 'SEO Content Sprint', status: 'In Progress' }],
        history: history([
          [24, 15],
          [12, 24],
          [4, 33],
          [1, 36],
        ]),
        updates: update(1, 'Traffic wächst mit neuen Pillar-Pages.'),
      }),
      kr({
        text: '40.000 neue Newsletter-Abonnenten wurden akquiriert',
        weight: 7,
        krType: 'numeric_increase',
        current: '15.000',
        currentValue: 15000,
        target: '40.000',
        targetValue: 40000,
        baseline: '0',
        baselineValue: 0,
        confidence: 'High',
        owner: 'W&U',
        department: 'W&U',
        nextAction: 'Lead-Magnet-Test auf Top-Landingpages ausrollen.',
        initiatives: [{ name: 'Newsletter Growth Loop', status: 'In Progress' }],
        history: history([
          [26, 22],
          [13, 30],
          [5, 35],
          [1, 38],
        ]),
        updates: update(1, 'Lead-Magnet performt gut auf den Top-Landingpages.'),
      }),
    ]
  );

  const o4 = okr(
    'Das Marketing arbeitet datengetrieben, effizient und skalierbar. — Das ist die interne Optimierung.',
    12,
    'IT / KI',
    [
      kr({
        text: 'Website-Relaunch erfolgreich abschließen',
        weight: 3,
        krType: 'milestone',
        current: 'Phase 2 / 4',
        currentValue: null,
        target: 'Live',
        targetValue: null,
        progress: 18,
        confidence: 'Low',
        owner: 'IT/KI',
        department: 'IT/KI',
        blocker: 'Wartet auf Freigabe des neuen Design-Systems.',
        nextAction: 'Freigabe-Termin mit Design diese Woche fixieren.',
        initiatives: [{ name: 'Website Relaunch', status: 'Blocked' }],
        history: history([
          [24, 10],
          [12, 14],
          [4, 18],
        ]),
        updates: update(9, 'Design-Freigabe steht weiterhin aus, Zeitplan wackelt.'),
      }),
      kr({
        text: '2 weitere Revenue Streams wurden erfolgreich am Markt platziert',
        weight: 4,
        krType: 'milestone',
        current: '1 / 2',
        currentValue: null,
        target: '2 / 2',
        targetValue: null,
        progress: 50,
        confidence: 'Medium',
        owner: 'Dominik',
        department: 'Marketing',
        nextAction: 'HKCM Shop Soft-Launch für Oktober vorbereiten.',
        initiatives: [{ name: 'HKCM Shop Launch', status: 'In Progress' }],
        history: history([
          [20, 25],
          [10, 40],
          [4, 50],
        ]),
        updates: update(4, 'HKCM Shop befindet sich in der Soft-Launch-Vorbereitung.'),
      }),
      kr({
        text: 'Loyalty Programm wurde vollständig ausgerollt',
        weight: 4,
        krType: 'milestone',
        current: 'Konzeptphase',
        currentValue: null,
        target: 'Live',
        targetValue: null,
        progress: 12,
        confidence: 'Low',
        owner: 'Produkt',
        department: 'Produkt',
        blocker: 'Priorität liegt aktuell beim Website-Relaunch.',
        nextAction: 'Ressourcen nach Relaunch-Abschluss neu einplanen.',
        initiatives: [{ name: 'Loyalty Programm', status: 'Blocked' }],
        history: history([
          [26, 8],
          [14, 10],
          [11, 12],
        ]),
        updates: update(11, 'Konzept liegt vor, Umsetzung pausiert wegen Relaunch-Priorität.'),
      }),
      kr({
        text: 'Die Abstimmung zwischen MKT, IT, KI, Buchhaltung, Support und Prod wurde deutlich verbessert',
        weight: 1,
        krType: 'milestone',
        current: '—',
        currentValue: null,
        target: '—',
        targetValue: null,
        progress: 0,
        confidence: 'Medium',
        owner: 'Alle Abteilungen',
        department: '',
        nextAction: 'Messmethode gemeinsam mit allen Abteilungen festlegen.',
      }),
    ]
  );

  return [o1, o2, o3, o4];
}
