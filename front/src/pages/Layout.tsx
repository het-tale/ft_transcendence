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
import { SocketContext, SocketGameContext } from '../socket';
import { RenderContext, RenderContextType } from '../RenderContext';
import { GetPendingInvitations } from '../components/GetNotification';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../Types/User';
import User from '../components/User';

interface Props {
    children?: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const socket = React.useContext(SocketContext);
    const socketGame = React.useContext(SocketGameContext);
    const renderData: RenderContextType = React.useContext(RenderContext);
    const toast = useToast();
    const token = localStorage.getItem('token');
    const [roomId, setRoomId] = useState<string>('');
    const [user, setUser] = React.useState<UserType>();
    const navigate = useNavigate();
    React.useEffect(() => {
        async function fetchUserData() {
            const currentUserData = await User();
            setUser(currentUserData);
        }

        fetchUserData();
    }, []);
    useEffect(() => {
        socket.auth = { token: token };
        socket.connect();
        socketGame.auth = { token: token };
        socketGame.connect();
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
            socketGame.on('ReceiveInvitation', (data: any) => {
                console.log('ReceiveInvitation', data);
                toast({
                    title: 'success',
                    description: data.senderName,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                renderData.setRenderData(!renderData.renderData);
                setRoomId(data.roomId);
            });
            socketGame.on('InvitationDeclined', () => {
                console.log('InvitationDeclined');
                toast({
                    title: 'InvitationDeclined',
                    description: '',
                    status: 'info',
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
            socketGame.off('ReceiveInvitation');
            socketGame.off('InvitationDeclined');
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

    const handleAcceptRejectGame = (isAccepted: boolean) => {
        if (isAccepted) {
            socketGame.emit('AcceptInvitation', roomId);
            navigate(`/game`);
        } else socketGame.emit('DeclineInvitation', roomId);
        renderData.setRenderData(!renderData.renderData);
        renderData.setNotification &&
            renderData.setNotification(!renderData.notification);
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
                                            {invit.isGame
                                                ? `${invit.sender.username} invited you to play a game`
                                                : `${invit.sender.username} invited you to join ${invit.channel?.name}`}
                                        </Text>
                                        <Flex
                                            justifyContent={'flex-end'}
                                            flexDirection={'column'}
                                        >
                                            <ButtonGroup>
                                                <Button
                                                    backgroundColor={'white'}
                                                    color={'#a435f0'}
                                                    onClick={
                                                        invit.isGame
                                                            ? () =>
                                                                  handleAcceptRejectGame(
                                                                      false
                                                                  )
                                                            : () =>
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
                                                    onClick={
                                                        invit.isGame
                                                            ? () =>
                                                                  handleAcceptRejectGame(
                                                                      true
                                                                  )
                                                            : () =>
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
