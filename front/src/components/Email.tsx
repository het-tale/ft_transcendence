import client from './Client';
import { useLocation } from 'react-router-dom';

const Email = async () => {
    const location = useLocation();
    const token = location.search.split('=')[1];
    await client.get('/auth/confirm-email?token=' + token);
    return null;
};

export default Email;
