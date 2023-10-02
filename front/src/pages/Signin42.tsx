import { error } from 'console';
import User from '../components/User';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { SocketContext } from '../socket';
import React from 'react';

const Signin42 = () => {
    const navigate = useNavigate();
    const location = useLocation();
    console.log(location);
    const token = location.search.split('=')[1];
    console.log(token);
    localStorage.setItem('token', token);
    const socket = React.useContext(SocketContext);
    useEffect(() => {
        socket.auth = { token: token };
    }, []);
    User()
        .then((res) => {
            console.log('User', res);
            console.log('Password', res.isPasswordRequired);
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
