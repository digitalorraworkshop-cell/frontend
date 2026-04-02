import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const useInactivity = (timeout = 60000) => {
    const [isIdle, setIsIdle] = useState(false);
    const timerRef = useRef(null);
    const isIdleRef = useRef(false); // Use ref to avoid stale closures in event handlers

    const handleInactivity = useCallback(() => {
        if (isIdleRef.current) return; // Already idle, don't fire again
        isIdleRef.current = true;
        setIsIdle(true);
        console.log('Inactivity detected (60s)');

        toast.error("You have been inactive for 1 minute.", {
            duration: 5000,
            icon: '📸',
        });

        api.post('/activity/status', {
            status: 'Idle',
            activeWindowTitle: 'System Idle',
            idleTime: 60
        }).catch(console.error);

        if (window.electron) {
            window.electron.send('capture-immediate', { status: 'Idle' });
        }
    }, []);

    const resetTimer = useCallback(() => {
        if (isIdleRef.current) {
            console.log('User active again, switching to Working...');
            isIdleRef.current = false;
            setIsIdle(false);
            api.post('/activity/status', { status: 'Working' }).catch(console.error);
        }
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(handleInactivity, timeout);
    }, [handleInactivity, timeout]);

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        // Start initial timer
        timerRef.current = setTimeout(handleInactivity, timeout);

        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            clearTimeout(timerRef.current);
        };
    }, [resetTimer, handleInactivity, timeout]); // stable callbacks, won't cause re-registration

    return isIdle;
};

export default useInactivity;
