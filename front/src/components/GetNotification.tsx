import client from './Client';

export const GetPendingFriendRequests = async () => {
    try {
        const res = await client.get('user/pending-friend-requests', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        // console.log('RES', res);
        if (res.status === 200) {
            return res.data;
        } else {
            return null;
        }
    } catch (error) {
        console.log('Error', error);
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
        // console.log('RES pending invitations', res);
        if (res.status === 200) {
            return res.data;
        } else {
            return null;
        }
    } catch (error) {
        console.log('Error pending invitations', error);
        return null;
    }
};
