import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../socket';
import { RenderContext } from '../RenderContext';

const Logout = () => {
    const navigate = useNavigate();
    const socket = React.useContext(SocketContext);
    const renderData = React.useContext(RenderContext);
    useEffect(() => {
        // console.log('The token before logout', localStorage.getItem('token'));
        localStorage.clear();
        // console.log('The token after logout', localStorage.getItem('token'));
        socket.disconnect();
        renderData.setRenderData(!renderData.renderData);
        navigate('/');
    });
    return <></>;
};

export default Logout;
