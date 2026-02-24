import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useContext(AuthContext);

    // PART 2 — FIX PROTECTED ROUTE LOGIC
    // Do NOT redirect immediately if auth state is still loading.
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Authenticating...</p>
                </div>
            </div>
        );
    }

    const userRole = user?.role?.toLowerCase().trim();
    const requiredRole = role?.toLowerCase().trim();

    console.log(`[ProtectedRoute-TRACE] Path: ${window.location.pathname}, Role: ${userRole}, Required: ${requiredRole}`);

    // Not logged in? Go to login.
    if (!user) {
        console.warn('[ProtectedRoute] Not logged in. Redirecting to /login');
        return <Navigate to="/login" replace />;
    }

    // PART 5 — FIX ROLE CHECK
    if (requiredRole && userRole !== requiredRole) {
        console.warn(`[ProtectedRoute] Role mismatch: ${userRole} !== ${requiredRole}. Redirecting to safety.`);

        // Smart Redirect to their own dashboard
        if (userRole === 'admin') return <Navigate to="/admin" replace />;
        if (userRole === 'employee') return <Navigate to="/employee/dashboard" replace />;

        // If neither, go to login
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
