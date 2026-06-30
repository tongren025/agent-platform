import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { userToken, userAuth } from '../userAuth';

export default function UserAuthGuard() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    if (!userToken.get()) {
      setStatus('denied');
      return;
    }
    userAuth.check().then((valid) => setStatus(valid ? 'ok' : 'denied'));
  }, []);

  if (status === 'loading') return null;
  if (status === 'denied') return <Navigate to="/login" replace />;
  return <Outlet />;
}
