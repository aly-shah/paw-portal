import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
}

interface TabsProps {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange, className = '' }) => (
  <div role="tablist" className={`flex gap-1 border-b border-slate-200 ${className}`}>
    {tabs.map((t) => {
      const isActive = t.id === active;
      const Icon = t.icon;
      return (
        <button
          key={t.id}
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(t.id)}
          className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-t-md
            ${isActive ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {Icon && <Icon size={16} />}
          {t.label}
          {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary-500 rounded-full" />}
        </button>
      );
    })}
  </div>
);

export default Tabs;
