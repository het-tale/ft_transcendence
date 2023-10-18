import client from '../../components/Client';

const GetDms = async () => {
    try {
        const res = await client.get('chat/dms-list', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        // console.log('RES', res);
        if (res.status === 200) {
            // console.log('RES DATAAAAA');
            return res.data;
        } else {
            return null;
        }
    } catch (error) {
        // console.log('Error', error);
        return null;
    }
};

export default GetDms;
