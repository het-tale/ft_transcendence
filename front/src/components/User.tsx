import client from './Client';

const User = async () => {
    try {
        const response = await client.get('/user/me', {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        });
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};

export default User;
