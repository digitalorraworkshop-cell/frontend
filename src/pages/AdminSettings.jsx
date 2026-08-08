import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
    Settings as SettingsIcon, 
    Shield, 
    Key, 
    Mail, 
    Sliders, 
    Save, 
    Lock, 
    CheckCircle2, 
    UserCheck,
    Globe,
    Bell
} from 'lucide-react';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('permissions');

    const roles = [
        { id: 'admin', name: 'Super Admin', desc: 'Full enterprise control over all modules and settings' },
        { id: 'hr', name: 'HR Manager', desc: 'Attendance, leave approvals, employee records, and birthday wishes' },
        { id: 'manager', name: 'Sr. Manager / Team Lead', desc: 'Project boards, task directives, and team performance monitoring' },
        { id: 'accountant', name: 'Payroll Accountant', desc: 'Salary calculations, payslip generation, and expense management' },
        { id: 'employee', name: 'Standard Employee', desc: 'Dashboard tracking, self-tasks, attendance punch-in, and leave application' },
    ];

    const permissions = [
        { key: 'view_attendance', name: 'View Attendance Logs' },
        { key: 'approve_leaves', name: 'Approve / Reject Leaves' },
        { key: 'assign_tasks', name: 'Assign Tasks & Directives' },
        { key: 'view_screenshots', name: 'View Employee Screenshots' },
        { key: 'manage_payroll', name: 'Access Payroll & Salary' },
        { key: 'manage_assets', name: 'Manage Asset Inventory' },
        { key: 'view_ai_insights', name: 'Access AI HR Insights' },
    ];

    return (
        <div className="p-6 sm:p-10 space-y-10 bg-slate-50/50 min-h-screen animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[36px] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <SettingsIcon className="text-brand-600" size={32} /> Enterprise System Settings
                    </h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Role-Based Access Control (RBAC) • Organization • Security • API Webhooks</p>
                </div>
                <button
                    onClick={() => toast.success("Enterprise Configuration Saved!")}
                    className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-brand-600/20 active:scale-95"
                >
                    <Save size={16} /> Save Changes
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2 border-b border-slate-200">
                {[
                    { id: 'permissions', name: 'Roles & Permissions', icon: <Shield size={16} /> },
                    { id: 'company', name: 'Organization Settings', icon: <Globe size={16} /> },
                    { id: 'smtp', name: 'SMTP & Email Config', icon: <Mail size={16} /> },
                    { id: 'security', name: 'Security & API Keys', icon: <Key size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all ${
                            activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'permissions' && (
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure permissions per user role across the enterprise SaaS</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Permission Module</th>
                                    {roles.map(r => (
                                        <th key={r.id} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{r.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {permissions.map(perm => (
                                    <tr key={perm.key} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-xs font-black text-slate-900">{perm.name}</td>
                                        {roles.map(r => (
                                            <td key={r.id} className="px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked={r.id === 'admin' || (r.id === 'hr' && perm.key.includes('leave')) || (r.id === 'manager' && perm.key.includes('task'))}
                                                    className="w-4 h-4 text-brand-600 rounded cursor-pointer accent-brand-600"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'company' && (
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                    <h3 className="text-xl font-black text-slate-900">Organization Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Company Name</label>
                            <input
                                type="text"
                                defaultValue="Antigravity Enterprise Technologies"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Support Email</label>
                            <input
                                type="email"
                                defaultValue="support@antigravityhr.com"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'smtp' && (
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                    <h3 className="text-xl font-black text-slate-900">SMTP Email Server Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SMTP Host</label>
                            <input
                                type="text"
                                defaultValue="smtp.mailgun.org"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Port</label>
                            <input
                                type="text"
                                defaultValue="587"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                    <h3 className="text-xl font-black text-slate-900">API Keys & Webhooks</h3>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-black text-slate-900">Production Webhook Secret</p>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">whsec_live_9f8d7c6b5a4e3d2c1b0a</p>
                        </div>
                        <button onClick={() => toast.success("API Key Regenerated")} className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl">Regenerate</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
