import client from './Client';

export const GetPendingFriendRequests = async () => {
    try {
        const res = await client.get('user/pending-friend-requests', {
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

export const GetPendingInvitations = async () => {
    try {
        const res = await client.get('user/pending-invitaions', {
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
