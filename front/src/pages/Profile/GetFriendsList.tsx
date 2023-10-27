import client from '../../components/Client';

export const GetFriendsList = async () => {
    try {
        const res = await client.get('chat/friends', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.status === 200) {
            return res.data;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};
