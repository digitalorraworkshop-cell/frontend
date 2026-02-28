import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
});

// Request interceptor — attach token from localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 errors carefully
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response, config } = error;
        const currentPath = window.location.pathname;

        if (response && response.status === 401) {
            const url = config?.url || '';
            const message = response.data?.message || '';

            console.warn(`[API-TRACE] 401 Unauthorized detected! Endpoint: ${url}, Msg: ${message}`);

            const skipLogoutPaths = ['/login', '/unauthorized'];
            const isLoginAttempt = url.includes('/auth/login');
            const isHeartbeat = url.includes('/heartbeat');
            const alreadyOnLogin = skipLogoutPaths.some(p => currentPath.toLowerCase().includes(p.toLowerCase()));

            if (!isLoginAttempt && !isHeartbeat && !alreadyOnLogin) {
                console.error('[API-TRACE] Critical Auth Failure (401). Resetting session and redirecting.');

                // Clear all auth data
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('userId');
                localStorage.removeItem('userInfo');

                // Nuclear option: Clear everything to be safe
                // localStorage.clear(); 

                window.location.replace('/login');
            } else {
                console.log('[API-TRACE] 401 suppressed to prevent loop or handled within component.');
            }
        }

        return Promise.reject(error);
    }
);

export default api;
