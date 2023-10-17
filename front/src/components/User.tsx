import client from './Client';

const User = async () => {
    try {
        const response = await client.get('/auth/me', {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        });
        if (response.status === 200) {
            console.log(' the User', response);
            return response.data;
        } else {
            return null;
        }
    } catch (error) {
        console.log(' the Error', error);
        return null;
    }
};

export default User;
