import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => (
  <div
    className={`relative overflow-hidden rounded-md bg-slate-200/70 ${className}`}
    aria-hidden="true"
    {...props}
  >
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>
);

export default Skeleton;
