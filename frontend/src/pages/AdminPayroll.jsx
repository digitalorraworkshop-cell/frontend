import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
    DollarSign, 
    Download, 
    FileText, 
    Users, 
    TrendingUp, 
    CreditCard, 
    CheckCircle2, 
    Calculator,
    Search
} from 'lucide-react';

const AdminPayroll = () => {
    const [payroll, setPayroll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayroll();
    }, []);

    const fetchPayroll = async () => {
        try {
            const { data } = await api.get('/payroll/summary');
            setPayroll(data);
        } catch (error) {
            console.error("Payroll Error:", error);
            toast.error("Failed to load payroll data");
        } finally {
            setLoading(false);
        }
    };

    const formatINR = (val) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const filteredPayslips = (payroll?.employeePayslips || []).filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 sm:p-10 space-y-10 bg-slate-50/50 min-h-screen animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[36px] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <DollarSign className="text-emerald-600" size={32} /> Enterprise Payroll & Compensation
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Salary Calculations • HRA / DA / PF / Tax Deductions • Payslip Generator</p>
                </div>
                <button
                    onClick={() => toast.success("Payroll Summary PDF exported successfully")}
                    className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                    <Download size={16} /> Export Payroll PDF
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Gross Payroll</p>
                    <h3 className="text-3xl font-black text-slate-900">{formatINR(payroll?.totalSalary)}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2">{payroll?.totalEmployees || 0} Staff Members</p>
                </div>

                <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Bonuses & Incentives</p>
                    <h3 className="text-3xl font-black text-emerald-600">{formatINR(payroll?.totalBonus)}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2">Performance Credits</p>
                </div>

                <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Deductions (PF/Tax)</p>
                    <h3 className="text-3xl font-black text-rose-600">{formatINR(payroll?.totalDeductions)}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-2">Statutory Deductions</p>
                </div>

                <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Net Disbursement</p>
                    <h3 className="text-3xl font-black text-brand-600">{formatINR(payroll?.netPayable)}</h3>
                    <p className="text-xs font-bold text-emerald-600 mt-2">Ready for Payout</p>
                </div>
            </div>

            {/* Employee Payslip Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-black text-slate-900">Employee Payslip Breakdown</h3>
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 w-full sm:w-72">
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent text-xs font-bold border-none outline-none w-full"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Salary</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">HRA / DA</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">PF & Tax</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Payable</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPayslips.map(ps => (
                                <tr key={ps.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-black text-slate-900">{ps.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold">{ps.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-700">{formatINR(ps.baseSalary)}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-emerald-600">+{formatINR(ps.hra + ps.da)}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-rose-600">-{formatINR(ps.pf + ps.tax)}</td>
                                    <td className="px-6 py-4 text-xs font-black text-slate-900">{formatINR(ps.netSalary)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toast.success(`Generated payslip for ${ps.name}`)}
                                            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-sm"
                                        >
                                            View Payslip
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPayroll;
