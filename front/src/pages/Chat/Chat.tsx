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
        setRender(!render);
    });
    socket.on('roomCreateError', (data: any) => {
        setRender(!render);
    });
    useEffect(() => {
        socket.on('privateMessageError', (data: any) => {
            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 1000,
                isClosable: true,
                position: 'top-right'
            });
        });
        socket.on('roomMessageError', (data: any) => {
            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 1000,
                isClosable: true,
                position: 'top-right'
            });
        });

        return () => {
            socket.off('privateMessageError');
            socket.off('roomMessageError');
        };
    });
    socket.on('roomMessage', (data: any) => {
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
