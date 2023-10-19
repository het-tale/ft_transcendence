import User from '../components/User';
import { useLocation, useNavigate } from 'react-router-dom';

import React from 'react';

const Signin42 = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // console.log(location);
    const token = location.search.split('=')[1];
    localStorage.setItem('token', token);
    User()
        .then((res) => {
            if (res.isPasswordRequired === true) {
                navigate('/set-password');
            } else {
                navigate('/home');
            }
        })
        .catch((error) => {
            console.log('Error', error);
            navigate('/');
        });
    return <div></div>;
};

export default Signin42;
