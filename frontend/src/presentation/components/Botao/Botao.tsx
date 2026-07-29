import { ButtonHTMLAttributes, ReactNode } from 'react';
import './Botao.css';

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export function Botao({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}: BotaoProps) {
  return (
    <button
      className={`ui-botao ui-botao--${variant} ui-botao--${size} ${fullWidth ? 'ui-botao--full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="ui-botao__spinner" /> : children}
    </button>
  );
}
