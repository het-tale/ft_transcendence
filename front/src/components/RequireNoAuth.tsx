import client from './Client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import User from './User';

const RequireNoAuth = (props: any) => {
    const navigate = useNavigate();
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    useEffect(() => {
        const checkAuthentication = async () => {
            const response = await User();
            if (response !== null) {
                navigate('/home');
            } else {
                localStorage.clear();
                if (localStorage.getItem('token') == null) {
                    setIsLoggedOut(true);
                }
            }
        };
        checkAuthentication();
    }, [navigate]);
    if (isLoggedOut) {
        return <React.Fragment>{props.children}</React.Fragment>;
    } else {
        return null;
    }
};

export default RequireNoAuth;
