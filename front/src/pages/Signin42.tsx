import User from '../components/User';
import { useLocation, useNavigate } from 'react-router-dom';

import React from 'react';
import { RenderContext } from '../RenderContext';

const Signin42 = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // console.log(location);
    const renderData = React.useContext(RenderContext);
    const token = location.search.split('=')[1];
    localStorage.setItem('token', token);
    User()
        .then((res) => {
            if (res.isPasswordRequired === true) {
                navigate('/set-password');
            } else {
                renderData.setRenderData(!renderData.renderData);
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
