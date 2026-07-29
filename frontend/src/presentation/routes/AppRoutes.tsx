import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/Login';
import { ListaConferenciasPage } from '../pages/ListaConferencias';
import { ConferenciaProdutosPage } from '../pages/ConferenciaProdutos';
import { PrivateRoute } from './PrivateRoute';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/conferencias"
          element={
            <PrivateRoute>
              <ListaConferenciasPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/conferencias/:nunota"
          element={
            <PrivateRoute>
              <ConferenciaProdutosPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/conferencias" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
