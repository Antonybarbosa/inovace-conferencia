import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../application/contexts/AuthContext';
import { Botao, Campo } from '../components';

export function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(usuario, senha);
      navigate('/conferencias');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Painel escuro */}
        <div className="login-panel-dark">
          <div className="login-brand">
            <div className="login-brand-logo">
              <div className="login-brand-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M9 17H5a2 2 0 0 0-2 2v1h18v-1a2 2 0 0 0-2-2h-4"/>
                  <path d="M12 17V3"/>
                  <path d="m8 7 4-4 4 4"/>
                  <rect x="7" y="11" width="10" height="6" rx="1"/>
                </svg>
              </div>
              <span>Confer<span style={{color: 'var(--orange-500)'}}>Check</span></span>
            </div>
            <h2>
              Controle total da sua<br/>
              <span>conferência de saída.</span>
            </h2>
            <p>Sistema de conferência cega integrado ao Sankhya para gestão de expedição em tempo real.</p>
          </div>
          <div className="login-footer-dark">
            © 2026 ConferCheck. Integrado ao ERP Sankhya.
          </div>
        </div>

        {/* Painel do formulário */}
        <div className="login-panel-form">
          <h1 className="login-title">Acessar Sistema</h1>
          <p className="login-subtitle">Insira suas credenciais do Sankhya para continuar.</p>

          <form onSubmit={handleSubmit}>
            <Campo
              label="Usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ex: VICTOR.D"
              autoComplete="username"
              required
              autoFocus
            />

            <div style={{ marginTop: 20 }}>
              <Campo
                label="Senha de acesso"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                error={error || undefined}
              />
            </div>

            <div style={{ marginTop: 28 }}>
              <Botao type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Entrar no Sistema
              </Botao>
            </div>
          </form>

          <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--slate-100)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)' }}>
              Problemas com o acesso?<br/>
              <strong style={{ color: 'var(--slate-900)' }}>Contate o Supervisor</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
