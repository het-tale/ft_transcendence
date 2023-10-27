import client from '../../../components/Client';

const Room = async (name: string | undefined) => {
    try {
        const res = await client.get(`chat/room/${name}`, {
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

export default Room;
