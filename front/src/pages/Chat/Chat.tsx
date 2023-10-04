import React, { useEffect } from 'react';
import Dms from './Dms';
import { SocketContext } from '../../socket';
import { useToast } from '@chakra-ui/react';

export default function Chat() {
    const socket = React.useContext(SocketContext);
    const [render, setRender] = React.useState(false);
    const toast = useToast();

    socket.on('privateMessage', (data: any) => {
        console.log('MESSAGE DATA', data);
        setRender(!render);
    });
    useEffect(() => {
        const timer = setTimeout(() => {
            socket.on('privateMessageError', (data: any) => {
                console.log('MESSAGE ERROR DATAAA', data);

                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'top-right'
                });
            });
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, []);
    socket.on('userOffline', (data: any) => {
        console.log('USER OFFLINE', data);
        setRender(!render);
    });
    socket.on('userOnline', (data: any) => {
        console.log('USER ONLINE', data);
        setRender(!render);
    });
    return (
        <>
            <Dms
                socket={socket}
                render={render}
                setRender={setRender}
                toast={toast}
            />
        </>
    );
}
