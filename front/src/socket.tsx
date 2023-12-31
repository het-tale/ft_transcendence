import React from 'react';
import { io } from 'socket.io-client';

let token = localStorage.getItem('token');
const URL = `${process.env.REACT_APP_BACKEND_URL}/chat`;

export const socket = io(URL, {
    withCredentials: true,
    forceNew: true,
    timeout: 100000,
    transports: ['websocket'],
    auth: {
        token: token
    },
    autoConnect: false
});

export const SocketContext = React.createContext(socket);

export const socketGame = io(`${process.env.REACT_APP_BACKEND_URL}/game`, {
    withCredentials: true,
    forceNew: true,
    timeout: 100000,
    transports: ['websocket'],
    auth: { token: token },
    autoConnect: false
});

export const SocketGameContext = React.createContext(socketGame);
