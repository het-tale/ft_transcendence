import {
    Button,
    ButtonGroup,
    Card,
    Flex,
    Text,
    useToast,
    useDisclosure,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody
} from '@chakra-ui/react';
import NavbarSearch from '../components/NavbarSearch';
import Sidebar from '../components/Sidebar';
import '../css/sidebar.css';
import { useEffect, useState } from 'react';
import { FriendRequest, Invitation } from '../Types/Invitation';
import React from 'react';
import { SocketContext, SocketGameContext } from '../socket';
import { RenderContext, RenderContextType } from '../RenderContext';
import {
    GetPendingFriendRequests,
    GetPendingInvitations
} from '../components/GetNotification';
import { useNavigate } from 'react-router-dom';
import { UserType } from '../Types/User';
import User from '../components/User';
import { SearchUsers } from '../components/SearchUsers';
import { AchievementUnlocked } from './AchievementUnlocked';
import { Achievement } from '../Types/Achievement';
import { set } from 'react-hook-form';
import { MessageType } from '../Types/Message';

interface Props {
    children?: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const socket = React.useContext(SocketContext);
    const socketGame = React.useContext(SocketGameContext);
    const renderData: RenderContextType = React.useContext(RenderContext);
    const toast = useToast();
    const token = localStorage.getItem('token');
    const [roomId, setRoomId] = useState<string>('');
    const [user, setUser] = React.useState<UserType>();
    const [users, setUsers] = React.useState<UserType[]>([]);
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [showHide, setShowHide] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [achievements, setAchievements] = React.useState<Achievement[]>([]);
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
        socket.on('frienRequest', (data: any) => {
            console.log('frienRequest', data);
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
        socket.on('friendRequestSent', () => {
            console.log('friendRequestSent');
            toast({
                title: 'success',
                description: 'Friend request sent',
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            renderData.setRenderData(!renderData.renderData);
        });
        socket.on('friendRequestError', (data: any) => {
            console.log('friendRequestError', data);
            toast({
                title: 'error',
                description: data,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            renderData.setRenderData(!renderData.renderData);
        });
        socket.on('friendRequestAccepted', (data: any) => {
            console.log('friendRequestAccepted', data);
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
        socket.on('friendRequestDeclined', (data: any) => {
            console.log('friendRequestDeclined', data);
            toast({
                title: 'error',
                description: data.from,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            renderData.setRenderData(!renderData.renderData);
        });

        socket.on('friendRemoved', () => {
            console.log('friendRemoved');
            toast({
                title: 'success',
                description: 'Friend removed',
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            renderData.setRenderData(!renderData.renderData);
        });
        socket.on('friendRemoveError', (data: any) => {
            console.log('friendRemoveError', data);
            toast({
                title: 'error',
                description: data,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            renderData.setRenderData(!renderData.renderData);
        });
        socket.on('achievementUnlocked', (data: Achievement) => {
            console.log('achievementUnlocked', data);
            setAchievements([...achievements, data]);
            setIsModalOpen(true);
            renderData.setRenderData(!renderData.renderData);
        });
        socketGame.on('achievementUnlocked', (data: Achievement) => {
            console.log('achievementUnlocked', data);
            setAchievements([...achievements, data]);
            setIsModalOpen(true);
            renderData.setRenderData(!renderData.renderData);
        });
        socket.on('offlineAchievements', (data: Achievement[]) => {
            console.log('offlineAchievements', data);
            setAchievements(data);
            setIsModalOpen(true);
            renderData.setRenderData(!renderData.renderData);
        });
        socket.on('offlineMessages', (data: MessageType[]) => {
            console.log('offlineMessages', data);
            toast({
                title: 'success',
                description: 'You have new messages',
                status: 'success',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            renderData.setRenderData(!renderData.renderData);
        });

        return () => {
            socket.off('roomInvitation');
            socket.off('roomInvitationError');
            socket.off('roomJoined');
            socket.off('roomInvitationDeclined');
            socketGame.off('ReceiveInvitation');
            socketGame.off('InvitationDeclined');
            socket.off('frienRequest');
            socket.off('friendRequestSent');
            socket.off('friendRequestError');
            socket.off('friendRequestAccepted');
            socket.off('friendRequestDeclined');
            socket.off('friendRemoved');
            socket.off('friendRemoveError');
            socket.off('achievementUnlocked');
            socketGame.off('achievementUnlocked');
            socket.off('offlineMessages');
            socket.off('offlineAchievements');
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
    const handleAcceptRejectFriend = (
        notif: FriendRequest,
        isAccepted: boolean
    ) => {
        console.log('m handling friend request');
        socket.emit('handleFriendRequest', {
            from: notif.sender.username,
            isAccepted: isAccepted
        });
        renderData.setRenderData(!renderData.renderData);
    };
    useEffect(() => {
        GetPendingInvitations().then((data) => {
            setInvitations(data);
        });
        GetPendingFriendRequests().then((data) => {
            setFriendRequests(data);
        });
    }, [renderData.renderData]);
    return (
        <Flex flexDirection={'column'}>
            <NavbarSearch
                setUsers={setUsers}
                showHide={showHide}
                setShowHide={setShowHide}
            />
            <Flex flexDirection={'row'}>
                <Sidebar
                    notification={renderData.notification}
                    setNotification={renderData.setNotification}
                    onOpen={onOpen}
                    isOpen={isOpen}
                    onClose={onClose}
                />
                <Drawer placement={'left'} onClose={onClose} isOpen={isOpen}>
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerHeader borderBottomWidth="1px">
                            Notifications
                        </DrawerHeader>
                        <DrawerBody>
                            {invitations?.map((invit) => {
                                return (
                                    <Card
                                        direction={{
                                            base: 'column',
                                            sm: 'row'
                                        }}
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
                                                        backgroundColor={
                                                            'white'
                                                        }
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
                                                        backgroundColor={
                                                            '#a435f0'
                                                        }
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
                            {friendRequests?.map((friend) => {
                                return (
                                    <Card
                                        direction={{
                                            base: 'column',
                                            sm: 'row'
                                        }}
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
                                                {`${friend.sender.username} sent you a friend request`}
                                            </Text>
                                            <Flex
                                                justifyContent={'flex-end'}
                                                flexDirection={'column'}
                                            >
                                                <ButtonGroup>
                                                    <Button
                                                        backgroundColor={
                                                            'white'
                                                        }
                                                        color={'#a435f0'}
                                                        onClick={() =>
                                                            handleAcceptRejectFriend(
                                                                friend,
                                                                false
                                                            )
                                                        }
                                                    >
                                                        Decline
                                                    </Button>
                                                    <Button
                                                        backgroundColor={
                                                            '#a435f0'
                                                        }
                                                        color={'white'}
                                                        onClick={() =>
                                                            handleAcceptRejectFriend(
                                                                friend,
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
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>

                {children}
            </Flex>
            {showHide ? (
                <SearchUsers
                    users={users}
                    setUsers={setUsers}
                    showHide={showHide}
                    setShowHide={setShowHide}
                />
            ) : null}
            <AchievementUnlocked
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                achievements={achievements}
            />
            ;
        </Flex>
    );
};
