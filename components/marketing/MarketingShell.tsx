import React from 'react';
import MarketingNav from './MarketingNav';
import MarketingFooter from './MarketingFooter';

const MarketingShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="editorial min-h-screen antialiased">
    <MarketingNav />
    <main>{children}</main>
    <MarketingFooter />
  </div>
);

export default MarketingShell;
