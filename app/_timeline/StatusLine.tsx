import styles from './timeline.module.css';
import { SWIMLANES } from './constants';
import { VacationEntry } from './types';
import { countOverlapPairs, entriesOfTypes } from './utils';

interface StatusLineProps {
  entries: VacationEntry[];
}

export default function StatusLine({ entries }: StatusLineProps) {
  const campaigns = entriesOfTypes(entries, ['l1']).length;
  const initiatives = entriesOfTypes(entries, ['l2', 'l3', 'l4']).length;
  const special = entriesOfTypes(entries, ['vacation', 'project']).length;
  const overlaps = SWIMLANES.reduce((sum, lane) => sum + countOverlapPairs(entriesOfTypes(entries, lane.types)), 0);

  return (
    <div className={styles.statusLine}>
      {campaigns} aktive Kampagnen · {initiatives} Initiativen/Aktionen/Maßnahmen · {special} Sonderzeiträume
      {overlaps > 0 ? ` · ${overlaps} Überschneidung${overlaps === 1 ? '' : 'en'}` : ''}
    </div>
  );
}
