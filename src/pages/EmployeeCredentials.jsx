import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    CheckCircle, Copy, Download, ArrowLeft,
    AlertTriangle, User, Key, ShieldCheck
} from 'lucide-react';

const EmployeeCredentials = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    // Get credentials from navigation state
    const creds = location.state;

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        // We could use a local toast here, but simple alert or inline feedback works too
        alert(`${label} copied!`);
    };

    const copyAll = () => {
        const text = `Name: ${creds.name}\nUsername: ${creds.username}\nPassword: ${creds.password}`;
        navigator.clipboard.writeText(text);
        alert('All credentials copied!');
    };

    const downloadCredentials = () => {
        const content = `
EMPLOYEE ACCOUNT CREATED
-------------------------
Name: ${creds.name}
Portal: ${window.location.origin}/login
-------------------------
Username: ${creds.username}
Password: ${creds.password}
-------------------------
Generated: ${new Date().toLocaleString()}
-------------------------
SECURITY: Please login and change your password immediately.
        `;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${creds.username}_credentials.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!creds || !creds.username) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={32} className="text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Credentials Expired</h2>
                    <p className="text-slate-500 mb-8">
                        For security reasons, credentials are only shown once. If you missed them, please reset the password from the employee list.
                    </p>
                    <button
                        onClick={() => navigate('/admin/employees')}
                        className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Back to Employees
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
                    {/* Header */}
                    <div className="bg-emerald-500 p-8 text-white text-center">
                        <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <CheckCircle size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Employee Created!</h1>
                        <p className="text-emerald-50 opacity-90">Account has been set up successfully with the following credentials.</p>
                    </div>

                    <div className="p-8">
                        {/* Status Card */}
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 mb-8">
                            <ShieldCheck className="text-emerald-600" size={24} />
                            <p className="text-emerald-800 text-sm font-medium">
                                These credentials are shown **only once**. Please save them securely now.
                            </p>
                        </div>

                        {/* Credential Details */}
                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                <div className="space-y-6">
                                    {/* Name */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <User size={18} />
                                            <span className="text-sm font-semibold uppercase tracking-wider">Full Name</span>
                                        </div>
                                        <span className="text-lg font-bold text-slate-800">{creds.name}</span>
                                    </div>

                                    {/* Username */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <User size={18} /> Username
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={creds.username}
                                                className="w-full bg-white border border-slate-200 text-slate-800 text-xl font-mono font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                onClick={(e) => e.target.select()}
                                            />
                                            <button
                                                onClick={() => copyToClipboard(creds.username, 'Username')}
                                                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition-all shadow-sm"
                                            >
                                                <Copy size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <Key size={18} /> Password
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={creds.password}
                                                className="w-full bg-white border border-slate-200 text-slate-800 text-xl font-mono font-bold tracking-widest rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                onClick={(e) => e.target.select()}
                                            />
                                            <button
                                                onClick={() => copyToClipboard(creds.password, 'Password')}
                                                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition-all shadow-sm"
                                            >
                                                <Copy size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={copyAll}
                                    className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                                >
                                    <Copy size={20} />
                                    Copy All Details
                                </button>
                                <button
                                    onClick={downloadCredentials}
                                    className="w-full bg-white border-2 border-slate-800 text-slate-800 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={20} />
                                    Download (.txt)
                                </button>
                            </div>

                            <button
                                onClick={() => navigate('/admin/employees')}
                                className="w-full mt-4 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back to Employee List
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-400 mt-8 text-sm">
                    Secured by Employee Management System • {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};

export default EmployeeCredentials;
