import React, { useEffect, useState } from 'react';
import '../../css/chat/Right.css';
import { SocketContext } from '../../socket';
import { set } from 'react-hook-form';
import { useToast } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import { io } from 'socket.io-client';

const NotifDm = (props: any) => {
    const toast = useToast();
    const socket = io(`${process.env.REACT_APP_BACKEND_URL}/chat`, {
        withCredentials: true,
        forceNew: true,
        timeout: 100000,
        transports: ['websocket'],
        auth: {
            token: localStorage.getItem('token')
        }
    });
    useEffect(() => {
        const timer = setTimeout(() => {
            socket.on('privateMessage', (data: any) => {
                props.setRender(!props.render);
                toast({
                    title: "You've got a new message",
                    description: data.message,
                    status: 'info',
                    duration: 9000,
                    isClosable: true,
                    position: 'top-right'
                });
            });
        }, 500);
        return () => {
            clearTimeout(timer);
        };
    }, [props.render]);
    return <></>;
};
export default NotifDm;
