import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Shield,
    Camera,
    Save,
    Lock,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmployeeProfile = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header / Hero */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="h-40 bg-gradient-to-r from-brand-600 to-indigo-600"></div>
                <div className="px-8 pb-8 flex flex-col items-center">
                    <div className="relative -mt-20 mb-6">
                        <div className="h-32 w-32 rounded-3xl bg-white p-1.5 shadow-xl">
                            <div className="h-full w-full rounded-[1.25rem] bg-slate-100 border-2 border-white overflow-hidden flex items-center justify-center relative group">
                                {user?.profilePicture ? (
                                    <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${user.profilePicture}`} className="h-full w-full object-cover" alt="Profile" />
                                ) : (
                                    <User size={48} className="text-slate-300" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
                    <p className="text-brand-600 font-bold text-sm uppercase tracking-widest">{user?.role}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Details Column */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <User className="text-brand-600" size={20} />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <User size={16} className="text-slate-400" />
                                    <span className="text-sm font-semibold text-slate-700">{user?.name}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Mail size={16} className="text-slate-400" />
                                    <span className="text-sm font-semibold text-slate-700">{user?.email}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Position</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Briefcase size={16} className="text-slate-400" />
                                    <span className="text-sm font-semibold text-slate-700">{user?.role}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <Shield size={16} className="text-slate-400" />
                                    <span className="text-sm font-semibold text-slate-700">@{user?.username}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Lock className="text-brand-600" size={20} />
                            Security
                        </h3>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500">Change your account password. We recommend using a strong password that you don't use elsewhere.</p>
                            <button className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                                Reset Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Column */}
                <div className="space-y-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <h4 className="font-bold text-slate-800 mb-4">Account Status</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <span className="text-xs font-bold text-emerald-700 uppercase">Active</span>
                                <CheckCircle2 size={16} className="text-emerald-500" />
                            </div>
                            <div className="text-xs text-slate-400 text-center">
                                Member since {user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'Feb 2026'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
