import client from '../../components/Client';

export const GetFriendsList = async () => {
    try {
        const res = await client.get('chat/friends', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        console.log('RES', res);
        if (res.status === 200) {
            console.log('Friends data', res);
            return res.data;
        } else {
            return null;
        }
    } catch (error) {
        console.log('Error', error);
        return null;
    }
};
