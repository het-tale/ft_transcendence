import client from '../../../components/Client';
const GetChannelMessages = async (name: string) => {
    console.log('channel name', name);
    try {
        const res = await client.get(`chat/channels/${name}`, {
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

export default GetChannelMessages;
