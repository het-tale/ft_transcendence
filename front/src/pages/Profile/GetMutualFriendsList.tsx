import client from '../../components/Client';

export const GetMutualFriendsList = async (username: string | undefined) => {
    try {
        const res = await client.get(`chat/mutual-friends/${username}`, {
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
