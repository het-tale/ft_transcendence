import client from '../../components/Client';
import UserId from '../Chat/GetUserById';

export const GetMutualFriendsList = async (id: number | undefined) => {
    try {
        const userData = await UserId(id!);
        const res = await client.get(
            `chat/mutual-friends/${userData?.username}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        if (res.status === 200) {
            return res.data;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};
