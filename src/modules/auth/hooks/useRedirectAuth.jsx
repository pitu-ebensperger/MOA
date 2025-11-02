import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth.jsx';
import { ROUTES } from '../../../routes/routes.js';

export function useRedirectAfterAuth() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const go = () => {
    if (isAdmin) navigate(ROUTES.admin.dashboard, { replace: true });
    else navigate(from || ROUTES.profile, { replace: true });
  };

  return go;
}
