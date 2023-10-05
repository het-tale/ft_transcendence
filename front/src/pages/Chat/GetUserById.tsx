import client from '../../components/Client';

const UserId = async (id: number) => {
    try {
        const response = await client.get(`/user/${id}`, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            }
        });
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
};

export default UserId;
