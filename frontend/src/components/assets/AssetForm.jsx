import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import {
    X, Upload, Calendar, Hash, Tag, Building2,
    DollarSign, Clipboard, Shield, UserPlus, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const AssetForm = ({ asset, onClose, onSuccess }) => {
    const isEdit = !!asset;
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        itemName: asset?.itemName || '',
        category: asset?.category || 'Laptop',
        serialNumber: asset?.serialNumber || '',
        purchaseDate: asset?.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
        vendor: asset?.vendor || '',
        cost: asset?.cost || '',
        warrantyExpiry: asset?.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : '',
        condition: asset?.condition || 'New',
        status: asset?.status || 'Available',
        description: asset?.description || '',
        assignedTo: asset?.assignedTo?._id || asset?.assignedTo || '',
        assignDate: asset?.assignDate ? new Date(asset.assignDate).toISOString().split('T')[0] : '',
        returnDate: asset?.returnDate ? new Date(asset.returnDate).toISOString().split('T')[0] : '',
    });

    const [files, setFiles] = useState({
        image: null,
        invoice: null
    });

    const categories = ['Laptop', 'Desktop', 'Mobile', 'Software License', 'Office Equipment', 'ID Card', 'Other'];
    const conditions = ['New', 'Good', 'Repair Needed', 'Damaged'];
    const statuses = ['Available', 'Assigned', 'In Repair', 'Retired'];

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('/employees');
            setEmployees(res.data);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Auto-update status when employee is assigned
            ...(name === 'assignedTo' && value ? { status: 'Assigned' } : {}),
            ...(name === 'assignedTo' && !value && prev.status === 'Assigned' ? { status: 'Available' } : {})
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFiles(prev => ({ ...prev, [name]: files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        if (files.image) data.append('image', files.image);
        if (files.invoice) data.append('invoice', files.invoice);

        try {
            if (isEdit) {
                await axios.put(`/assets/${asset._id}`, data);
                toast.success("Asset updated successfully");
            } else {
                await axios.post('/assets', data);
                toast.success("Asset added successfully");
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save asset");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {isEdit ? 'Update Asset' : 'Add New Asset'}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">Fill in the details to {isEdit ? 'modify' : 'create'} the asset record</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X size={24} className="text-slate-400" />
                </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8 overflow-y-auto">
                {/* Basic Info Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4 text-brand-600">
                        <Tag size={18} />
                        <h3 className="font-black uppercase tracking-widest text-xs">Identification & Type</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Asset Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/10 cursor-pointer"
                                required
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Item Name</label>
                            <input
                                type="text"
                                name="itemName"
                                value={formData.itemName}
                                onChange={handleChange}
                                placeholder="e.g. MacBook Pro 14'"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-500/10"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Serial / Unique ID</label>
                            <input
                                type="text"
                                name="serialNumber"
                                value={formData.serialNumber}
                                onChange={handleChange}
                                placeholder="S/N: ABC-123-XYZ"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold font-mono tracking-tight focus:ring-2 focus:ring-brand-500/10"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Condition</label>
                            <select
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/10 cursor-pointer"
                            >
                                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Purchase Details */}
                <div>
                    <div className="flex items-center gap-2 mb-4 text-brand-600">
                        <Building2 size={18} />
                        <h3 className="font-black uppercase tracking-widest text-xs">Purchase & Vendor</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Vendor Name</label>
                            <input
                                type="text"
                                name="vendor"
                                value={formData.vendor}
                                onChange={handleChange}
                                placeholder="e.g. Dell India"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-500/10"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Purchase Cost (INR)</label>
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    name="cost"
                                    value={formData.cost}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-2 focus:ring-brand-500/10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Purchase Date</label>
                            <input
                                type="date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/10"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Warranty Expiry</label>
                            <input
                                type="date"
                                name="warrantyExpiry"
                                value={formData.warrantyExpiry}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/10"
                            />
                        </div>
                    </div>
                </div>

                {/* Assignment & Status */}
                <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-200/50">
                    <div className="flex items-center gap-2 mb-6 text-brand-600">
                        <UserPlus size={18} />
                        <h3 className="font-black uppercase tracking-widest text-xs">Assignment Status</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Current Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-700 focus:ring-2 focus:ring-brand-500/10 cursor-pointer"
                            >
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Assign to Employee</label>
                            <select
                                name="assignedTo"
                                value={formData.assignedTo}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/10 cursor-pointer"
                            >
                                <option value="">Not Assigned</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.email})</option>
                                ))}
                            </select>
                        </div>
                        {formData.assignedTo && (
                            <div className="space-y-1.5 md:col-span-2 animate-in slide-in-from-top-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Assignment Date</label>
                                <input
                                    type="date"
                                    name="assignDate"
                                    value={formData.assignDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-500/10"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Attachments */}
                <div>
                    <div className="flex items-center gap-2 mb-4 text-brand-600">
                        <Upload size={18} />
                        <h3 className="font-black uppercase tracking-widest text-xs">Attachments (Invoice / Images)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Asset Image</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    name="image"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                    id="asset-image-upload"
                                />
                                <label
                                    htmlFor="asset-image-upload"
                                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[24px] cursor-pointer hover:border-brand-500/50 hover:bg-brand-50/30 transition-all text-slate-400 font-medium"
                                >
                                    <Info size={24} className="mb-2" />
                                    <span className="text-xs">{files.image ? files.image.name : 'Upload Product Photo'}</span>
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Purchase Invoice</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    name="invoice"
                                    onChange={handleFileChange}
                                    accept=".pdf,image/*"
                                    className="hidden"
                                    id="asset-invoice-upload"
                                />
                                <label
                                    htmlFor="asset-invoice-upload"
                                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[24px] cursor-pointer hover:border-brand-500/50 hover:bg-brand-50/30 transition-all text-slate-400 font-medium"
                                >
                                    <Clipboard size={24} className="mb-2" />
                                    <span className="text-xs">{files.invoice ? files.invoice.name : 'Upload Invoice (PDF/Img)'}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">Additional description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Any additional notes about this asset..."
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-brand-500/10 resize-none"
                    ></textarea>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 mt-auto sticky bottom-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black tracking-widest uppercase text-xs hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] px-6 py-3.5 rounded-2xl bg-brand-600 text-white font-black tracking-widest uppercase text-xs shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : isEdit ? 'Update Record' : 'Create Asset'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AssetForm;
