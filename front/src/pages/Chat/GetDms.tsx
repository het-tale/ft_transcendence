import client from "../../components/Client";

const GetDms = async () => {
        try {
            const res = await client.get('chat/dms-list', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (res.status === 200) {
                return res.data;
              }
              else {
                return null;
              }
        }
        catch (error) {
            return null;
        }
}

export default GetDms;