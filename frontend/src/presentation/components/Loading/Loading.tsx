import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './Loading.css';

interface LoadingProps {
  mensagem?: string;
  fullscreen?: boolean;
}

const LOTTIE_URL = 'https://lottie.host/f141a079-702f-4d37-88f7-c91b33722274/yQw3d1y8TG.lottie';

export function Loading({ mensagem = 'Carregando...', fullscreen = false }: LoadingProps) {
  if (fullscreen) {
    return (
      <div className="loading-overlay">
        <div className="loading-card">
          <DotLottieReact src={LOTTIE_URL} autoplay loop style={{ width: '150px', height: '150px' }} />
          <p className="loading-text">{mensagem}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <DotLottieReact src={LOTTIE_URL} autoplay loop style={{ width: '120px', height: '120px' }} />
      <p className="loading-text">{mensagem}</p>
    </div>
  );
}
