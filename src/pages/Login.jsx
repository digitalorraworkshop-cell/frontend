import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, UserPlus, Lock } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { login, user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    // If user is already logged in, redirect immediately
    useEffect(() => {
        if (authLoading) return; // Wait until auth state is known
        if (user) {
            const role = user.role?.toLowerCase().trim();
            console.log(`[Login] User already logged in as ${role}, redirecting...`);
            if (role === 'admin') {
                navigate('/admin', { replace: true });
            } else if (role === 'employee') {
                navigate('/employee/dashboard', { replace: true });
            } else {
                console.warn('[Login] Unknown role, staying on login page');
            }
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log('[Login] Submitting credentials for:', email.trim());
            // login() will call setUser() and set localStorage
            await login(email.trim(), password.trim());
            console.log('[Login] Success. Waiting for context update to trigger navigation...');
            // Navigation is now handled by the useEffect above
        } catch (err) {
            console.error('[Login] Error:', err);
            setError(typeof err === 'string' ? err : 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show loader while checking auth state (prevents flash of login form for logged-in users)
    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500 font-medium">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Left Side — Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-600/20 mb-6 rotate-3">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
                        <p className="mt-2 text-sm text-slate-500">Please enter your details to sign in.</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-600 text-sm">
                                <span className="font-medium mr-1">Error:</span> {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email or Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserPlus size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 sm:text-sm transition-all bg-white"
                                        placeholder="Email or Username"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-slate-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 sm:text-sm transition-all bg-white"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">Remember me</label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-brand-600 hover:text-brand-500">Forgot password?</a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 shadow-lg shadow-brand-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                                {!loading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side */}
            <div className="hidden lg:flex flex-1 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-slate-900/40 z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="relative z-20 flex flex-col items-center justify-center p-12 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Employee Management System</h2>
                    <p className="text-slate-300 text-lg max-w-lg">
                        Streamline your workforce management with our comprehensive solution. Track attendance, manage tasks, and generate reports with ease.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
