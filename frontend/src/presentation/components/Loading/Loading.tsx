import './Loading.css';

interface LoadingProps {
  mensagem?: string;
  fullscreen?: boolean;
}

export function Loading({ mensagem = 'Carregando...', fullscreen = false }: LoadingProps) {
  if (fullscreen) {
    return (
      <div className="loading-overlay">
        <div className="loading-card">
          <div className="loading-spinner" />
          <p className="loading-text">{mensagem}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className="loading-spinner" />
      <p className="loading-text">{mensagem}</p>
    </div>
  );
}
