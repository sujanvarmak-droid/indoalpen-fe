import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { restoreSession } from '@/features/auth/authThunks';
import { AppRoutes } from '@/routes/index';
import { MountainLoader } from '@/components/ui/MountainLoader';

export default function App() {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    dispatch(restoreSession()).finally(() => setInitializing(false));
  }, [dispatch]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-muted">
        <MountainLoader size="lg" text="Loading IndoAlpen Verlag..." />
      </div>
    );
  }

  return <AppRoutes />;
}
