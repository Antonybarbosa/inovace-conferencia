import { ReactNode } from 'react';
import './Grid.css';

interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Grid({ children, cols = 3, gap = 'md', className = '' }: GridProps) {
  return (
    <div className={`ui-grid ui-grid--cols-${cols} ui-grid--gap-${gap} ${className}`}>
      {children}
    </div>
  );
}

interface GridItemProps {
  children: ReactNode;
  span?: number;
  className?: string;
}

export function GridItem({ children, span, className = '' }: GridItemProps) {
  const style = span ? { gridColumn: `span ${span}` } : undefined;
  return (
    <div className={`ui-grid__item ${className}`} style={style}>
      {children}
    </div>
  );
}
