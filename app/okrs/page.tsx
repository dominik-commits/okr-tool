import LogoutButton from '../../components/LogoutButton';
import OkrTracker from './OkrTracker';

export default function Page() {
  return (
    <>
      <OkrTracker />
      <div style={{ position: 'fixed', top: 20, right: 20 }}>
        <LogoutButton />
      </div>
    </>
  );
}
