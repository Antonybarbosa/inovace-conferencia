import { InputHTMLAttributes, forwardRef } from 'react';
import { Label } from '../Label/Label';
import './Campo.css';

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  variant?: 'default' | 'scanner' | 'compact';
  error?: string;
}

export const Campo = forwardRef<HTMLInputElement, CampoProps>(
  ({ label, variant = 'default', error, className = '', id, ...props }, ref) => {
    const inputId = id || `campo-${label?.replace(/\s/g, '-').toLowerCase()}`;

    return (
      <div className={`ui-campo ui-campo--${variant} ${error ? 'ui-campo--error' : ''} ${className}`}>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <input
          ref={ref}
          id={inputId}
          className="ui-campo__input"
          {...props}
        />
        {error && <span className="ui-campo__error">{error}</span>}
      </div>
    );
  }
);

Campo.displayName = 'Campo';
