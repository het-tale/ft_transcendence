import client from '../../components/Client';

export const GetAchievements = async (username: string | undefined) => {
    try {
        const res = await client.get(`user/achievements/${username}`, {
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
