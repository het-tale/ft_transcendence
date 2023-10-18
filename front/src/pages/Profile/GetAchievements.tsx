import client from '../../components/Client';

export const GetAchievements = async () => {
    try {
        const res = await client.get(`user/achievements`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        // console.log('RES', res);
        if (res.status === 200) {
            console.log('Achievements data', res);
            return res.data;
        } else {
            return null;
        }
    } catch (error) {
        console.log('Achievements Error', error);
        return null;
    }
};
