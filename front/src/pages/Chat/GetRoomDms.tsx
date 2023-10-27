import client from '../../components/Client';

const GetRoomDms = async () => {
    try {
        const res = await client.get('chat/my-channels-list', {
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

export default GetRoomDms;
