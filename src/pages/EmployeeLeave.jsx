import React, { useState, useEffect, useContext } from 'react';
import {
    CalendarPlus,
    History,
    Send,
    CheckCircle2,
    Clock,
    XCircle,
    Info,
    Wallet,
    AlertTriangle,
    FileText,
    UploadCloud
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import AuthContext from '../context/AuthContext';

const EmployeeLeave = () => {
    const { user } = useContext(AuthContext);
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState({
        monthlyPaidLeaveBalance: 0,
        carryForwardLeave: 0,
        instantLeaveUsedThisYear: 0,
        shortLeaveUsedThisMonth: 0
    });
    const [loading, setLoading] = useState(true);
    const [previewDeduction, setPreviewDeduction] = useState(0);
    const [formData, setFormData] = useState({
        leaveType: 'Paid Leave',
        fromDate: '',
        toDate: '',
        reason: '',
        isEmergency: false,
        isSickness: false,
        proofDocument: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [leavesRes, statsRes] = await Promise.all([
                api.get('/leaves'),
                api.get('/leaves/stats')
            ]);
            setLeaves(leavesRes.data);
            setStats(statsRes.data);
        } catch (error) {
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const calculatePreview = () => {
        if (!formData.fromDate || !formData.toDate || !user?.perDaySalary) {
            setPreviewDeduction(0);
            return;
        }

        const start = new Date(formData.fromDate);
        const end = new Date(formData.toDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        if (formData.leaveType === 'Instant Leave' && !formData.isEmergency) {
            setPreviewDeduction(days * 2 * user.perDaySalary);
        } else if (formData.leaveType === 'Short Leave') {
            setPreviewDeduction((user.perDaySalary / (user.workingHoursPerDay || 8)) * 2);
        } else {
            setPreviewDeduction(0);
        }
    };

    useEffect(() => {
        calculatePreview();
    }, [formData, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        try {
            await api.post('/leaves', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Leave application submitted");
            setFormData({ leaveType: 'Paid Leave', fromDate: '', toDate: '', reason: '', isEmergency: false, isSickness: false, proofDocument: null });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Submission failed");
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            Rejected: 'bg-rose-50 text-rose-600 border-rose-100',
            Pending: 'bg-amber-50 text-amber-600 border-amber-100'
        };
        const icons = {
            Approved: <CheckCircle2 size={12} />,
            Rejected: <XCircle size={12} />,
            Pending: <Clock size={12} />
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-1.5 w-fit ${styles[status]}`}>
                {icons[status]}
                {status}
            </span>
        );
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all group">
            <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="p-8 space-y-10 max-w-[1600px] mx-auto">
            {/* Header / Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Paid Balance" value={stats.monthlyPaidLeaveBalance + stats.carryForwardLeave} icon={Wallet} color="emerald" />
                <StatCard title="Instant (Year)" value={`${stats.instantLeaveUsedThisYear}/6`} icon={AlertTriangle} color="amber" />
                <StatCard title="Short (Month)" value={`${stats.shortLeaveUsedThisMonth}/1`} icon={Clock} color="blue" />
                <StatCard title="Carry Forward" value={stats.carryForwardLeave} icon={History} color="indigo" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Application Form */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-50 p-10 sticky top-28">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-brand-50 rounded-2xl text-brand-600">
                                <CalendarPlus size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Apply Leave</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Strict Policy Engine</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Leave Type</label>
                                    <select
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-bold transition-all"
                                        value={formData.leaveType}
                                        onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                    >
                                        <option>Paid Leave</option>
                                        <option>Instant Leave</option>
                                        <option>Short Leave</option>
                                        <option>Regular Leave (Unpaid)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">From Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-bold"
                                            value={formData.fromDate}
                                            onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">To Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-bold"
                                            value={formData.toDate}
                                            onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <label className="flex-1 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-white transition-all flex items-center gap-3">
                                        <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-200 text-brand-600 focus:ring-brand-500" checked={formData.isEmergency} onChange={e => setFormData({ ...formData, isEmergency: e.target.checked })} />
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">Emergency</span>
                                    </label>
                                    <label className="flex-1 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-white transition-all flex items-center gap-3">
                                        <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-200 text-brand-600 focus:ring-brand-500" checked={formData.isSickness} onChange={e => setFormData({ ...formData, isSickness: e.target.checked })} />
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">Sickness</span>
                                    </label>
                                </div>

                                {formData.isSickness && (
                                    <div className="p-1">
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Proof Document (If &gt; 1 day)</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={(e) => setFormData({ ...formData, proofDocument: e.target.files[0] })}
                                            />
                                            <div className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 group-hover:border-brand-300 transition-colors flex items-center justify-center gap-2 bg-slate-50/50">
                                                <UploadCloud className="text-slate-400 group-hover:text-brand-500 transition-colors" size={20} />
                                                <span className="text-xs font-bold text-slate-500 truncate">
                                                    {formData.proofDocument ? formData.proofDocument.name : "Select medical certificate"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Reason</label>
                                    <textarea
                                        rows="3"
                                        required
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 text-sm font-bold resize-none"
                                        placeholder="Briefly explain your requirement..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            {previewDeduction > 0 && (
                                <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-rose-600">
                                        <AlertTriangle size={20} />
                                        <span className="text-xs font-black uppercase tracking-tight">Salary Deduction</span>
                                    </div>
                                    <span className="text-xl font-black text-rose-600">₹{previewDeduction.toFixed(2)}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-brand-700 hover:-translate-y-1 active:translate-y-0 transition-all shadow-xl shadow-brand-600/30"
                            >
                                <Send size={20} />
                                Submit Application
                            </button>
                        </form>
                    </div>
                </div>

                {/* History Section */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-900 rounded-2xl text-white">
                                    <FileText size={24} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Request History</h3>
                            </div>
                            <span className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {leaves.length} Applications
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td className="p-20 text-center"><p className="text-slate-400 font-bold animate-pulse">Synchronizing records...</p></td></tr>
                                    ) : leaves.length === 0 ? (
                                        <tr><td className="p-20 text-center"><p className="text-slate-300 font-bold italic">No leave footprint found</p></td></tr>
                                    ) : (
                                        leaves.map((l) => (
                                            <tr key={l._id} className="group hover:bg-slate-50/50 transition-all">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${l.leaveType === 'Paid Leave' ? 'bg-emerald-50 text-emerald-600' :
                                                            l.leaveType === 'Instant Leave' ? 'bg-amber-50 text-amber-600' :
                                                                'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            {l.leaveType === 'Paid Leave' ? <CheckCircle2 size={24} /> : l.leaveType === 'Instant Leave' ? <AlertTriangle size={24} /> : <Clock size={24} />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <p className="font-black text-slate-900 text-lg tracking-tight">{l.leaveType}</p>
                                                                <StatusBadge status={l.status} />
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                                                {new Date(l.fromDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} — {new Date(l.toDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                                <span className="mx-2">•</span>
                                                                {l.totalDays} {l.totalDays > 1 ? 'Days' : 'Day'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-8">
                                                    {l.deductionAmount > 0 && (
                                                        <div className="text-right">
                                                            <p className="text-sm font-black text-rose-500">-₹{l.deductionAmount.toFixed(0)}</p>
                                                            <p className="text-[8px] font-black text-slate-300 uppercase italic">Deducted</p>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    {l.adminRemark && (
                                                        <div className="group/tip relative inline-block">
                                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover/tip:bg-slate-900 group-hover/tip:text-white transition-all">
                                                                <Info size={16} />
                                                            </div>
                                                            <div className="absolute right-0 bottom-full mb-3 w-64 bg-slate-900 text-white text-[10px] p-4 rounded-2xl opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-all transform translate-y-2 group-hover/tip:translate-y-0 shadow-2xl z-50">
                                                                <p className="font-bold border-b border-slate-800 pb-2 mb-2 uppercase tracking-widest text-[8px] text-slate-500 font-black">Official Remark</p>
                                                                {l.adminRemark}
                                                                <div className="absolute top-full right-4 transform translate-y-[-50%] rotate-45 w-3 h-3 bg-slate-900"></div>
                                                            </div>
                                                        </div>
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
        </div>
    );
};

export default EmployeeLeave;
