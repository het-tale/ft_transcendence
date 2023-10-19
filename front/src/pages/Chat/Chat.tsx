import React, { useEffect } from 'react';
import Dms from './Dms';
import { SocketContext } from '../../socket';
import { useToast } from '@chakra-ui/react';
import GetDms from './GetDms';
import { UserType } from '../../Types/User';
import GetRoomDms from './GetRoomDms';
import { Channel } from '../../Types/Channel';
import { BrowseChannelsProps } from './Channels/BrowseChannels';

export default function Chat(props: BrowseChannelsProps) {
    const socket = React.useContext(SocketContext);
    const [render, setRender] = React.useState(false);
    const toast = useToast();
    const [dms, setDms] = React.useState<UserType[]>([]);
    const [roomDms, setRoomDms] = React.useState<Channel[]>([]);
    // const [updateDm, setUpdateDm] = React.useState(false);

    useEffect(() => {
        GetDms().then((data) => {
            setDms(data);
            // console.log('UPDATE DM');
        });
        GetRoomDms().then((data) => {
            setRoomDms(data);
        });
    }, [render, props.update]);
    socket.on('privateMessage', (data: any) => {
        // console.log('MESSAGE DATA', data);
        setRender(!render);
    });
    socket.on('userOffline', (data: any) => {
        // console.log('USER OFFLINE', data);
        // console.log('RENDER Before', render);
        setRender(!render);
        // console.log('RENDER after', render);
    });
    socket.on('userOnline', (data: any) => {
        // console.log('USER ONLINE', data);
        setRender(!render);
    });
    socket.on('roomCreateError', (data: any) => {
        // console.log('ROOM ERROR DATAAA', data);
        setRender(!render);
    });
    useEffect(() => {
        const timer = setTimeout(() => {
            socket.on('privateMessageError', (data: any) => {
                // console.log('MESSAGE ERROR DATAAA', data);

                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'top-right'
                });
            });
            socket.on('roomMessageError', (data: any) => {
                // console.log('ROOM MESSAGE ERROR DATAAA', data);

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
    socket.on('roomMessage', (data: any) => {
        // console.log('ROOM MESSAGE DATA', data);
        setRender(!render);
    });
    return (
        <Dms
            socket={socket}
            render={render}
            setRender={setRender}
            toast={toast}
            dms={dms}
            setDms={setDms}
            roomDms={roomDms}
            setRoomDms={setRoomDms}
            update={props.update}
            setUpdate={props.setUpdate}
        />
    );
}
