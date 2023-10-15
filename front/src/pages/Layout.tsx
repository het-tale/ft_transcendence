import {
    Button,
    ButtonGroup,
    Card,
    Flex,
    Text,
    useToast
} from '@chakra-ui/react';
import NavbarSearch from '../components/NavbarSearch';
import Sidebar from '../components/Sidebar';
import '../css/sidebar.css';
import { useEffect, useState } from 'react';
import { Invitation } from '../Types/Invitation';
import React from 'react';
import { SocketContext } from '../socket';
import { RenderContext, RenderContextType } from '../RenderContext';
import { GetPendingInvitations } from '../components/GetNotification';

interface Props {
    children?: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const socket = React.useContext(SocketContext);
    const renderData: RenderContextType = React.useContext(RenderContext);
    const toast = useToast();
    const token = localStorage.getItem('token');
    useEffect(() => {
        socket.auth = { token: token };
        socket.connect();
        const timer = setTimeout(() => {
            socket.on('roomInvitation', (data: any) => {
                console.log('roomInvitation', data);
                toast({
                    title: 'success',
                    description: data.from,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                renderData.setRenderData(!renderData.renderData);
            });
            socket.on('roomInvitationError', (data: any) => {
                console.log('roomInvitationError', data);
                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                renderData.setRenderData(!renderData.renderData);
            });

            socket.on('roomJoined', (data: any) => {
                console.log('roomJoined', data);
                toast({
                    title: 'succes',
                    description: data,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                renderData.setRenderData(!renderData.renderData);
            });

            socket.on('roomInvitationDeclined', (data: any) => {
                console.log('roomDeclined', data);
                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                renderData.setRenderData(!renderData.renderData);
            });
            socket.on('ReceiveInvitation', (data: any) => {
                console.log('ReceiveInvitation', data);
                toast({
                    title: 'success',
                    description: data.from,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                renderData.setRenderData(!renderData.renderData);
            });
        }, 500);

        return () => {
            socket.off('roomInvitation');
            socket.off('roomInvitationError');
            socket.off('roomJoined');
            socket.off('roomInvitationDeclined');
            socket.off('ReceiveInvitation');
            clearTimeout(timer);
        };
    }, [socket]);

    const handleAcceptReject = (notif: Invitation, isAccepted: boolean) => {
        console.log('m handling notification');
        socket.emit('handleRoomInvitation', {
            room: notif.channel.name,
            from: notif.sender.username,
            isAccepted: isAccepted
        });
        renderData.setRenderData(!renderData.renderData);
    };

    useEffect(() => {
        GetPendingInvitations().then((data) => {
            setInvitations(data);
        });
    }, [renderData.renderData]);
    return (
        <Flex flexDirection={'column'}>
            <NavbarSearch />
            <Flex flexDirection={'row'}>
                <Sidebar
                    notification={renderData.notification}
                    setNotification={renderData.setNotification}
                />
                {renderData.notification ? (
                    <div className="notifContainer">
                        <h3 style={{ textAlign: 'center' }}>Notifications</h3>
                        {invitations?.map((invit) => {
                            return (
                                <Card
                                    direction={{ base: 'column', sm: 'row' }}
                                    overflow="hidden"
                                    variant="outline"
                                    bg={'#EEEEFF'}
                                    boxShadow={'2xl'}
                                    p={2}
                                    h={'100px'}
                                    w={'100%'}
                                    style={{ boxShadow: 'none' }}
                                    marginBottom={2}
                                >
                                    <Flex
                                        w={'full'}
                                        justifyContent={'space-between'}
                                    >
                                        <Text
                                            fontWeight={'bold'}
                                            textAlign={'center'}
                                            fontSize={15}
                                            color={'#a435f0'}
                                        >
                                            {`${invit.sender.username} invited you to join ${invit.channel?.name}`}
                                        </Text>
                                        <Flex
                                            justifyContent={'flex-end'}
                                            flexDirection={'column'}
                                        >
                                            <ButtonGroup>
                                                <Button
                                                    backgroundColor={'white'}
                                                    color={'#a435f0'}
                                                    onClick={() =>
                                                        handleAcceptReject(
                                                            invit,
                                                            false
                                                        )
                                                    }
                                                >
                                                    Decline
                                                </Button>
                                                <Button
                                                    backgroundColor={'#a435f0'}
                                                    color={'white'}
                                                    onClick={() =>
                                                        handleAcceptReject(
                                                            invit,
                                                            true
                                                        )
                                                    }
                                                >
                                                    Accept
                                                </Button>
                                            </ButtonGroup>
                                        </Flex>
                                    </Flex>
                                </Card>
                            );
                        })}
                    </div>
                ) : null}
                {children}
            </Flex>
        </Flex>
    );
};
