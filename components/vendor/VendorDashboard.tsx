
import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { Package, Banknote, ShoppingBag, Users, Plus, Search, Filter, MoreVertical, TrendingUp, AlertCircle, Sparkles, CheckCircle, Loader2, ArrowRight, Truck, Clock, X, FileText, Printer, Mail, Phone, MapPin, LayoutGrid, List, Download, Calendar, CheckSquare, Square, RefreshCw, Image as ImageIcon, UploadCloud, Trash2, Barcode, Tag, MessageSquare, ChevronDown, RotateCcw, Ban, Bold, Italic, List as ListIcon, Link as LinkIcon, Percent, Upload, Settings, Star } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../constants';
import { Product } from '../../types';
import { generateProductListing } from '../../services/geminiService';
import InventoryImportModal from '../inventory/InventoryImportModal';

// --- Types for Vendor Module ---
interface OrderNote {
    id: string;
    text: string;
    date: string;
    author: string;
}

interface VendorOrder {
    id: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    date: string;
    datetime: Date;
    amount: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Return Requested' | 'Returned' | 'Refunded';
    items: { name: string; quantity: number; price: number; image: string; sku: string }[];
    paymentMethod: string;
    trackingNumber?: string;
    internalNotes?: OrderNote[];
}

interface VendorDashboardProps {
    initialTab?: string;
}

