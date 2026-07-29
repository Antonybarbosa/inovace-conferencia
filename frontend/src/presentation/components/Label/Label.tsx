import { ReactNode } from 'react';
import './Label.css';

interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  variant?: 'default' | 'caption' | 'title' | 'value';
  className?: string;
}

export function Label({ children, htmlFor, variant = 'default', className = '' }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`ui-label ui-label--${variant} ${className}`}
    >
      {children}
    </label>
  );
}
