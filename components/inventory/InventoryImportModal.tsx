
import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, ArrowRight, Check, AlertCircle, FileText, Settings, Loader2, Download, AlertTriangle, RefreshCw, FileSpreadsheet } from 'lucide-react';

interface InventoryImportModalProps {
    onClose: () => void;
    onImportComplete: (summary: any) => void;
}

type ImportStep = 'UPLOAD' | 'MAP' | 'PREVIEW' | 'IMPORTING' | 'RESULT';

const SYSTEM_FIELDS = [
    { key: 'name', label: 'Name', required: true },
    { key: 'category', label: 'Category', required: true },
    { key: 'price', label: 'Price', required: true, type: 'number' },
    { key: 'stock', label: 'Stock', required: true, type: 'number' },
    { key: 'sku', label: 'SKU', required: false },
    { key: 'costPrice', label: 'Cost Price', required: false, type: 'number' },
    { key: 'image', label: 'Image URL', required: false },
    { key: 'description', label: 'Description', required: false },
    { key: 'tags', label: 'Tags', required: false },
    { key: 'brand', label: 'Brand', required: false },
    // Global Admin Fields
    { key: 'sourceName', label: 'Vendor/Clinic Name', required: false }, 
    { key: 'sourceType', label: 'Source Type (Vendor/Clinic)', required: false },
];

