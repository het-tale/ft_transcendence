import client from '../../components/Client';
import UserId from '../Chat/GetUserById';

export const GetMatchHistory = async (id: number) => {
    try {
        const userData = await UserId(id);
        const res = await client.get(`user/match-history/${userData.username}`, {
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
