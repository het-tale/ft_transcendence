import client from './Client';
import { useLocation } from 'react-router-dom';

const Email = async () => {
    const location = useLocation();
    console.log(location);
    const token = location.search.split('=')[1];
    console.log(token);
    await client.get('/auth/confirm-email?token=' + token);
    return null;
};

export default Email;