const InventoryImportModal: React.FC<InventoryImportModalProps> = ({ onClose, onImportComplete }) => {
    const [step, setStep] = useState<ImportStep>('UPLOAD');
    const [file, setFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvPreview, setCsvPreview] = useState<string[][]>([]); // First 5 rows
    const [mapping, setMapping] = useState<Record<string, string>>({}); // csvHeader -> systemFieldKey
    const [importStats, setImportStats] = useState({ created: 0, updated: 0, skipped: 0, failed: 0 });
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState<{row: number, error: string}[]>([]);
    
    // Options
    const [dryRun, setDryRun] = useState(false); // Default false for demo flow, usually true
    const [importAction, setImportAction] = useState<'MERGE' | 'OVERWRITE' | 'SKIP'>('MERGE');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownloadTemplate = () => {
        const headers = ['Name', 'Category', 'Price', 'Stock', 'SKU', 'Cost Price', 'Image URL', 'Description', 'Tags', 'Brand', 'Source Name', 'Source Type'];
        const csvContent = headers.join(',');
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'product_import_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Simple CSV Parser (Handles basic quoted fields)
    const parseCSVLine = (line: string): string[] => {
        const result = [];
        let startValueIndex = 0;
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') inQuotes = !inQuotes;
            else if (line[i] === ',' && !inQuotes) {
                let val = line.substring(startValueIndex, i).trim();
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                result.push(val);
                startValueIndex = i + 1;
            }
        }
        let lastVal = line.substring(startValueIndex).trim();
        if (lastVal.startsWith('"') && lastVal.endsWith('"')) lastVal = lastVal.slice(1, -1);
        result.push(lastVal);
        return result;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
                alert("File too large. Max 50MB.");
                return;
            }
            setFile(selectedFile);
            
            // Read headers and preview
            const reader = new FileReader();
            reader.onload = (evt) => {
                const text = evt.target?.result as string;
                const lines = text.split('\n').filter(l => l.trim().length > 0);
                if (lines.length > 0) {
                    const headers = parseCSVLine(lines[0]);
                    setCsvHeaders(headers);
                    setCsvPreview(lines.slice(1, 6).map(line => parseCSVLine(line)));
                    
                    // Auto-map
                    const newMapping: Record<string, string> = {};
                    headers.forEach(header => {
                        const match = SYSTEM_FIELDS.find(sf => sf.label.toLowerCase() === header.toLowerCase() || sf.key.toLowerCase() === header.toLowerCase());
                        if (match) newMapping[header] = match.key;
                    });
                    setMapping(newMapping);
                    setStep('MAP');
                }
            };
            reader.readAsText(selectedFile);
        }
    };

    const isMappingValid = () => {
        // Check if all required system fields are mapped
        const mappedSystemFields = Object.values(mapping);
        return SYSTEM_FIELDS.filter(sf => sf.required).every(sf => mappedSystemFields.includes(sf.key));
    };

    const handleImport = () => {
        setStep('IMPORTING');
        setProgress(0);
        
        // Mock Import Process
        let processed = 0;
        const total = 50; // Mock total rows
        const interval = setInterval(() => {
            processed += 5;
            setProgress(Math.min(100, (processed / total) * 100));
            
            if (processed >= total) {
                clearInterval(interval);
                // Mock Results
                setImportStats({
                    created: Math.floor(total * 0.6),
                    updated: Math.floor(total * 0.3),
                    skipped: 0,
                    failed: Math.floor(total * 0.1)
                });
                setErrors([
                    { row: 4, error: "Missing required field: Price" },
                    { row: 12, error: "Invalid Category: 'Automotive'" },
                    { row: 28, error: "Duplicate SKU" }
                ]);
                setStep('RESULT');
                if (!dryRun) {
                    onImportComplete && onImportComplete({ created: 30, updated: 15 });
                }
            }
        }, 200);
    };

    const downloadErrorCSV = () => {
        const header = "Row,Error\n";
        const content = errors.map(e => `${e.row},"${e.error}"`).join('\n');
        const blob = new Blob([header + content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'import_errors.csv';
        link.click();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Bulk Import Products</h2>
                        <p className="text-slate-500 text-sm">Upload a CSV file to add or update inventory in bulk.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8">
                    
                    {step === 'UPLOAD' && (
                        <div className="h-full flex flex-col items-center justify-center space-y-8">
                            {/* Template Download Section */}
                            <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4 justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm"><FileSpreadsheet size={24} /></div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">Need the correct format?</h4>
                                        <p className="text-xs text-slate-500 mt-1">Download our template to ensure your data is formatted correctly.</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleDownloadTemplate}
                                    className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Download size={14} /> Download CSV Template
                                </button>
                            </div>

                            <div className="w-full flex items-center gap-4">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                <span className="text-xs font-bold text-slate-400 uppercase">Then</span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>

                            <div 
                                className="w-full max-w-lg h-64 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-slate-800 hover:bg-slate-50 transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="p-4 bg-slate-100 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                    <Upload size={32} className="text-slate-600" />
                                </div>
                                <p className="font-bold text-slate-700">Click to upload or drag and drop</p>
                                <p className="text-sm text-slate-400 mt-2">CSV files only (max 50MB)</p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".csv" 
                                    onChange={handleFileSelect}
                                />
                            </div>
                        </div>
                    )}

                    {step === 'MAP' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Map Columns</h3>
                                <div className="text-xs font-medium px-3 py-1 bg-slate-100 rounded-full text-slate-600">
                                    File: {file?.name}
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <div className="p-4">CSV Header</div>
                                    <div className="p-4">System Field</div>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {csvHeaders.map((header, idx) => (
                                        <div key={idx} className="grid grid-cols-2 border-b border-slate-100 last:border-0 items-center">
                                            <div className="p-4 font-medium text-slate-700 truncate" title={header}>
                                                {header}
                                                <span className="block text-xs text-slate-400 mt-1">Ex: {csvPreview[0]?.[idx] || ''}</span>
                                            </div>
                                            <div className="p-4">
                                                <select 
                                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900"
                                                    value={mapping[header] || ''}
                                                    onChange={(e) => setMapping({...mapping, [header]: e.target.value})}
                                                >
                                                    <option value="">-- Ignore Column --</option>
                                                    {SYSTEM_FIELDS.map(sf => (
                                                        <option key={sf.key} value={sf.key}>
                                                            {sf.label} {sf.required ? '(Required)' : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {!isMappingValid() && (
                                <div className="text-red-500 text-sm font-bold flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    Missing required fields: {SYSTEM_FIELDS.filter(sf => sf.required && !Object.values(mapping).includes(sf.key)).map(sf => sf.label).join(', ')}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'PREVIEW' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Import Action</label>
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        {['MERGE', 'OVERWRITE', 'SKIP'].map(act => (
                                            <button 
                                                key={act}
                                                onClick={() => setImportAction(act as any)}
                                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${importAction === act ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                                            >
                                                {act.charAt(0) + act.slice(1).toLowerCase()}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        {importAction === 'MERGE' ? 'Update existing items, create new ones.' : 
                                         importAction === 'OVERWRITE' ? 'Replace existing items completely.' : 
                                         'Only create new items, ignore existing SKU matches.'}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Options</label>
                                    <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl">
                                        <input 
                                            type="checkbox" 
                                            checked={dryRun} 
                                            onChange={e => setDryRun(e.target.checked)}
                                            className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                                        />
                                        <span className="text-sm font-bold text-slate-700">Dry Run (Validate Only)</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-800 mb-2">Preview (First 5 Rows)</h3>
                                <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                                            <tr>
                                                {csvHeaders.filter(h => mapping[h]).map(h => (
                                                    <th key={h} className="p-3 whitespace-nowrap">{mapping[h]}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {csvPreview.map((row, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    {csvHeaders.map((h, idx) => {
                                                        if (!mapping[h]) return null;
                                                        return <td key={idx} className="p-3 truncate max-w-[150px]">{row[idx]}</td>
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'IMPORTING' && (
                        <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                            <div className="w-20 h-20 relative">
                                <Loader2 size={80} className="text-slate-200 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-slate-600 text-sm">
                                    {Math.round(progress)}%
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Processing Inventory...</h3>
                                <p className="text-slate-500">Please do not close this window.</p>
                            </div>
                            <div className="w-full max-w-md bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-slate-900 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}

                    {step === 'RESULT' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4">
                            <div className="text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${importStats.failed > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {importStats.failed > 0 ? <AlertTriangle size={32} /> : <Check size={32} strokeWidth={4} />}
                                </div>
                                <h3 className="text-2xl font-black text-slate-800">Import {dryRun ? 'Validation' : ''} Complete</h3>
                                <p className="text-slate-500">Here is the summary of your operation.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                                    <p className="text-2xl font-black text-emerald-600">{importStats.created}</p>
                                    <p className="text-xs font-bold text-emerald-800 uppercase">Created</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                                    <p className="text-2xl font-black text-blue-600">{importStats.updated}</p>
                                    <p className="text-xs font-bold text-blue-800 uppercase">Updated</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                                    <p className="text-2xl font-black text-slate-600">{importStats.skipped}</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Skipped</p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center">
                                    <p className="text-2xl font-black text-red-600">{importStats.failed}</p>
                                    <p className="text-xs font-bold text-red-800 uppercase">Failed</p>
                                </div>
                            </div>

                            {importStats.failed > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-red-600" />
                                        <div>
                                            <p className="font-bold text-red-900">Download Error Report</p>
                                            <p className="text-xs text-red-700">Review line-by-line errors for failed rows.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={downloadErrorCSV}
                                        className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Download size={16} /> Download CSV
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    {step === 'UPLOAD' && (
                        <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
                    )}
                    {step === 'MAP' && (
                        <>
                            <button onClick={() => { setStep('UPLOAD'); setFile(null); }} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Back</button>
                            <button 
                                onClick={() => setStep('PREVIEW')} 
                                disabled={!isMappingValid()}
                                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </>
                    )}
                    {step === 'PREVIEW' && (
                        <>
                            <button onClick={() => setStep('MAP')} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Back</button>
                            <button 
                                onClick={handleImport}
                                className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg"
                            >
                                <Settings size={16} /> {dryRun ? 'Start Validation' : 'Start Import'}
                            </button>
                        </>
                    )}
                    {step === 'RESULT' && (
                        <button 
                            onClick={onClose}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryImportModal;
