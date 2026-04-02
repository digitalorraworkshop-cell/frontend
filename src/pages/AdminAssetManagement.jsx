import React, { useState, useEffect } from 'react';
import axios from '../utils/api';
import {
    Plus, Package, Share2, Inbox, History,
    Trash2, Edit2, CheckCircle, AlertCircle,
    User, Calendar, DollarSign, Tag, Info,
    ArrowRightLeft, Download, Loader2, Search, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAssetManagement = () => {
    const [activeTab, setActiveTab] = useState('entry'); // entry, distribution, stock
    const [products, setProducts] = useState([]);
    const [distributions, setDistributions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form States
    const [productForm, setProductForm] = useState({
        modelName: '',
        totalQuantity: '',
        price: '',
        condition: 'New',
        purchaseDate: new Date().toISOString().split('T')[0]
    });

    const [distForm, setDistForm] = useState({
        productId: '',
        employeeId: '',
        quantityAssigned: 1,
        distributionDate: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    useEffect(() => {
        fetchData();
        fetchEmployees();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'entry' || activeTab === 'stock') {
                const res = await axios.get('/assets/products', {
                    params: { extraStock: activeTab === 'stock' }
                });
                setProducts(res.data);
            } else if (activeTab === 'distribution') {
                const res = await axios.get('/assets/distributions');
                setDistributions(res.data);
                // Also need products for the dropdown
                const pRes = await axios.get('/assets/products');
                setProducts(pRes.data);
            }
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('/employees');
            setEmployees(res.data);
        } catch (error) {
            console.error("Failed to fetch employees");
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await axios.post('/assets/products', productForm);
            toast.success("Product added successfully");
            setProductForm({
                modelName: '',
                totalQuantity: '',
                price: '',
                condition: 'New',
                purchaseDate: new Date().toISOString().split('T')[0]
            });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add product");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDistribute = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const adminName = localStorage.getItem('userName') || 'Admin';
            await axios.post('/assets/distribute', {
                ...distForm,
                distributedBy: adminName
            });
            toast.success("Product distributed successfully");
            setDistForm({
                productId: '',
                employeeId: '',
                quantityAssigned: 1,
                distributionDate: new Date().toISOString().split('T')[0],
                remarks: ''
            });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to distribute");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReturn = async (id) => {
        if (!window.confirm("Mark this item as returned?")) return;
        try {
            await axios.post(`/assets/return/${id}`);
            toast.success("Item returned to stock");
            fetchData();
        } catch (error) {
            toast.error("Failed to return item");
        }
    };

    const renderEntryTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Column */}
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                            <Plus size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">Product Entry</h2>
                    </div>

                    <form onSubmit={handleAddProduct} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model Name</label>
                            <input
                                type="text"
                                required
                                value={productForm.modelName}
                                onChange={(e) => setProductForm({ ...productForm, modelName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                placeholder="e.g. Dell Latitude 5440"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                                <input
                                    type="number"
                                    required
                                    value={productForm.totalQuantity}
                                    onChange={(e) => setProductForm({ ...productForm, totalQuantity: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price</label>
                                <input
                                    type="number"
                                    required
                                    value={productForm.price}
                                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    placeholder="₹"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Condition</label>
                            <select
                                value={productForm.condition}
                                onChange={(e) => setProductForm({ ...productForm, condition: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                            >
                                <option value="New">New</option>
                                <option value="Good">Good</option>
                                <option value="Used">Used</option>
                                <option value="Damaged">Damaged</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Date</label>
                            <input
                                type="date"
                                required
                                value={productForm.purchaseDate}
                                onChange={(e) => setProductForm({ ...productForm, purchaseDate: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 mt-4 shadow-xl shadow-slate-900/10"
                        >
                            {submitting ? 'Creating...' : 'Create Product Record'}
                        </button>
                    </form>
                </div>
            </div>

            {/* List Column */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/10 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <h2 className="text-xl font-black text-slate-900">Product Catalog</h2>
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {products.length} Models
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-slate-50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold italic">No products added yet</td>
                                    </tr>
                                ) : (
                                    products.map(p => (
                                        <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-4 font-black text-slate-900 text-sm">{p.modelName}</td>
                                            <td className="px-6 py-4 font-bold text-slate-600 text-sm">{p.totalQuantity}</td>
                                            <td className="px-6 py-4 font-bold text-slate-600 text-sm">₹{p.price}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${p.condition === 'New' ? 'bg-emerald-100 text-emerald-600' :
                                                    p.condition === 'Damaged' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {p.condition}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-400">
                                                {new Date(p.purchaseDate).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDistributionTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Column */}
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Share2 size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">Distribute Assets</h2>
                    </div>

                    <form onSubmit={handleDistribute} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Product</label>
                            <select
                                required
                                value={distForm.productId}
                                onChange={(e) => setDistForm({ ...distForm, productId: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                            >
                                <option value="">Select Item...</option>
                                {products.map(p => (
                                    <option key={p._id} value={p._id} disabled={p.availableQuantity === 0}>
                                        {p.modelName} ({p.availableQuantity} available)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Employee</label>
                            <select
                                required
                                value={distForm.employeeId}
                                onChange={(e) => setDistForm({ ...distForm, employeeId: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                            >
                                <option value="">Assign to...</option>
                                {employees.map(e => (
                                    <option key={e._id} value={e._id}>{e.name} ({e.department})</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={distForm.quantityAssigned}
                                    onChange={(e) => setDistForm({ ...distForm, quantityAssigned: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={distForm.distributionDate}
                                    onChange={(e) => setDistForm({ ...distForm, distributionDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
                            <textarea
                                value={distForm.remarks}
                                onChange={(e) => setDistForm({ ...distForm, remarks: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500/20 transition-all h-24 resize-none"
                                placeholder="Any notes..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 mt-2 shadow-xl shadow-indigo-600/10"
                        >
                            {submitting ? 'Processing...' : 'Assign Fixed Asset'}
                        </button>
                    </form>
                </div>
            </div>

            {/* History Column */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/10 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <h2 className="text-xl font-black text-slate-900">Distribution Logs</h2>
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {distributions.length} Assignments
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-slate-50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {loading && distributions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                                        </td>
                                    </tr>
                                ) : distributions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-bold italic">No distributions recorded</td>
                                    </tr>
                                ) : (
                                    distributions.map(d => (
                                        <tr key={d._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-4">
                                                <p className="text-sm font-black text-slate-900 leading-tight">{d.employee?.name}</p>
                                                <p className="text-[10px] text-slate-400 mt-1 font-bold">{d.employee?.department}</p>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-600 text-sm">{d.product?.modelName}</td>
                                            <td className="px-6 py-4 font-black text-slate-900 text-sm">{d.quantityAssigned}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${d.status === 'Assigned' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                                    }`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {d.status === 'Assigned' ? (
                                                    <button
                                                        onClick={() => handleReturn(d._id)}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="Process Return"
                                                    >
                                                        <ArrowRightLeft size={18} />
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-slate-300 font-bold">Returned {new Date(d.returnDate).toLocaleDateString()}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStockTab = () => (
        <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Inbox size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Current Extra Stock</h2>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">Inventory available for distribution</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest shadow-sm">
                    <Download size={16} />
                    Export Stock List
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-50">
                        <tr>
                            <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Name</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Entry</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Distributed</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Available Stock</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-10 py-20 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                                </td>
                            </tr>
                        ) : products.filter(p => p.availableQuantity > 0).length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-10 py-32 text-center grayscale opacity-50">
                                    <AlertCircle size={48} className="text-slate-200 mx-auto mb-4" />
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No stock currently available</p>
                                </td>
                            </tr>
                        ) : (
                            products.filter(p => p.availableQuantity > 0).map(p => (
                                <tr key={p._id} className="hover:bg-emerald-50/20 transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black">
                                                {p.modelName.charAt(0)}
                                            </div>
                                            <p className="text-base font-black text-slate-900">{p.modelName}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-sm font-bold text-slate-500">{p.totalQuantity} Units</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-sm font-bold text-slate-500">{p.totalQuantity - p.availableQuantity} Units</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="inline-flex items-center justify-center w-24 py-2 bg-emerald-50 rounded-2xl">
                                            <span className="text-base font-black text-emerald-600">{p.availableQuantity}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${p.condition === 'New' ? 'bg-brand-500' : 'bg-amber-500'}`} />
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{p.condition}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-[1700px] mx-auto min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-4 mb-3">
                    <span className="px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                        Enterprise Inventory v2.0
                    </span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Asset Distribution Hub</h1>
                <p className="text-slate-500 font-bold max-w-2xl text-lg">Centralized management for company hardware procurement and multi-employee distribution tracking.</p>
            </div>

            {/* Premium Tabs */}
            <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => setActiveTab('entry')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${activeTab === 'entry'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                >
                    <Package size={20} />
                    Product Entry
                </button>
                <button
                    onClick={() => setActiveTab('distribution')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${activeTab === 'distribution'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                >
                    <Share2 size={20} />
                    Distribution
                </button>
                <button
                    onClick={() => setActiveTab('stock')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${activeTab === 'stock'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/20'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                >
                    <Inbox size={20} />
                    Extra Stock
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'entry' && renderEntryTab()}
            {activeTab === 'distribution' && renderDistributionTab()}
            {activeTab === 'stock' && renderStockTab()}
        </div>
    );
};

export default AdminAssetManagement;
