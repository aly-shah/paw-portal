import React from 'react';

export const Eyebrow: React.FC<{ children: React.ReactNode; number?: string; tone?: 'dark' | 'light' }> = ({
  children,
  number,
  tone = 'dark',
}) => {
  const light = tone === 'light';
  return (
    <div className={`inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] ${light ? 'text-white/70' : 'text-[var(--ed-muted)]'}`}>
      {number && (
        <span className={`ed-mono text-[10px] ${light ? 'text-[var(--ed-accent-soft)]' : 'text-[var(--ed-accent)]'}`}>{number}</span>
      )}
      <span className={`h-px w-6 ${light ? 'bg-white/40' : 'bg-[var(--ed-line-strong)]'}`} aria-hidden />
      <span>{children}</span>
    </div>
  );
};

export default Eyebrow;
