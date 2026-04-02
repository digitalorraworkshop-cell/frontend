import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import {
    CheckCircle2,
    XCircle,
    Clock,
    MessageSquare,
    Filter,
    Calendar,
    User,
    AlertTriangle,
    FileText,
    ExternalLink,
    ChevronRight
} from 'lucide-react';

const AdminLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [adminRemark, setAdminRemark] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const { data } = await api.get('/leaves');
            setLeaves(data);
        } catch (error) {
            toast.error("Failed to fetch leave requests");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/leaves/${id}`, { status, adminRemark });
            toast.success(`Leave ${status.toLowerCase()} successfully`);
            setIsModalOpen(false);
            setAdminRemark('');
            fetchLeaves();
        } catch (error) {
            toast.error("Failed to update leave status");
        }
    };

    const openModal = (leave) => {
        setSelectedLeave(leave);
        setAdminRemark(leave.adminRemark || '');
        setIsModalOpen(true);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    return (
        <div className="p-10 space-y-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Leave Governance</h2>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                        Policy Enforcement Center
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        <Filter size={14} />
                        Filter Logic
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20">
                        Export Report (CSV)
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employee Identity</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Leave Classification</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Period</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deduction</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Governance</th>
                                <th className="px-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Review</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="6" className="px-10 py-20 text-center"><p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.3em] text-xs">Accessing leave database...</p></td></tr>
                            ) : leaves.length === 0 ? (
                                <tr><td colSpan="6" className="px-10 py-20 text-center"><p className="text-slate-300 font-bold italic">Clear records — no pending actions</p></td></tr>
                            ) : (
                                leaves.map((leave) => (
                                    <tr key={leave._id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xl shadow-inner group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                                    {leave.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-lg tracking-tight">{leave.user?.name || 'Unknown Entity'}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{leave.user?.position || 'Internal Staff'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black text-slate-700 tracking-tight">{leave.leaveType}</span>
                                                {leave.isEmergency && <span className="text-[8px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full w-fit uppercase">Emergency</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-black text-slate-600">
                                                    {new Date(leave.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} — {new Date(leave.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{leave.totalDays} Total Cycles</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-8">
                                            {leave.deductionAmount > 0 ? (
                                                <span className="text-sm font-black text-rose-600">₹{leave.deductionAmount.toFixed(0)}</span>
                                            ) : (
                                                <span className="text-xs font-black text-emerald-600 uppercase">No Deduction</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-8">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-2 justify-center w-fit tracking-wider shadow-sm ${getStatusStyle(leave.status)}`}>
                                                {leave.status === 'Approved' && <CheckCircle2 size={12} />}
                                                {leave.status === 'Rejected' && <XCircle size={12} />}
                                                {leave.status === 'Pending' && <Clock size={12} />}
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button
                                                onClick={() => openModal(leave)}
                                                className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-100 rounded-2xl transition-all shadow-sm group/btn"
                                            >
                                                <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Policy Review */}
            {isModalOpen && selectedLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Review Protocol</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Application ID: {selectedLeave._id.slice(-8)}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 rounded-2xl transition-all">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Leave Context</p>
                                    <p className="text-slate-800 text-sm font-bold leading-relaxed">{selectedLeave.reason}</p>
                                </div>
                                <div className="space-y-4">
                                    {selectedLeave.proofDocument && (
                                        <a href={selectedLeave.proofDocument} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-brand-50 text-brand-600 rounded-2xl border border-brand-100 hover:bg-brand-600 hover:text-white transition-all group">
                                            <div className="flex items-center gap-3">
                                                <FileText size={20} />
                                                <span className="text-xs font-black uppercase tracking-tight">Medical Evidence</span>
                                            </div>
                                            <ExternalLink size={16} className="group-hover:scale-110 transition-transform" />
                                        </a>
                                    )}
                                    <div className="p-6 bg-rose-50 text-rose-600 rounded-3xl border border-rose-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Policy Cost</span>
                                        </div>
                                        <p className="text-2xl font-black">₹{selectedLeave.deductionAmount.toFixed(2)}</p>
                                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter mt-1">Calculated via Rule Type: {selectedLeave.leaveType}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Governance Remark</label>
                                <textarea
                                    className="w-full px-8 py-6 rounded-[32px] border border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-bold transition-all resize-none shadow-inner"
                                    rows="4"
                                    placeholder="Enter decision rationale for official logs..."
                                    value={adminRemark}
                                    onChange={(e) => setAdminRemark(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                <button
                                    onClick={() => handleUpdateStatus(selectedLeave._id, 'Rejected')}
                                    className="px-8 py-5 border-2 border-rose-100 text-rose-600 rounded-[32px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all text-xs"
                                >
                                    Deny Protocol
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedLeave._id, 'Approved')}
                                    className="px-8 py-5 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-2xl shadow-slate-900/20 text-xs"
                                >
                                    Authorize Leave
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLeaves;
