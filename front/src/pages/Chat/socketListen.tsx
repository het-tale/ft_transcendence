import { useEffect } from 'react';
import { SocketContext } from '../../socket';
import { useToast } from '@chakra-ui/react';
import React from 'react';

const SocketListen = (props: any) => {
    const socket = React.useContext(SocketContext);
    const toast = useToast();

    useEffect(() => {
        const timer = setTimeout(() => {
            socket.on('privateMessage', (data: any) => {
                console.log('MESSAGE DATA', data);
                toast({
                    title: data.from,
                    description: data.message,
                    status: 'info',
                    duration: 9000,
                    isClosable: true,
                    position: 'top-right'
                });
            });
        }, 500);
        socket.on('privateMessageError', (data: any) => {
            console.log('MESSAGE ERROR DATA', data);
        });
        return () => {
            clearTimeout(timer);
        };
    }, [props.render]);
    return <></>;
};

export default SocketListen;
