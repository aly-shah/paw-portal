import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, MapPin, Package, Users, DollarSign, ArrowUpRight, ArrowDownRight, Star, CheckCircle } from 'lucide-react';

const revenueByArea = [
  { name: 'DHA Phase 6', revenue: 120000, visits: 15 },
  { name: 'Clifton Blk 4', revenue: 95000, visits: 12 },
  { name: 'Gulshan-e-Iqbal', revenue: 45000, visits: 8 },
  { name: 'PECHS', revenue: 30000, visits: 5 },
  { name: 'Bahria Town', revenue: 15000, visits: 2 },
];

const inventoryTrends = [
  { month: 'Aug', demand: 40, stock: 60 },
  { month: 'Sep', demand: 55, stock: 50 },
  { month: 'Oct', demand: 75, stock: 45 },
  { month: 'Nov (Fcst)', demand: 90, stock: 30 },
  { month: 'Dec (Fcst)', demand: 110, stock: 20 },
];

const topClients = [
  { name: 'Sarah Ahmed', pet: 'Max (G. Retriever)', visits: 12, spend: 'PKR 150k', status: 'Diamond' },
  { name: 'Bilal Khan', pet: 'Luna (Persian)', visits: 8, spend: 'PKR 85k', status: 'Gold' },
  { name: 'Mrs. Farooq', pet: 'Coco (Poodle)', visits: 6, spend: 'PKR 60k', status: 'Silver' },
];

const VetAnalytics: React.FC = () => {
  const [showAllClients, setShowAllClients] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleExport = () => {
    // Build a CSV from the analytics data and download it client-side
    const rows = [
      ['Zone', 'Revenue (PKR)', 'Visits'],
      ...revenueByArea.map(r => [r.name, String(r.revenue), String(r.visits)]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'practice-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported as CSV');
  };

  const displayedClients = showAllClients ? topClients : topClients.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h2 className="text-2xl font-black text-slate-800">Practice Growth & Intelligence</h2>
              <p className="text-slate-500">AI-driven insights to optimize your service area and revenue.</p>
          </div>
          <div className="flex gap-2">
              <button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50">
                  Export Report
              </button>
              <button onClick={() => showToast('Analytics settings coming soon')} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 shadow-lg">
                  Settings
              </button>
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign size={20} /></div>
                  <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12% <ArrowUpRight size={12} /></span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Monthly Revenue</p>
              <h3 className="text-2xl font-black text-slate-800">PKR 450k</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={20} /></div>
                  <span className="text-xs font-bold text-slate-400">Avg / Visit</span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Revenue per Km</p>
              <h3 className="text-2xl font-black text-slate-800">PKR 1,200</h3>
          </div>
           <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={20} /></div>
                  <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+5 <ArrowUpRight size={12} /></span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Clients</p>
              <h3 className="text-2xl font-black text-slate-800">124</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Package size={20} /></div>
                  <span className="flex items-center text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">Low Stock <ArrowDownRight size={12} /></span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Inventory Health</p>
              <h3 className="text-2xl font-black text-slate-800">85%</h3>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profitability Heatmap (Chart) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="text-lg font-bold text-slate-800">Profitability by Zone</h3>
                      <p className="text-sm text-slate-500">Focus marketing on DHA & Clifton.</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin size={20} /></div>
              </div>
              <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByArea} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} width={100} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                          <Bar dataKey="revenue" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={30} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

           {/* Inventory Forecasting */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="text-lg font-bold text-slate-800">Vaccine Demand Forecast</h3>
                      <p className="text-sm text-slate-500">Predicted surge in Nov/Dec (Winter).</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><TrendingUp size={20} /></div>
              </div>
              <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={inventoryTrends}>
                          <defs>
                              <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                          <Area type="monotone" dataKey="demand" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" name="Predicted Demand" />
                          <Area type="monotone" dataKey="stock" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fill="transparent" name="Current Stock" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* CLV Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                   <h3 className="text-lg font-bold text-slate-800">Top Client Lifetime Value (CLV)</h3>
                   <p className="text-sm text-slate-500">Identify VIPs for loyalty rewards.</p>
              </div>
              <button onClick={() => setShowAllClients(prev => !prev)} className="text-teal-600 font-bold text-sm hover:underline">{showAllClients ? 'Show Less' : 'View All'}</button>
          </div>
          <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase">
                  <tr>
                      <th className="p-4">Client Name</th>
                      <th className="p-4">Pet</th>
                      <th className="p-4">Visits (YTD)</th>
                      <th className="p-4">Total Spend</th>
                      <th className="p-4">Status</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {displayedClients.map((client, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-700">{client.name}</td>
                          <td className="p-4 text-slate-600">{client.pet}</td>
                          <td className="p-4 text-slate-600">{client.visits}</td>
                          <td className="p-4 font-bold text-slate-800">{client.spend}</td>
                          <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${
                                  client.status === 'Diamond' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                  client.status === 'Gold' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                  <Star size={10} fill="currentColor" /> {client.status}
                              </span>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {/* Transient Toast */}
      {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-bold animate-in fade-in slide-in-from-bottom-4">
              <CheckCircle size={16} className="text-emerald-400" /> {toast}
          </div>
      )}
    </div>
  );
};

export default VetAnalytics;
