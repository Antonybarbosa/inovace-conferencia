import { ReactNode } from 'react';
import './Painel.css';

interface PainelProps {
  children: ReactNode;
  titulo?: string;
  subtitulo?: string;
  acoes?: ReactNode;
  className?: string;
}

export function Painel({ children, titulo, subtitulo, acoes, className = '' }: PainelProps) {
  return (
    <section className={`ui-painel ${className}`}>
      {(titulo || acoes) && (
        <div className="ui-painel__header">
          <div className="ui-painel__titulos">
            {titulo && <h2 className="ui-painel__titulo">{titulo}</h2>}
            {subtitulo && <p className="ui-painel__subtitulo">{subtitulo}</p>}
          </div>
          {acoes && <div className="ui-painel__acoes">{acoes}</div>}
        </div>
      )}
      <div className="ui-painel__conteudo">
        {children}
      </div>
    </section>
  );
}
