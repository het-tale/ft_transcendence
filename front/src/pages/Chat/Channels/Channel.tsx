import client from '../../../components/Client';

const Room = async (name: string | undefined) => {
    // console.log('channel name', name);
    try {
        const res = await client.get(`chat/room/${name}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.status === 200) {
            console.log('ROOM ROOM', res);
            return res.data;
        } else {
            console.log('ROOMA ROOMA', res);
            return null;
        }
    } catch (error) {
        console.log('Error ROOM', error);
        return null;
    }
};

export default Room;
