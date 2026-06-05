import React from 'react';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<Size, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: Size;
  className?: string;
  ring?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt = '', name, size = 'md', className = '', ring = false }) => {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '';
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full
        bg-primary-100 font-bold text-primary-700 ${sizes[size]} ${ring ? 'ring-2 ring-white shadow-elevation-1' : ''} ${className}`}
    >
      {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : <span>{initials}</span>}
    </div>
  );
};

export default Avatar;
