import LogoutButton from '../../components/LogoutButton';
import styles from './okrs.module.css';
import { NAV_ITEMS } from './constants';

export default function TopNav() {
  return (
    <div className={styles.topNav}>
      <div className={styles.topNavLeft}>
        <span className={styles.brand}>OKR Command Center</span>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <span key={item} className={`${styles.navItem} ${item === 'Cockpit' ? styles.navItemActive : ''}`}>
              {item}
            </span>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className={styles.reviewBtn}>
          Start OKR Review
        </button>
        <LogoutButton />
      </div>
    </div>
  );
}
