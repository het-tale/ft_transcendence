import { useEffect } from 'react';
import { SocketContext } from '../../socket';
import { useToast } from '@chakra-ui/react';
import React from 'react';

const SocketListen = (
    setRender: React.Dispatch<React.SetStateAction<boolean>>,
    render: boolean,
    socket: any
) => {
    // const socket = React.useContext(SocketContext);
    const toast = useToast();
    socket.on('privateMessage', (data: any) => {
        console.log('MESSAGE DATA', data);
        setRender(!render);
    });
    socket.on('privateMessageError', (data: any) => {
        console.log('MESSAGE ERROR DATA', data);
        toast({
            title: 'Error',
            description: data,
            status: 'error',
            duration: 9000,
            isClosable: true,
            position: 'top-right'
        });
    });
    socket.on('userOffline', (data: any) => {
        console.log('USER OFFLINE', data);
    });
    socket.on('userOnline', (data: any) => {
        console.log('USER ONLINE', data);
    });
    return <></>;
};

export default SocketListen;
