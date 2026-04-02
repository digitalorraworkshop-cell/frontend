import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        user: null,
        loading: true
    });

    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');
            const userId = localStorage.getItem('userId');
            const userInfo = localStorage.getItem('userInfo');

            if (token && role && userId) {
                try {
                    let parsed = userInfo ? JSON.parse(userInfo) : {};
                    const userObj = {
                        ...parsed,
                        token,
                        role: role.toLowerCase().trim(),
                        _id: userId,
                        id: userId
                    };
                    console.log(`[AUTH-TRACE] Init: role identified as ${userObj.role}`);
                    setAuthState({ user: userObj, loading: false });
                } catch (e) {
                    console.error('[AUTH-TRACE] Init failed');
                    setAuthState({ user: null, loading: false });
                }
            } else {
                setAuthState({ user: null, loading: false });
            }
        };
        initAuth();
    }, []);

    const login = async (emailOrUsername, password) => {
        console.log(`[AUTH-TRACE] Login starting for ${emailOrUsername}`);
        setAuthState(prev => ({ ...prev, loading: true }));
        try {
            const { data } = await api.post('/auth/login', {
                email: emailOrUsername.toLowerCase().trim(),
                password: password.trim(),
            });

            if (!data?.token) throw new Error('Invalid login response');

            const normalizedRole = data.role?.toLowerCase().trim();
            const normalizedId = data._id || data.id;

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', normalizedRole);
            localStorage.setItem('userId', normalizedId);
            localStorage.setItem('userInfo', JSON.stringify(data));

            const userObj = { ...data, id: normalizedId, role: normalizedRole };

            console.log(`[AUTH-TRACE] Login success. Role: ${normalizedRole}`);
            setAuthState({ user: userObj, loading: false });
            return userObj;
        } catch (error) {
            console.error('[AUTH-TRACE] Login error catch');
            setAuthState({ user: null, loading: false });
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const logout = () => {
        console.log('[AUTH-TRACE] Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('userInfo');
        setAuthState({ user: null, loading: false });
    };

    const user = authState.user;
    const loading = authState.loading;
    const token = user?.token ?? null;

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
