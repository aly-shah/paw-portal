import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
};

/**
 * Subtle, deterministic CSS enter-animation that runs once on mount.
 * No IntersectionObserver — content is reliably visible for SSR/screenshots.
 */
export const Reveal: React.FC<Props> = ({ children, className = '', delay = 0, as = 'div' }) => {
  const Tag = as as React.ElementType;
  return (
    <Tag className={`reveal-enter ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
};

export default Reveal;