// --- Mock Data ---
const MOCK_VENDOR_ORDERS: VendorOrder[] = [
    {
        id: 'ORD-7782',
        customer: { name: 'Sarah Ahmed', email: 'sarah@example.com', phone: '+92 300 1234567', address: 'House 42, St 10, DHA Ph 6, Karachi' },
        date: 'Oct 24, 10:30 AM',
        datetime: new Date(new Date().setDate(new Date().getDate() - 0)),
        amount: 18500,
        status: 'Pending',
        items: [
            { name: 'Royal Canin Adult 10kg', quantity: 1, price: 18500, image: 'https://images.unsplash.com/photo-1585499193151-0f50d54c4e5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100', sku: 'RC-AD-10' }
        ],
        paymentMethod: 'Credit Card',
        internalNotes: []
    },
    {
        id: 'ORD-7783',
        customer: { name: 'Bilal Khan', email: 'bilal@example.com', phone: '+92 321 9876543', address: 'Apt 4B, Creek Vistas, Clifton, Karachi' },
        date: 'Oct 24, 09:15 AM',
        datetime: new Date(new Date().setDate(new Date().getDate() - 1)),
        amount: 4200,
        status: 'Processing',
        items: [
            { name: 'Durable Rope Toy', quantity: 2, price: 850, image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-4.0.3&auto=format&fit=crop&w=100', sku: 'TOY-ROPE' },
            { name: 'Reflective Dog Harness', quantity: 1, price: 2500, image: 'https://images.unsplash.com/photo-1558929996-da64ba858215?ixlib=rb-4.0.3&auto=format&fit=crop&w=100', sku: 'ACC-HARN' }
        ],
        paymentMethod: 'Cash on Delivery',
        internalNotes: [{ id: 'n1', text: 'Customer requested call before delivery', date: 'Oct 24, 9:30 AM', author: 'System' }]
    },
    {
        id: 'ORD-7781',
        customer: { name: 'Mrs. Farooq', email: 'farooq@example.com', phone: '+92 333 5551234', address: '12-A, Block 2, PECHS, Karachi' },
        date: 'Oct 23, 04:45 PM',
        datetime: new Date(new Date().setDate(new Date().getDate() - 2)),
        amount: 12000,
        status: 'Shipped',
        items: [
            { name: 'Automatic Feeder', quantity: 1, price: 12000, image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=100', sku: 'ACC-FEED' }
        ],
        paymentMethod: 'JazzCash',
        trackingNumber: 'TCS-8829102',
        internalNotes: []
    },
    {
        id: 'ORD-7780',
        customer: { name: 'Ali Raza', email: 'ali@example.com', phone: '+92 300 1112222', address: 'Gulshan-e-Iqbal, Karachi' },
        date: 'Oct 22, 02:30 PM',
        datetime: new Date(new Date().setDate(new Date().getDate() - 3)),
        amount: 3500,
        status: 'Delivered',
        items: [
            { name: 'Cat Tree Tower', quantity: 1, price: 3500, image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100', sku: 'FURN-TREE' }
        ],
        paymentMethod: 'Bank Transfer',
        internalNotes: []
    },
    {
        id: 'ORD-7779',
        customer: { name: 'Zara Sheikh', email: 'zara@example.com', phone: '+92 333 9998877', address: 'Bahria Town, Karachi' },
        date: 'Oct 21, 11:00 AM',
        datetime: new Date(new Date().setDate(new Date().getDate() - 4)),
        amount: 2800,
        status: 'Return Requested',
        items: [
            { name: 'Glucosamine Joint Treats', quantity: 1, price: 2800, image: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?ixlib=rb-4.0.3&auto=format&fit=crop&w=100', sku: 'HLTH-JT' }
        ],
        paymentMethod: 'Credit Card',
        internalNotes: [{id: 'n2', text: 'Reason: Item damaged in transit', date: 'Oct 22, 10:00 AM', author: 'Customer Service'}]
    }
];

const REVENUE_DATA = [
    { name: 'Mon', value: 12000 },
    { name: 'Tue', value: 18500 },
    { name: 'Wed', value: 8200 },
    { name: 'Thu', value: 24000 },
    { name: 'Fri', value: 15600 },
    { name: 'Sat', value: 32000 },
    { name: 'Sun', value: 28000 },
];

// --- ADD PRODUCT MODAL (PRODUCT STUDIO) ---
const AddProductModal = ({ onClose, onSave }: { onClose: () => void, onSave: (p: Product) => void }) => {
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        description: '',
        price: 0,
        salePrice: undefined,
        costPrice: 0,
        stock: 0,
        weight: 0,
        sku: '',
        category: 'Accessory',
        tags: [],
        status: 'Draft',
        images: []
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Stats Calculation
    const effectivePrice = formData.salePrice || formData.price || 0;
    const listingScore = (() => {
        let score = 0;
        if (formData.name && formData.name.length > 10) score += 20;
        if (formData.description && formData.description.length > 50) score += 20;
        if (formData.images && formData.images.length >= 1) score += 20;
        if (formData.images && formData.images.length >= 3) score += 10;
        if (formData.tags && formData.tags.length >= 3) score += 10;
        if (formData.sku) score += 10;
        if (formData.stock && formData.stock > 0) score += 10;
        return score;
    })();

    const handleGenerateDetails = async () => {
        if (!formData.name) return;
        setIsGenerating(true);
        const details = await generateProductListing(formData.name);
        setFormData(prev => ({
            ...prev,
            description: details.description,
            category: details.category as any,
            price: details.suggestedPrice,
            tags: details.tags,
            costPrice: Math.floor(details.suggestedPrice * 0.6), // Mock cost
        }));
        setIsGenerating(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
        let files: File[] = [];
        if (e.type === 'drop') {
             e.preventDefault();
             setIsDragging(false);
             files = Array.from((e as React.DragEvent).dataTransfer.files);
        } else {
             files = Array.from((e as React.ChangeEvent<HTMLInputElement>).target.files || []);
        }

        if (files.length > 0) {
            const newImages = files.map(f => URL.createObjectURL(f));
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), ...newImages],
                image: prev.image || newImages[0] // Set primary if empty
            }));
        }
    };

    const removeImage = (index: number) => {
        const newImages = formData.images?.filter((_, i) => i !== index) || [];
        setFormData(prev => ({
            ...prev,
            images: newImages,
            image: newImages.length > 0 ? newImages[0] : ''
        }));
    };

    const generateSKU = () => {
        const prefix = formData.category?.substring(0,3).toUpperCase() || 'GEN';
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setFormData(prev => ({ ...prev, sku: `${prefix}-${random}` }));
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags?.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">Product Studio</h2>
                            <p className="text-slate-500 text-sm">Create a high-quality listing for your store.</p>
                        </div>
                        {/* Listing Quality Meter */}
                        <div className="hidden md:block bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Listing Quality</p>
                            <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${listingScore > 80 ? 'bg-emerald-500' : listingScore > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                        style={{ width: `${listingScore}%` }}
                                    />
                                </div>
                                <span className={`text-xs font-bold ${listingScore > 80 ? 'text-emerald-600' : listingScore > 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {listingScore}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                         <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Discard</button>
                         <button 
                            onClick={() => onSave(formData as Product)}
                            disabled={!formData.name || !formData.price || (!formData.images || formData.images.length === 0)}
                            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                         >
                             <CheckCircle size={18} /> Publish
                         </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 text-lg">Product Details</h3>
                                    <button 
                                        onClick={handleGenerateDetails}
                                        disabled={isGenerating || !formData.name}
                                        className="text-purple-600 bg-purple-50 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-purple-100 disabled:opacity-50 transition-all"
                                    >
                                        {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />} 
                                        Auto-Fill with AI
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Product Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Premium Leather Collar" 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:font-normal"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                                    <textarea 
                                        rows={6}
                                        placeholder="Detailed product description..."
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none resize-none leading-relaxed"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1">Media Gallery</h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleImageUpload}
                                        className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group text-center p-4 ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-white'}`}
                                    >
                                        <UploadCloud size={32} className={`mb-2 transition-transform ${isDragging ? 'text-teal-600 scale-110' : 'text-slate-400 group-hover:scale-110'}`} />
                                        <span className={`text-xs font-bold ${isDragging ? 'text-teal-700' : 'text-slate-500'}`}>
                                            {isDragging ? 'Drop Here' : 'Click or Drag'}
                                        </span>
                                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple accept="image/*" className="hidden" />
                                    </div>
                                    {formData.images?.map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-2xl relative group overflow-hidden border border-slate-200 shadow-sm bg-white">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                 <button onClick={() => removeImage(idx)} className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow-md"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2"><Banknote size={20} className="text-emerald-600" /> Pricing</h3>
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Selling Price</label>
                                            <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-rose-500">Sale Price</label>
                                            <input type="number" className="w-full p-3 bg-rose-50 border border-rose-100 rounded-xl font-bold text-rose-700 outline-none" value={formData.salePrice || ''} onChange={e => setFormData({...formData, salePrice: parseFloat(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cost Price</label>
                                        <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 outline-none" value={formData.costPrice || ''} onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value)})} />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2"><Package size={20} className="text-blue-600" /> Inventory</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SKU</label>
                                        <div className="flex gap-2">
                                            <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-700 outline-none uppercase" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                                            <button onClick={generateSKU} className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors"><Barcode size={18} /></button>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Stock</label>
                                            <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2"><Tag size={20} className="text-amber-500" /> Organization</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                                            {['Food', 'Toy', 'Accessory', 'Health', 'Grooming'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tags</label>
                                        <input type="text" placeholder="Type and press Enter..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag} />
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {formData.tags?.map(tag => (
                                                <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                                    {tag} <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VendorDashboard: React.FC<VendorDashboardProps> = ({ initialTab }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PRODUCTS' | 'ORDERS'>('OVERVIEW');
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS.map(p => ({ ...p, status: 'Active', sku: `SKU-${Math.floor(Math.random()*1000)}`, costPrice: p.price * 0.7, images: [p.image] })));
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [showToast, setShowToast] = useState<{message: string, type?: 'success'|'error'} | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    // Add Product Menu State
    const [showAddMenu, setShowAddMenu] = useState(false);
    const addMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
                setShowAddMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Order State
    const [orders, setOrders] = useState<VendorOrder[]>(MOCK_VENDOR_ORDERS);
    const [orderFilter, setOrderFilter] = useState('All');
    const [orderSearch, setOrderSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
    const [orderViewMode, setOrderViewMode] = useState<'LIST' | 'BOARD'>('LIST');
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    
    // Internal Note State
    const [newNote, setNewNote] = useState('');

    // Product row action menu
    const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);

    const handleDeleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        setOpenRowMenu(null);
        setShowToast({ message: 'Product removed from inventory.' });
        setTimeout(() => setShowToast(null), 3000);
    };

    // Sync initial tab
    useEffect(() => {
        if (initialTab === 'Orders') setActiveTab('ORDERS');
        if (initialTab === 'Inventory') setActiveTab('PRODUCTS');
        if (initialTab === 'Analytics') setActiveTab('OVERVIEW');
    }, [initialTab]);

    const handleSaveProduct = (newProduct: Product) => {
        const product: Product = {
            ...newProduct,
            id: `p-${Date.now()}`,
            rating: 0,
            reviews: 0,
            vendor: 'NaturePet Store',
            image: newProduct.images && newProduct.images.length > 0 ? newProduct.images[0] : 'https://via.placeholder.com/150'
        };
        setProducts([product, ...products]);
        setIsProductModalOpen(false);
    };

    const handleImportComplete = (summary: any) => {
        setIsImportModalOpen(false);
        setShowToast({ message: `Import complete — ${summary.created} created, ${summary.updated} updated.` });
        setTimeout(() => setShowToast(null), 4000);
    };

    const handleBulkStatusChange = (status: VendorOrder['status']) => {
        setOrders(prev => prev.map(o => selectedOrderIds.includes(o.id) ? { ...o, status } : o));
        setSelectedOrderIds([]);
    };

    const filteredOrders = orders.filter(o => {
        const matchesFilter = orderFilter === 'All' 
            ? true 
            : orderFilter === 'Returns' 
                ? (o.status === 'Return Requested' || o.status === 'Returned' || o.status === 'Refunded')
                : o.status === orderFilter;
        
        const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                              o.customer.name.toLowerCase().includes(orderSearch.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const stats = {
        pending: orders.filter(o => o.status === 'Pending').length,
        processing: orders.filter(o => o.status === 'Processing').length,
        revenue: orders.reduce((sum, o) => sum + o.amount, 0),
        lowStock: products.filter(p => p.stock < 10).length
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 relative">
            {/* Bulk Actions Floating Bar */}
            {selectedOrderIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10">
                    <span className="font-bold text-sm">{selectedOrderIds.length} Selected</span>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <div className="flex gap-2">
                        <button onClick={() => handleBulkStatusChange('Processing')} className="px-3 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-bold transition-colors">Mark Processing</button>
                        <button onClick={() => handleBulkStatusChange('Shipped')} className="px-3 py-1.5 hover:bg-slate-800 rounded-lg text-xs font-bold transition-colors">Mark Shipped</button>
                    </div>
                    <button onClick={() => setSelectedOrderIds([])} className="p-1 hover:bg-slate-800 rounded-full"><X size={16}/></button>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800">Vendor Portal</h2>
                    <p className="text-slate-500 font-medium">Manage your store, inventory, and orders.</p>
                </div>
                <div className="flex gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
                    {['OVERVIEW', 'PRODUCTS', 'ORDERS'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'OVERVIEW' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Banknote size={20} /></div>
                                <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
                            <h3 className="text-2xl font-black text-slate-800">PKR {stats.revenue.toLocaleString()}</h3>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShoppingBag size={20} /></div>
                                <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{orders.length} Total</span>
                            </div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Orders</p>
                            <h3 className="text-2xl font-black text-slate-800">{orders.length}</h3>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Package size={20} /></div>
                                {stats.lowStock > 0 && <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">{stats.lowStock} Low</span>}
                            </div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Products</p>
                            <h3 className="text-2xl font-black text-slate-800">{products.length}</h3>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Star size={20} /></div>
                                <span className="flex items-center text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">4.8 Avg</span>
                            </div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Store Rating</p>
                            <h3 className="text-2xl font-black text-slate-800">4.8</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Revenue Chart */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-6">Revenue Trends</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={REVENUE_DATA}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Recent Activity / Quick Actions */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setIsProductModalOpen(true)} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col items-center gap-2 text-slate-700 transition-colors">
                                        <Plus size={20} className="text-emerald-600" />
                                        <span className="text-xs font-bold">Add Item</span>
                                    </button>
                                    <button onClick={() => setIsImportModalOpen(true)} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col items-center gap-2 text-slate-700 transition-colors">
                                        <Upload size={20} className="text-blue-600" />
                                        <span className="text-xs font-bold">Bulk Import</span>
                                    </button>
                                    <button onClick={() => setActiveTab('ORDERS')} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col items-center gap-2 text-slate-700 transition-colors">
                                        <ListIcon size={20} className="text-purple-600" />
                                        <span className="text-xs font-bold">Orders</span>
                                    </button>
                                    <button
                                        onClick={() => { setShowToast({ message: 'Store settings are coming soon.' }); setTimeout(() => setShowToast(null), 3000); }}
                                        className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col items-center gap-2 text-slate-700 transition-colors">
                                        <Settings size={20} className="text-slate-500" />
                                        <span className="text-xs font-bold">Settings</span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4">Recent Orders</h3>
                                <div className="space-y-3">
                                    {orders.slice(0, 3).map(order => (
                                        <div key={order.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-bold text-slate-800">{order.customer.name}</p>
                                                <p className="text-xs text-slate-500">{order.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900">PKR {order.amount}</p>
                                                <span className={`text-[10px] uppercase font-bold ${order.status === 'Pending' ? 'text-amber-500' : 'text-emerald-500'}`}>{order.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PRODUCTS TAB --- */}
            {activeTab === 'PRODUCTS' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in">
                    <div className="flex justify-between items-center">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                            <input type="text" placeholder="Search inventory..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div className="flex gap-2 relative" ref={addMenuRef}>
                            <button 
                                onClick={() => setShowAddMenu(!showAddMenu)}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 flex items-center gap-2 transition-all"
                            >
                                <Plus size={18} /> Add Product <ChevronDown size={14} className={`transition-transform duration-200 ${showAddMenu ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Dropdown Menu */}
                            {showAddMenu && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 origin-top-right">
                                    <button 
                                        onClick={() => { setShowAddMenu(false); setIsProductModalOpen(true); }}
                                        className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                    >
                                        <Plus size={16} className="text-emerald-500" /> Add Single Product
                                    </button>
                                    <div className="h-px bg-slate-100"></div>
                                    <button 
                                        onClick={() => { setShowAddMenu(false); setIsImportModalOpen(true); }}
                                        className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                    >
                                        <Upload size={16} className="text-blue-500" /> Bulk Import Products
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-100">
                                <tr>
                                    <th className="p-4 w-12"></th>
                                    <th className="p-4">Product</th>
                                    <th className="p-4">SKU</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4"><img src={product.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100" /></td>
                                        <td className="p-4 font-bold text-slate-800">{product.name}</td>
                                        <td className="p-4 text-slate-500 font-mono text-xs">{product.sku}</td>
                                        <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 uppercase">{product.category}</span></td>
                                        <td className="p-4 font-bold text-slate-800">{product.price}</td>
                                        <td className="p-4">
                                            <div className="w-24">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className={product.stock < 10 ? 'text-red-500 font-bold' : 'text-slate-600'}>{product.stock}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${product.stock < 10 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                                        style={{ width: `${Math.min(100, product.stock * 2)}%` }} 
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                                product.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right relative">
                                            <button
                                                onClick={() => setOpenRowMenu(openRowMenu === product.id ? null : product.id)}
                                                className="p-2 hover:bg-white hover:shadow-md rounded-lg text-slate-400 hover:text-slate-600 transition-all"><MoreVertical size={16} /></button>
                                            {openRowMenu === product.id && (
                                                <div className="absolute right-4 top-12 w-44 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 origin-top-right text-left">
                                                    <button
                                                        onClick={() => { setOpenRowMenu(null); setShowToast({ message: 'Product editing is coming soon.' }); setTimeout(() => setShowToast(null), 3000); }}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Edit</button>
                                                    <div className="h-px bg-slate-100"></div>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">Delete</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- ORDERS TAB --- */}
            {activeTab === 'ORDERS' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div onClick={() => setOrderFilter('Pending')} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-amber-200 cursor-pointer transition-all group">
                            <p className="text-xs text-slate-400 font-bold uppercase group-hover:text-amber-600">Needs Attention</p>
                            <p className="text-2xl font-black text-amber-500">{stats.pending}</p>
                        </div>
                        <div onClick={() => setOrderFilter('Processing')} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 cursor-pointer transition-all group">
                            <p className="text-xs text-slate-400 font-bold uppercase group-hover:text-blue-600">Processing</p>
                            <p className="text-2xl font-black text-blue-500">{stats.processing}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-400 font-bold uppercase">To Ship</p>
                            <p className="text-2xl font-black text-slate-800">{orders.filter(o => o.status === 'Processing').length}</p>
                        </div>
                        <div onClick={() => setOrderFilter('Returns')} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-red-200 cursor-pointer transition-all group">
                            <p className="text-xs text-slate-400 font-bold uppercase group-hover:text-red-600">Returns</p>
                            <p className="text-2xl font-black text-red-500">{orders.filter(o => o.status === 'Return Requested').length}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                                    <tr>
                                        <th className="p-4">Order ID</th>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredOrders.map(order => (
                                        <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-slate-50 cursor-pointer">
                                            <td className="p-4 font-bold text-slate-800 text-sm">{order.id}</td>
                                            <td className="p-4"><p className="font-bold text-sm text-slate-800">{order.customer.name}</p></td>
                                            <td className="p-4"><span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase">{order.status}</span></td>
                                            <td className="p-4 font-black text-sm text-slate-800">{order.amount.toLocaleString()}</td>
                                            <td className="p-4 text-right"><button className="text-xs font-bold text-slate-400">View</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Product Modal with AI */}
            {isProductModalOpen && (
                <AddProductModal onClose={() => setIsProductModalOpen(false)} onSave={handleSaveProduct} />
            )}

            {/* Import Modal */}
            {isImportModalOpen && (
                <InventoryImportModal 
                    onClose={() => setIsImportModalOpen(false)} 
                    onImportComplete={handleImportComplete} 
                />
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-black text-slate-800">Order #{selectedOrder.id}</h3>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-slate-50 text-slate-500 border-slate-200">{selectedOrder.status}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20}/></button>
                        </div>
                        <div className="p-8">
                            <p className="text-center text-slate-400 italic">Order details...</p>
                        </div>
                    </div>
                 </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-5 fade-in flex items-center gap-3">
                    <CheckCircle size={20} className="text-emerald-400" />
                    <p className="text-sm font-bold">{showToast.message}</p>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
