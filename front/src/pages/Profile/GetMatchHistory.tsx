import client from '../../components/Client';

export const GetMatchHistory = async () => {
    try {
        const res = await client.get(`user/match-history`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        // console.log('RES', res);
        if (res.status === 200) {
            console.log('Match History data', res);
            return res.data;
        } else {
            return null;
        }
    } catch (error) {
        console.log('Match Error', error);
        return null;
    }
};
