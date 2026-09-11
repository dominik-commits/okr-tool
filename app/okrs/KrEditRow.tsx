import styles from './okrs.module.css';
import { KR_TYPE_OPTIONS, NUMERIC_KR_TYPES } from './constants';
import { KeyResult, KrType } from './types';
import { parseGermanNumber } from './utils';

interface KrEditRowProps {
  kr: KeyResult;
  onChange: (patch: Partial<KeyResult>) => void;
  onDelete: () => void;
}

export default function KrEditRow({ kr, onChange, onDelete }: KrEditRowProps) {
  const isNumeric = NUMERIC_KR_TYPES.includes(kr.krType);

  function handleKrTypeChange(krType: KrType) {
    const stillNumeric = NUMERIC_KR_TYPES.includes(krType);
    onChange(stillNumeric ? { krType } : { krType, currentValue: null, targetValue: null, baselineValue: null });
  }

  return (
    <div className={styles.krEditRow}>
      <div className={styles.krEditTopRow}>
        <input
          type="text"
          className={`${styles.formInput} ${styles.krEditTitle}`}
          value={kr.text}
          placeholder="Key Result"
          onChange={(e) => onChange({ text: e.target.value })}
        />
        <select
          className={`${styles.formInput} ${styles.krEditType}`}
          value={kr.krType}
          onChange={(e) => handleKrTypeChange(e.target.value as KrType)}
        >
          {KR_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className={styles.krEditWeight}>
          <input
            type="number"
            min={0}
            max={100}
            className={styles.formInput}
            value={kr.weight}
            onChange={(e) => onChange({ weight: Number(e.target.value) || 0 })}
          />
          <span>%</span>
        </div>
        <button type="button" className={styles.krDel} title="Entfernen" onClick={onDelete}>
          ×
        </button>
      </div>

      <div className={styles.krEditShortTitleRow}>
        <input
          type="text"
          className={styles.formInput}
          value={kr.shortTitle}
          placeholder="Kurzbezeichnung fürs Cockpit, z. B. „ROAS“"
          onChange={(e) => onChange({ shortTitle: e.target.value })}
        />
      </div>

      <div className={styles.krEditValuesRow}>
        <div className={styles.krEditValueGroup}>
          <label className={styles.formLabel}>Baseline</label>
          <input
            type="text"
            className={styles.formInput}
            value={kr.baseline}
            placeholder="z. B. 0 € oder Konzeptphase"
            onChange={(e) => onChange({ baseline: e.target.value, baselineValue: isNumeric ? parseGermanNumber(e.target.value) : kr.baselineValue })}
          />
          {isNumeric && (
            <input
              type="number"
              className={styles.formInput}
              value={kr.baselineValue ?? ''}
              placeholder="Zahlenwert"
              onChange={(e) => onChange({ baselineValue: e.target.value === '' ? null : Number(e.target.value) })}
            />
          )}
        </div>
        <div className={styles.krEditValueGroup}>
          <label className={styles.formLabel}>Target</label>
          <input
            type="text"
            className={styles.formInput}
            value={kr.target}
            placeholder="z. B. 20 Mio. € oder Live"
            onChange={(e) => onChange({ target: e.target.value, targetValue: isNumeric ? parseGermanNumber(e.target.value) : kr.targetValue })}
          />
          {isNumeric && (
            <input
              type="number"
              className={styles.formInput}
              value={kr.targetValue ?? ''}
              placeholder="Zahlenwert"
              onChange={(e) => onChange({ targetValue: e.target.value === '' ? null : Number(e.target.value) })}
            />
          )}
        </div>
      </div>

      <div className={styles.krEditMetaRow}>
        <div className={styles.krEditMetaField}>
          <label className={styles.formLabel}>Owner</label>
          <input type="text" className={styles.formInput} value={kr.owner} onChange={(e) => onChange({ owner: e.target.value })} />
        </div>
        <div className={styles.krEditMetaField}>
          <label className={styles.formLabel}>Abteilung</label>
          <input
            type="text"
            className={styles.formInput}
            value={kr.department}
            list="deptList"
            onChange={(e) => onChange({ department: e.target.value })}
          />
        </div>
        <div className={styles.krEditMetaField}>
          <label className={styles.formLabel}>Abhängig von</label>
          <input type="text" className={styles.formInput} value={kr.dependsOn} onChange={(e) => onChange({ dependsOn: e.target.value })} />
        </div>
        <div className={styles.krEditMetaField}>
          <label className={styles.formLabel}>Projekt / Kampagne</label>
          <input type="text" className={styles.formInput} value={kr.project} onChange={(e) => onChange({ project: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
