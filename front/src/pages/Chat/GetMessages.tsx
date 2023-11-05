import React from 'react';
import client from '../../components/Client';
import UserId from './GetUserById';
import { UserType } from '../../Types/User';

const GetMessages = async (id: number) => {
    try {
        // let res;
        console.log('id', id);
        const userData = await UserId(id);
        const res = await client.get(`chat/dms/${userData?.username}`, {
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
