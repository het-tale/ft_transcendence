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
        localStorage.clear();
        socket.disconnect();
        renderData.setRenderData(!renderData.renderData);
        navigate('/');
    }, []);
    return <></>;
};

export default Logout;
