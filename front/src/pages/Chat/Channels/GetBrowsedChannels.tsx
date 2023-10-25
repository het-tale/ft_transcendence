import client from '../../../components/Client';

export const GetBrowsedChannels = async () => {
    try {
        const res = await client.get('chat/browse-channels-list', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (res.status === 200) {
            console.log('RES DATAAAAA');
            return res.data;
        } else {
            return null;
        }
    } catch (error) {
        console.log('Error', error);
        return null;
    }
};
