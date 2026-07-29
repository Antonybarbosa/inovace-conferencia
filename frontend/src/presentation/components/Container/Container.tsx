import { ReactNode } from 'react';
import './Container.css';

interface ContainerProps {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'highlighted' | 'scanner';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function Container({ children, variant = 'default', padding = 'md', className = '' }: ContainerProps) {
  return (
    <div className={`ui-container ui-container--${variant} ui-container--pad-${padding} ${className}`}>
      {children}
    </div>
  );
}
