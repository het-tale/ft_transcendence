import React, { useEffect } from 'react';
import Dms from './Dms';
import { SocketContext } from '../../socket';
import { useToast } from '@chakra-ui/react';
import GetDms from './GetDms';
import { UserType } from '../../Types/User';

export default function Chat() {
    const socket = React.useContext(SocketContext);
    const [render, setRender] = React.useState(false);
    const toast = useToast();
    const [dms, setDms] = React.useState<UserType[]>([]);
    // const [updateDm, setUpdateDm] = React.useState(false);

    useEffect(() => {
        GetDms().then((data) => {
            setDms(data);
            console.log('UPDATE DM', render);
        });
    }, [render]);
    socket.on('privateMessage', (data: any) => {
        console.log('MESSAGE DATA', data);
        setRender(!render);
    });
    socket.on('userOffline', (data: any) => {
        console.log('USER OFFLINE', data);
        console.log('RENDER Before', render);
        setRender(!render);
        console.log('RENDER after', render);
    });
    socket.on('userOnline', (data: any) => {
        console.log('USER ONLINE', data);
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
    return (
        <>
            <Dms
                socket={socket}
                render={render}
                setRender={setRender}
                toast={toast}
                dms={dms}
                setDms={setDms}
            />
        </>
    );
}
