import React, { useEffect } from 'react';
import client from '../../components/Client';
import { UserType } from '../../Types/User';
import User from '../../components/User';

const GetMessages = async (id: number) => {
    console.log('USERNAME', id);
    try {
        const res = await client.get(`chat/dms/${id}`, {
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
