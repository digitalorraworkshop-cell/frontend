import { io } from 'socket.io-client';

let socket;

export const initSocket = (token) => {
    socket = io('http://localhost:5000', {
        auth: { token }
    });

    socket.on('connect', () => {
        console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
