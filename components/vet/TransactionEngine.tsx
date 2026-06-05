import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, Mail, ArrowRight, DollarSign, Smartphone, Loader2, Send, Building2, Banknote, Share2, Copy, Plus, X as XIcon, Search } from 'lucide-react';
import { generateDischargeSummary } from '../../services/geminiService';

interface TransactionEngineProps {
    patient: any;
    visitData: any;
    onComplete: () => void;
    inventory?: any[]; // Optional inventory for autocomplete
}

const TransactionEngine: React.FC<TransactionEngineProps> = ({ patient, visitData, onComplete, inventory = [] }) => {
    const [step, setStep] = useState<'invoice' | 'payment' | 'summary'>('invoice');
    const [invoiceItems, setInvoiceItems] = useState<any[]>([
        { desc: 'Consultation Fee', price: 1500 },
        { desc: visitData?.treatment || 'General Checkup', price: 0 } 
    ]);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'ONLINE'>('CASH');
    const [paymentDetailsSent, setPaymentDetailsSent] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summary, setSummary] = useState('');
    
    // Autocomplete State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<{row: number, items: any[]} | null>(null);

    const total = invoiceItems.reduce((acc, item) => acc + item.price, 0);

    const handleSendPaymentDetails = () => {
        // Simulate sending SMS/Email
        setPaymentDetailsSent(true);
        setTimeout(() => setPaymentDetailsSent(false), 3000);
    };

    const addInvoiceItem = () => {
        setInvoiceItems([...invoiceItems, { desc: '', price: 0 }]);
    };

    const removeInvoiceItem = (index: number) => {
        setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    };

    const updateInvoiceItem = (index: number, field: 'desc' | 'price', value: any) => {
        const newItems = [...invoiceItems];
        newItems[index][field] = value;
        setInvoiceItems(newItems);

        // Autocomplete Logic
        if (field === 'desc' && inventory.length > 0) {
            if (typeof value === 'string' && value.length > 1) {
                const matches = inventory.filter(i => i.name.toLowerCase().includes(value.toLowerCase()));
                if (matches.length > 0) {
                    setActiveSuggestionIndex({ row: index, items: matches });
                } else {
                    setActiveSuggestionIndex(null);
                }
            } else {
                setActiveSuggestionIndex(null);
            }
        }
    };

    const selectSuggestion = (index: number, item: any) => {
        const newItems = [...invoiceItems];
        newItems[index].desc = item.name;
        newItems[index].price = item.price || 0;
        setInvoiceItems(newItems);
        setActiveSuggestionIndex(null);
    };

    const processPayment = async () => {
        setStep('summary');
        setIsGeneratingSummary(true);
        const generatedSummary = await generateDischargeSummary(
            visitData?.notes || 'Routine checkup',
            visitData?.treatment || 'None',
            patient.owner.name,
            patient.name
        );
        setSummary(generatedSummary);
        setIsGeneratingSummary(false);
    };

    return (
        <div className="h-full flex flex-col bg-white animate-fade-in" onClick={() => setActiveSuggestionIndex(null)}>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-800">
                    {step === 'invoice' ? 'Invoice & Billing' : step === 'payment' ? 'Payment' : 'Visit Summary'}
                </h2>
                <div className="flex gap-2 mt-2">
                    {['invoice', 'payment', 'summary'].map((s, i) => (
                        <div key={s} className={`h-1 flex-1 rounded-full ${['invoice', 'payment', 'summary'].indexOf(step) >= i ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="max-w-2xl mx-auto h-full flex flex-col justify-center">
                    
                    {/* STEP 1: INVOICE */}
                    {step === 'invoice' && (
                        <div className="space-y-6 animate-in slide-in-from-right">
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex justify-between">
                                    <span>Services Rendered</span>
                                    <span className="text-slate-400 text-sm font-medium">{new Date().toLocaleDateString()}</span>
                                </h3>
                                <div className="space-y-3 mb-4">
                                    {invoiceItems.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-dashed border-slate-100 gap-4 relative">
                                            <div className="flex-1 relative">
                                                <input 
                                                    type="text" 
                                                    value={item.desc}
                                                    onChange={(e) => updateInvoiceItem(i, 'desc', e.target.value)}
                                                    placeholder="Service Description"
                                                    className="w-full text-slate-600 font-medium bg-transparent outline-none placeholder:text-slate-300 border-b border-transparent focus:border-blue-200 transition-colors"
                                                />
                                                {/* Autocomplete Dropdown */}
                                                {activeSuggestionIndex?.row === i && (
                                                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto mt-1">
                                                        {activeSuggestionIndex.items.map(sug => (
                                                            <div 
                                                                key={sug.id}
                                                                onClick={(e) => { e.stopPropagation(); selectSuggestion(i, sug); }}
                                                                className="p-2 text-sm hover:bg-slate-50 cursor-pointer flex justify-between"
                                                            >
                                                                <span className="font-bold text-slate-700">{sug.name}</span>
                                                                <span className="text-slate-400 text-xs">PKR {sug.price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-400 text-xs">PKR</span>
                                                    <input 
                                                        type="number" 
                                                        value={item.price} 
                                                        onChange={(e) => updateInvoiceItem(i, 'price', parseFloat(e.target.value) || 0)}
                                                        className="w-24 text-right font-bold text-slate-800 bg-slate-50 rounded p-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => removeInvoiceItem(i)}
                                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <XIcon size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <button 
                                    onClick={addInvoiceItem}
                                    className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Add Service
                                </button>

                                <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-4">
                                    <span className="font-bold text-slate-800">Total Due</span>
                                    <span className="text-2xl font-black text-slate-900">PKR {total.toLocaleString()}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setStep('payment')}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            >
                                Proceed to Payment <ArrowRight />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: PAYMENT (Pakistani Methods) */}
                    {step === 'payment' && (
                        <div className="space-y-8 animate-in slide-in-from-right">
                            <div className="grid grid-cols-3 gap-4">
                                <button 
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'CASH' ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <Banknote size={32} className="text-slate-700" />
                                    <span className="font-bold text-slate-700">Cash</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('ONLINE')}
                                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'ONLINE' ? 'border-red-500 bg-red-50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <Smartphone size={32} className="text-red-600" />
                                    <span className="font-bold text-slate-700">JazzCash / EasyPaisa</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMethod === 'CARD' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <CreditCard size={32} className="text-blue-600" />
                                    <span className="font-bold text-slate-700">Card / POS</span>
                                </button>
                            </div>

                            {/* Method Specific Details */}
                            {paymentMethod === 'ONLINE' && (
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-in fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Send Payment To</p>
                                            <p className="font-mono text-lg font-bold text-slate-800">0300 1234567</p>
                                            <p className="text-xs text-slate-500">Dr. Jane Smith (JazzCash)</p>
                                        </div>
                                        <button className="p-2 bg-white rounded-lg shadow-sm text-slate-500 hover:text-slate-800"><Copy size={18}/></button>
                                    </div>
                                    
                                    {!paymentDetailsSent ? (
                                        <button 
                                            onClick={handleSendPaymentDetails}
                                            className="w-full py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50 flex items-center justify-center gap-2"
                                        >
                                            <Share2 size={18} /> Share Details with Client
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold justify-center p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                            <CheckCircle size={18} /> Details Sent to Client
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                <span className="font-bold text-slate-600">Amount to Collect</span>
                                <span className="text-xl font-black text-slate-900">PKR {total.toLocaleString()}</span>
                            </div>

                            <button 
                                onClick={processPayment}
                                className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle /> Confirm Payment Received
                            </button>
                        </div>
                    )}
                    
                    {/* STEP 3: SUMMARY */}
                    {step === 'summary' && (
                        <div className="space-y-6 animate-in zoom-in-95">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800">Visit Completed!</h3>
                                <p className="text-slate-500">Invoice has been recorded.</p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <Mail size={18} /> Discharge Summary
                                </h4>
                                {isGeneratingSummary ? (
                                    <div className="flex items-center gap-3 text-slate-500 py-4">
                                        <Loader2 className="animate-spin" /> Generating summary with AI...
                                    </div>
                                ) : (
                                    <textarea 
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        className="w-full h-40 bg-white border border-slate-200 rounded-xl p-4 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 flex items-center justify-center gap-2">
                                    <Calendar size={18} /> Schedule Follow-up
                                </button>
                                <button 
                                    onClick={onComplete}
                                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default TransactionEngine;