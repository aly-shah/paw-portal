
import React, { useState, useMemo } from 'react';
import { 
    Search, Filter, Plus, MoreVertical, Download, Upload, Trash2, 
    Box, CheckCircle, XCircle, AlertTriangle, Layers, Tag, 
    ExternalLink, RefreshCw, Barcode, ChevronRight, ChevronDown,
    Package, AlertCircle, Eye, Edit3, Save, ArrowRight, TrendingUp, UploadCloud
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import InventoryImportModal from '../inventory/InventoryImportModal';

// --- Types ---

type ApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
type SourceType = 'VENDOR' | 'CLINIC';

interface GlobalProduct {
    id: string;
    name: string;
    sku: string;
    category: string;
    sourceType: SourceType;
    sourceName: string; // Vendor or Clinic Name
    price: number;
    stock: number;
    status: 'ACTIVE' | 'INACTIVE';
    approvalStatus: ApprovalStatus;
    lastUpdated: string;
    image: string;
    description?: string;
    duplicatesDetected?: number;
}

// --- Mock Data ---

const MOCK_GLOBAL_INVENTORY: GlobalProduct[] = [
    {
        id: 'GP-1001', name: 'Royal Canin Adult 10kg', sku: 'RC-AD-10', category: 'Food',
        sourceType: 'VENDOR', sourceName: 'PetMart Store',
        price: 18500, stock: 45, status: 'ACTIVE', approvalStatus: 'APPROVED',
        lastUpdated: '2 hours ago', image: 'https://images.unsplash.com/photo-1585499193151-0f50d54c4e5d?w=100'
    },
    {
        id: 'GP-1002', name: 'Rabies Vaccine (10ml)', sku: 'MED-VAC-RB', category: 'Medicine',
        sourceType: 'CLINIC', sourceName: 'Downtown Pet Clinic',
        price: 2500, stock: 12, status: 'ACTIVE', approvalStatus: 'APPROVED',
        lastUpdated: '1 day ago', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=100'
    },
    {
        id: 'GP-1003', name: 'Premium Leather Leash', sku: 'ACC-LSH-L', category: 'Accessory',
        sourceType: 'VENDOR', sourceName: 'Luxury Paws',
        price: 3200, stock: 8, status: 'INACTIVE', approvalStatus: 'PENDING',
        lastUpdated: '30 mins ago', image: 'https://images.unsplash.com/photo-1558929996-da64ba858215?w=100',
        duplicatesDetected: 1, description: 'High quality leather leash, brown.'
    },
    {
        id: 'GP-1004', name: 'Amoxicillin 500mg', sku: 'MED-AMOX-500', category: 'Medicine',
        sourceType: 'CLINIC', sourceName: 'VetCare Plus',
        price: 450, stock: 100, status: 'ACTIVE', approvalStatus: 'PENDING',
        lastUpdated: '5 mins ago', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=100',
        description: 'Antibiotic tablets.'
    },
    {
        id: 'GP-1005', name: 'Squeaky Bone Toy', sku: 'TOY-BN-SQ', category: 'Toy',
        sourceType: 'VENDOR', sourceName: 'ToyLand',
        price: 500, stock: 0, status: 'INACTIVE', approvalStatus: 'REJECTED',
        lastUpdated: '1 week ago', image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=100',
        description: 'Rubber toy. Reject reason: Image quality low.'
    }
];

const CATEGORY_STATS = [
    { name: 'Food', value: 400 },
    { name: 'Medicine', value: 300 },
    { name: 'Toys', value: 200 },
    { name: 'Accessory', value: 150 },
    { name: 'Grooming', value: 100 },
];

const SOURCE_STATS = [
    { name: 'Vendors', items: 850 },
    { name: 'Clinics', items: 420 },
];

// --- Sub-Components ---

const ProductDetailModal = ({ product, onClose, onUpdate }: { product: GlobalProduct, onClose: () => void, onUpdate: (p: GlobalProduct) => void }) => {
    const [status, setStatus] = useState(product.approvalStatus);
    
    const handleApprove = () => {
        const updated = { ...product, approvalStatus: 'APPROVED' as ApprovalStatus, status: 'ACTIVE' as const };
        onUpdate(updated);
        setStatus('APPROVED');
    };

    const handleReject = () => {
        const updated = { ...product, approvalStatus: 'REJECTED' as ApprovalStatus, status: 'INACTIVE' as const };
        onUpdate(updated);
        setStatus('REJECTED');
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div className="flex gap-4">
                        <img src={product.image} className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-sm bg-white" />
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-black text-slate-800">{product.name}</h2>
                                {product.duplicatesDetected && (
                                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-amber-200">
                                        <AlertTriangle size={10} /> Potential Duplicate
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded">{product.sku}</span>
                                <span>•</span>
                                <span>{product.category}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    
                    {/* Approval Actions */}
                    {status === 'PENDING' && (
                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
                            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <AlertCircle size={18} /> Approval Required
                            </h4>
                            <p className="text-sm text-blue-600/80 mb-4">
                                This item was recently added by <span className="font-bold">{product.sourceName}</span> and needs verification before going live globally.
                            </p>
                            <div className="flex gap-3">
                                <button onClick={handleApprove} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md transition-all">
                                    Approve Item
                                </button>
                                <button onClick={handleReject} className="flex-1 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-all">
                                    Reject
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Core Details */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl border border-slate-200 bg-white">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Source</p>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${product.sourceType === 'VENDOR' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {product.sourceType}
                                </span>
                                <span className="font-bold text-slate-700 text-sm truncate">{product.sourceName}</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-white">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Pricing</p>
                            <div className="flex items-end gap-2">
                                <span className="text-xl font-black text-slate-800">PKR {product.price.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-white">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Stock Level</p>
                            <div className="flex items-center gap-2">
                                <Package size={16} className="text-slate-400" />
                                <span className={`font-bold ${product.stock < 10 ? 'text-red-600' : 'text-slate-800'}`}>{product.stock} Units</span>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-white">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Current Status</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${status === 'APPROVED' ? 'bg-emerald-500' : status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                <span className="font-bold text-slate-700 capitalize">{status.toLowerCase()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-3">System Metadata</h4>
                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Created At</span>
                                <span className="font-mono text-slate-700">Oct 24, 2023 10:00 AM</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Last Updated</span>
                                <span className="font-mono text-slate-700">{product.lastUpdated}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Global ID</span>
                                <span className="font-mono text-slate-700">{product.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                        <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50">View History</button>
                        <button className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 flex items-center gap-2">
                            <Edit3 size={14} /> Edit Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CategoryManager = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-1">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Taxonomy Tree</h3>
            <div className="space-y-1">
                {['Food', 'Medicine', 'Toys', 'Accessories', 'Grooming', 'Tech'].map(cat => (
                    <div key={cat} className="group">
                        <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors text-left">
                            <div className="flex items-center gap-2">
                                <ChevronRight size={14} className="text-slate-400" />
                                <span className="font-bold text-slate-700 text-sm">{cat}</span>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                        </button>
                    </div>
                ))}
                <button className="w-full mt-4 py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-xs hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
                    <Plus size={14} /> Add Root Category
                </button>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 flex flex-col items-center justify-center text-center text-slate-400">
            <Layers size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Select a category to manage attributes and sub-categories.</p>
        </div>
    </div>
);

// --- Main Component ---

const GlobalInventory: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ALL' | 'APPROVALS' | 'CATEGORIES' | 'ANALYTICS'>('ALL');
    const [items, setItems] = useState<GlobalProduct[]>(MOCK_GLOBAL_INVENTORY);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<GlobalProduct | null>(null);
    const [filterSource, setFilterSource] = useState('ALL');
    const [isImportOpen, setIsImportOpen] = useState(false);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  item.sku.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesTab = activeTab === 'APPROVALS' ? item.approvalStatus === 'PENDING' : true;
            const matchesSource = filterSource === 'ALL' || item.sourceType === filterSource;

            return matchesSearch && matchesTab && matchesSource;
        });
    }, [items, searchQuery, activeTab, filterSource]);

    const handleUpdateProduct = (updated: GlobalProduct) => {
        setItems(prev => prev.map(p => p.id === updated.id ? updated : p));
        setSelectedProduct(null);
    };

    const handleImportComplete = (summary: any) => {
        setIsImportOpen(false);
        // In a real app, refresh data here. For mock, we'll just alert or show toast.
        alert(`Import processed: ${summary.created} new items.`);
    };

    const handleExport = () => {
        const headers = ['ID', 'Name', 'SKU', 'Category', 'Source Name', 'Source Type', 'Price', 'Stock', 'Status', 'Approval Status'];
        const csvContent = [
            headers.join(','),
            ...filteredItems.map(item => [
                item.id,
                `"${item.name}"`,
                item.sku,
                item.category,
                `"${item.sourceName}"`,
                item.sourceType,
                item.price,
                item.stock,
                item.status,
                item.approvalStatus
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderAnalytics = () => (
        <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Inventory by Category</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={CATEGORY_STATS} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} width={80} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="value" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Source Distribution</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={SOURCE_STATS} 
                                    cx="50%" cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="items"
                                >
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#10b981" />
                                </Pie>
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-bold text-slate-600">Vendors</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            <span className="text-xs font-bold text-slate-600">Clinics</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    {[
                        { id: 'ALL', label: 'All Items', icon: Box },
                        { id: 'APPROVALS', label: 'Approvals', icon: CheckCircle },
                        { id: 'CATEGORIES', label: 'Categories', icon: Layers },
                        { id: 'ANALYTICS', label: 'Analytics', icon: TrendingUp },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                activeTab === tab.id 
                                ? 'bg-slate-900 text-white shadow-md' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            <tab.icon size={14} /> {tab.label}
                        </button>
                    ))}
                </div>
                
                {activeTab !== 'CATEGORIES' && activeTab !== 'ANALYTICS' && (
                    <div className="flex gap-2">
                        <button 
                            onClick={handleExport}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 flex items-center gap-2"
                        >
                            <Download size={14} /> Export
                        </button>
                        <button 
                            onClick={() => setIsImportOpen(true)}
                            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 shadow-lg flex items-center gap-2"
                        >
                            <UploadCloud size={14} /> Bulk Import
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Switch */}
            {activeTab === 'ANALYTICS' && renderAnalytics()}
            {activeTab === 'CATEGORIES' && <CategoryManager />}
            {(activeTab === 'ALL' || activeTab === 'APPROVALS') && (
                <>
                    {/* Toolbar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search inventory by name, SKU..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto">
                            <select 
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 outline-none cursor-pointer"
                                value={filterSource}
                                onChange={(e) => setFilterSource(e.target.value)}
                            >
                                <option value="ALL">All Sources</option>
                                <option value="VENDOR">Vendors Only</option>
                                <option value="CLINIC">Clinics Only</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 w-12"></th>
                                        <th className="p-4">Product Name</th>
                                        <th className="p-4">Source</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4">Stock</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredItems.map(item => (
                                        <tr key={item.id} onClick={() => setSelectedProduct(item)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <td className="p-4">
                                                <img src={item.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800">{item.name}</div>
                                                <div className="text-xs text-slate-400 font-mono">{item.sku}</div>
                                                {item.duplicatesDetected && item.duplicatesDetected > 0 && (
                                                    <div className="text-[9px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                                                        <AlertTriangle size={10} /> Duplicate Detected
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs font-bold text-slate-700">{item.sourceName}</div>
                                                <div className={`text-[9px] font-bold uppercase w-fit px-1.5 py-0.5 rounded mt-0.5 ${item.sourceType === 'VENDOR' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>{item.sourceType}</div>
                                            </td>
                                            <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{item.category}</span></td>
                                            <td className="p-4 font-bold text-slate-800">PKR {item.price.toLocaleString()}</td>
                                            <td className="p-4">
                                                <span className={`font-bold ${item.stock === 0 ? 'text-red-500' : 'text-slate-700'}`}>{item.stock}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                                    item.approvalStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                    item.approvalStatus === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' :
                                                    'bg-amber-50 text-amber-600 border-amber-200'
                                                }`}>
                                                    {item.approvalStatus}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100">
                                                    <ChevronRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredItems.length === 0 && (
                            <div className="p-12 text-center text-slate-400">
                                <Box size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No inventory items found.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modals */}
            {selectedProduct && (
                <ProductDetailModal 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                    onUpdate={handleUpdateProduct}
                />
            )}

            {isImportOpen && (
                <InventoryImportModal 
                    onClose={() => setIsImportOpen(false)}
                    onImportComplete={handleImportComplete}
                />
            )}
        </div>
    );
};

export default GlobalInventory;
