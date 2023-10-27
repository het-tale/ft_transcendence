import client from '../components/Client';

export const GetLeaderBoard = async () => {
    try {
        const res = await client.get('user/leader-board', {
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
        console.log('Error leader', error);
        return null;
    }
};
