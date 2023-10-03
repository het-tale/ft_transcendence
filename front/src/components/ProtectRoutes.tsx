import client from './Client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectRoutes = (props: any) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await client.get('/user/me', {
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                });
                if (response.status === 200) {
                    setIsLoggedIn(true);
                } else {
                    navigate('/');
                }
            } catch (error) {
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
