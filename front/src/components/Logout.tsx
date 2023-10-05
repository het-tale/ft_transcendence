import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();
    useEffect(() => {
        console.log('The token before logout', localStorage.getItem('token'));
        localStorage.clear();
        console.log('The token after logout', localStorage.getItem('token'));
        navigate('/');
    }, []);
    return <></>;
};

export default Logout;
