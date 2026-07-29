import { AuthProvider } from './application/contexts/AuthContext';
import { AppRoutes } from './presentation/routes/AppRoutes';
import './styles/global.css';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
