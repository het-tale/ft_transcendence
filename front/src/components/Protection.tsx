import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import User from './User';

const ProtectPassword = (props: any) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isProtected, setIsProtected] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await User();
                if (response !== null) {
                    setIsLoggedIn(true);
                    if (props.name === 'password') {
                        setIsProtected(response.isPasswordRequired);
                    } else if (props.name === 'confirmation') {
                        setIsProtected(!response.isEmailConfirmed);
                    }
                } else {
                    navigate('/');
                }
            } catch (error) {
                navigate('/');
            }
        };

        checkAuthentication();
    }, []);

    if (isLoggedIn) {
        if (isProtected) {
            return <React.Fragment>{props.child}</React.Fragment>;
        } else {
            navigate('/home');
        }
        return null;
    } else {
        return null;
    }
};

export default ProtectPassword;
