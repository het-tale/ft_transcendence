import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import User from './User';

const RequireNoAuth = (props: any) => {
    const navigate = useNavigate();
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await User();
                if (
                    (response !== null &&
                        response.isEmailConfirmed &&
                        response.username !== null &&
                        !response.is2FaEnabled) ||
                    (response.is2FaEnabled && response.is2FaVerified)
                ) {
                    navigate('/home');
                } else {
                    localStorage.clear();
                    if (localStorage.getItem('token') == null) {
                        setIsLoggedOut(true);
                    }
                }
            } catch (error) {
                // console.log('error No auth', error);
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
