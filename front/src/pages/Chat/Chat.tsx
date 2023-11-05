import React, { useEffect } from 'react';
import Dms from './Dms';
import { SocketContext } from '../../socket';
import { useToast } from '@chakra-ui/react';
import GetDms from './GetDms';
import { UserType } from '../../Types/User';
import GetRoomDms from './GetRoomDms';
import { Channel } from '../../Types/Channel';
import { BrowseChannelsProps } from './Channels/BrowseChannels';
import { RenderContext } from '../../RenderContext';

export default function Chat(props: BrowseChannelsProps) {
    const socket = React.useContext(SocketContext);
    const [render, setRender] = React.useState(false);
    const toast = useToast();
    const [dms, setDms] = React.useState<UserType[]>([]);
    const [roomDms, setRoomDms] = React.useState<Channel[]>([]);
    const renderData = React.useContext(RenderContext);

    useEffect(() => {
        GetDms().then((data) => {
            setDms(data);
            // console.log('UPDATE DM');
        });
        GetRoomDms().then((data) => {
            setRoomDms(data);
        });
    }, [render, props.update, renderData.renderData]);
    useEffect(() => {
        socket.on('privateMessage', (data: any) => {
            console.log('privateMessage Data', data);
            renderData.setCount && renderData.setCount(renderData.count! + 1);
            setRender(!render);
            renderData.setRenderData(!renderData.renderData);
        });
        socket.on('roomCreateError', (data: any) => {
            console.log('roomCreateError', data);
            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 1000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('privateMessageError', (data: any) => {
            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 1000,
                isClosable: true,
                position: 'bottom-right'
            });
        });
        socket.on('roomMessage', (data: any) => {
            setRender(!render);
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
        socket.on('channelDeleted', () => {
            console.log('channelDeleted');
            toast({
                title: 'Success',
                description: 'Channel deleted',
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('channelDeleteError', (data: string) => {
            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('adminAddError', (data: any) => {
            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('adminAdded', (data: any) => {
            toast({
                title: 'Success',
                description: data,
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            console.log('admin added');
            setRender(!render);
        });
        socket.on('userMuted', (data: any) => {
            toast({
                title: 'success',
                description: data,
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('userMuteError', (data: any) => {
            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('userKicked', (data: any) => {
            console.log('userKicked', data);
            toast({
                title: 'success',
                description: data,
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('userKickError', (data: any) => {
            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });

        socket.on('userUnmuted', (data: any) => {
            toast({
                title: 'success',
                description: data,
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('userUnmuteError', (data: any) => {
            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('userBanned', (data: any) => {
            toast({
                title: 'success',
                description: data,
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('userBanError', (data: any) => {
            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });

        socket.on('userUnbanned', (data: any) => {
            toast({
                title: 'success',
                description: data,
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('userUnbanError', (data: any) => {
            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('roomLeft', (data: any) => {
            toast({
                title: 'success',
                description: data,
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        socket.on('roomLeaveError', (data: any) => {
            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            setRender(!render);
        });
        return () => {
            socket.off('privateMessageError');
            socket.off('roomMessageError');
            socket.off('privateMessage');
            socket.off('roomCreateError');
            socket.off('roomMessage');
            socket.off('channelDeleted');
            socket.off('channelDeleteError');
            socket.off('userKicked');
            socket.off('userKickError');
            socket.off('userMuted');
            socket.off('userMuteError');
            socket.off('userUnmuted');
            socket.off('userUnmuteError');
            socket.off('userBanned');
            socket.off('userBanError');
            socket.off('userUnbanned');
            socket.off('userUnbanError');
            socket.off('roomLeft');
            socket.off('roomLeaveError');
            socket.off('adminAddError');
            socket.off('adminAdded');
        };
    }, [socket, render]);
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
