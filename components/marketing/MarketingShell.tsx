import React from 'react';
import MarketingNav from './MarketingNav';
import MarketingFooter from './MarketingFooter';

const MarketingShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-teal-200 selection:text-teal-900">
    {/* Animated background mesh */}
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-rose-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-4000" />
    </div>

    <MarketingNav />
    {children}
    <MarketingFooter />
  </div>
);

export default MarketingShell;
