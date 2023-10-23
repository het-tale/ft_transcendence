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
                const response = await client.get('/auth/me', {
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                });
                if (response.status === 200 && response.data.isEmailConfirmed) {
                    // console.log('response User', response.data);
                    if (response.data.is2FaEnabled) {
                        if (response.data.is2FaVerified) {
                            setIsLoggedIn(true);
                            socket.auth = { token: token };
                            socket.connect();
                        } else {
                            // console.log('2fa not verified');
                            navigate('/verify-2fa');
                        }
                    } else {
                        setIsLoggedIn(true);
                        socket.auth = { token: token };
                        socket.connect();
                    }
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
    });

    if (isLoggedIn) {
        return <React.Fragment>{props.children}</React.Fragment>;
    } else {
        return null;
    }
};

export default ProtectRoutes;
