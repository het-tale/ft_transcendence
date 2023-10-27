import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../socket';

const Logout = () => {
    const navigate = useNavigate();
    const socket = React.useContext(SocketContext);
    useEffect(() => {
        localStorage.clear();
        socket.disconnect();
        navigate('/');
    });
    return <></>;
};

export default Logout;
