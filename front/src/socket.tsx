import React from 'react';
import { io } from 'socket.io-client';

let token = localStorage.getItem('token');
console.log('Socket token', token);
const URL = 'http://localhost:3001/chat';

export let socket: any;
if (token) {
    socket = io(URL, {
        withCredentials: true,
        forceNew: true,
        timeout: 100000,
        transports: ['websocket'],
        auth: {
            token: token
        }
    });
}

export const SocketContext = React.createContext(socket);
