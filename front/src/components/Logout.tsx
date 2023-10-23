import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../socket';

const Logout = () => {
    const navigate = useNavigate();
    const socket = React.useContext(SocketContext);
    useEffect(() => {
        // console.log('The token before logout', localStorage.getItem('token'));
        localStorage.clear();
        // console.log('The token after logout', localStorage.getItem('token'));
        socket.disconnect();
        navigate('/');
    });
    return <></>;
};

export default Logout;
