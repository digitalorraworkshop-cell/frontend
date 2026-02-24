import React, { useContext } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import TrackWidget from '../components/employee/TrackWidget';
import { LogOut, ClipboardList, User } from 'lucide-react';

const EmployeeDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-600/20">
                            <User size={18} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-800">Employee Portal</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                            <p className="text-xs text-slate-500">{user?.email}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                            {user?.profilePicture ? (
                                <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <span className="font-bold text-slate-500">{user?.name?.charAt(0)}</span>
                            )}
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors font-medium text-sm"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Tracking */}
                    <div className="lg:col-span-1 space-y-6">
                        <TrackWidget />

                        {/* Weekly Summary Widget (Mock) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4">Your Week</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500">Total Hours</span>
                                    <span className="font-mono font-bold text-slate-800">32h 15m</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-brand-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                                <p className="text-xs text-slate-400 text-right">Goal: 40h</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <ClipboardList size={32} className="text-slate-400" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">My Tasks</h2>
                            <p className="text-slate-500 max-w-md">
                                You don't have any assigned tasks at the moment. When your manager assigns tasks, they will appear here.
                            </p>
                            <button className="mt-6 px-6 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium transition-colors">
                                Refresh List
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EmployeeDashboard;
