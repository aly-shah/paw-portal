import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  interactive = false,
  padded = true,
  className = '',
  children,
  ...props
}) => (
  <div
    className={`bg-white border border-slate-200 rounded-xl shadow-elevation-1
      ${padded ? 'p-6' : ''}
      ${interactive ? 'transition-all hover:-translate-y-0.5 hover:shadow-elevation-2' : ''}
      ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
