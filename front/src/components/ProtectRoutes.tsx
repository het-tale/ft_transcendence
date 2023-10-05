import client from './Client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../socket';

const ProtectRoutes = (props: any) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const socket = React.useContext(SocketContext);
    const token = localStorage.getItem('token');
    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await client.get('/user/me', {
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                });
                if (response.status === 200) {
                    setIsLoggedIn(true);
                    socket.auth = { token: token };
                    socket.connect();
                } else {
                    navigate('/');
                }
            } catch (error) {
                socket.disconnect();
                navigate('/');
            }
        };

        checkAuthentication();
        if (props.firstLogin === false) {
            navigate('/home');
        }
    }, [navigate]);

    if (isLoggedIn) {
        return <React.Fragment>{props.children}</React.Fragment>;
    } else {
        return null;
    }
};

export default ProtectRoutes;
