import client from '../../components/Client';

const GetMessages = async (username: string) => {
    try {
        const res = await client.get(`chat/dms/${username}`, {
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

export default GetMessages;
