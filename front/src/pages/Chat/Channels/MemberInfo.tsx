import {
    Box,
    Flex,
    IconButton,
    Text,
    Image,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import {
    BsThreeDotsVertical,
    BsVolumeMuteFill,
    BsPersonDashFill,
    BsPersonXFill,
    BsGearFill,
    BsPersonCircle
} from 'react-icons/bs';
import '../../../css/chat/channelSetting.css';
import { ChannelInfoProps } from './ChannelInfo';
import ModalConfirm from '../ModalConfirm';
import { SocketContext } from '../../../socket';
import React, { useEffect } from 'react';
import client from '../../../components/Client';
import { Link } from 'react-router-dom';

const MemberInfo = (props: ChannelInfoProps) => {
    const socket = React.useContext(SocketContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isOpen2,
        onOpen: onOpen2,
        onClose: onClose2
    } = useDisclosure();
    const {
        isOpen: isOpen3,
        onOpen: onOpen3,
        onClose: onClose3
    } = useDisclosure();
    const {
        isOpen: isOpen4,
        onOpen: onOpen4,
        onClose: onClose4
    } = useDisclosure();
    const toast = useToast();
    const handleSetAdmin = () => {
        socket.emit('addAdmin', {
            room: props.ChannelDm?.name,
            target: props.participant?.username
        });
        props.setRender && props.setRender(!props.render);
        onClose();
    };
    const handleRemoveAdmin = async () => {
        const data = {
            name: props.room?.name,
            admin: props.participant?.username
        };
        // console.log('remove admin logic');
        try {
            await client.post('chat/remove-admin', data, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            });
            props.setRender && props.setRender(!props.render);
            onClose();
        } catch (error: any) {
            console.log('error', error);
            toast({
                title: 'Error',
                description: error.response.data.message,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            onClose();
        }
    };
    const handleMuteUser = () => {
        // console.log('mute user logic', props.room?.muted[0]);
        socket.emit('muteUser', {
            room: props.ChannelDm?.name,
            target: props.participant?.username
        });
        props.setRender && props.setRender(!props.render);
        onClose2();
    };
    const handleUnMuteUser = () => {
        socket.emit('unmuteUser', {
            room: props.ChannelDm?.name,
            target: props.participant?.username
        });
        props.setRender && props.setRender(!props.render);
        onClose2();
    };
    const handleKickUser = () => {
        // console.log('kick user logic');
        socket.emit('kickUser', {
            room: props.room?.name,
            target: props.participant?.username
        });
        props.setRender && props.setRender(!props.render);
        onClose3();
    };
    const handleBanUser = () => {
        // console.log('ban user logic', props.room?.name);
        socket.emit('banneUser', {
            room: props.room?.name,
            target: props.participant?.username
        });
        props.setRender && props.setRender(!props.render);
        onClose4();
    };
    const handleUnbanUser = () => {
        // console.log('unban user logic');
        socket.emit('unbanUser', {
            room: props.room?.name,
            target: props.participant?.username
        });
        props.setRender && props.setRender(!props.render);
        onClose4();
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            socket.on('adminAddError', (data: any) => {
                // console.log('adminAddError', data);
                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });
            socket.on('adminAdded', (data: any) => {
                // console.log('adminAdded', data);
                toast({
                    title: 'Success',
                    description: data,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });
            socket.on('userMuted', (data: any) => {
                // console.log('userMuted', data);
                toast({
                    title: 'success',
                    description: data,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });
            socket.on('userMuteError', (data: any) => {
                // console.log('userMuteError', data);
                // console.log('mute usererror logic', props.room?.name);
                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });
            socket.on('userKicked', (data: any) => {
                // console.log('userKicked', data);
                toast({
                    title: 'success',
                    description: data,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });
            socket.on('userKickError', (data: any) => {
                // console.log('userKickError', data);
                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });

            socket.on('userUnmuted', (data: any) => {
                // console.log('userUnMuted', data);
                toast({
                    title: 'success',
                    description: data,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });
            socket.on('userUnmuteError', (data: any) => {
                // console.log('userUnmuteError', data);
                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });
            socket.on('userBanned', (data: any) => {
                // console.log('userBanned', data);
                toast({
                    title: 'success',
                    description: data,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });
            socket.on('userBanError', (data: any) => {
                // console.log('userBanError', data);
                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });

            socket.on('userUnbanned', (data: any) => {
                // console.log('userUnbanned', data);
                toast({
                    title: 'success',
                    description: data,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });
            socket.on('userUnbanError', (data: any) => {
                // console.log('userUnbanError', data);
                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });
            socket.on('roomLeft', (data: any) => {
                // console.log('roomLeft', data);
                toast({
                    title: 'success',
                    description: data,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });
            socket.on('roomLeaveError', (data: any) => {
                // console.log('roomLeaveError', data);
                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
                props.setRender && props.setRender(!props.render);
            });
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    });
    // console.log('ROOMMMMMMM', props.room);
    return (
        <Flex bg={'#F5F5F5'} p={'10px'} marginBottom={8} marginTop={-6}>
            <Box w={'90%'}>
                <Flex>
                    <Image
                        src={props.participant?.avatar}
                        borderRadius={'30px'}
                        width={'50px'}
                        height={'50px'}
                        marginRight={'10px'}
                    />
                    <Text
                        as="h6"
                        size="sm"
                        marginLeft={'-5px'}
                        marginTop={'20px'}
                    >
                        {props.participant?.username}
                    </Text>
                </Flex>
            </Box>
            <Box w={'10%'}>
                {props.participant?.id !== props.user?.id ? (
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={
                                <BsThreeDotsVertical
                                    color="#a435f0"
                                    size={40}
                                />
                            }
                            variant="outline"
                            border={'none'}
                            marginTop={1.5}
                        />
                        <MenuList
                            marginRight={0}
                            bg={'#c56af0'}
                            color={'white'}
                            w={300}
                            p={6}
                            fontFamily={'krona one'}
                            borderRadius={20}
                            marginTop={-25}
                        >
                            {props.user?.id === props.room?.ownerId ? (
                                <MenuItem
                                    paddingBottom={2}
                                    bg={'none'}
                                    icon={<BsGearFill />}
                                    onClick={onOpen}
                                >
                                    {props.room?.admins?.some(
                                        (admin) =>
                                            admin.id === props.participant?.id
                                    )
                                        ? 'Remove Admin'
                                        : 'Set Admin'}
                                    <ModalConfirm
                                        isOpen={isOpen}
                                        onClose={onClose}
                                        onOpen={onOpen}
                                        title={'Set Admin'}
                                        body={
                                            props.room?.admins?.some(
                                                (admin) =>
                                                    admin.id ===
                                                    props.participant?.id
                                            )
                                                ? 'Are you sure you want to remove this user as admin?'
                                                : 'Are you sure you want to set this user as admin?'
                                        }
                                        handleBlockedUser={
                                            props.room?.admins?.some(
                                                (admin) =>
                                                    admin.id ===
                                                    props.participant?.id
                                            )
                                                ? handleRemoveAdmin
                                                : handleSetAdmin
                                        }
                                    />
                                </MenuItem>
                            ) : null}
                            {props.user &&
                            props.room?.admins?.some(
                                (admin) => admin.id === props.user?.id
                            ) &&
                            props.room?.ownerId !== props.participant?.id ? (
                                <Box>
                                    <MenuItem
                                        bg={'none'}
                                        icon={<BsVolumeMuteFill />}
                                        onClick={onOpen2}
                                    >
                                        {props.room?.muted.some(
                                            (muted) =>
                                                muted.id ===
                                                props.participant?.id
                                        )
                                            ? 'Unmute'
                                            : 'Mute'}
                                        <ModalConfirm
                                            isOpen={isOpen2}
                                            onClose={onClose2}
                                            onOpen={onOpen2}
                                            title={'Mute User'}
                                            body={
                                                props.room?.muted?.some(
                                                    (muted) =>
                                                        muted.id ===
                                                        props.participant?.id
                                                )
                                                    ? 'Are you sure you want to unmute this user?'
                                                    : 'Are you sure you want to mute this user?'
                                            }
                                            handleBlockedUser={
                                                props.room?.muted?.some(
                                                    (muted) =>
                                                        muted.id ===
                                                        props.participant?.id
                                                )
                                                    ? handleUnMuteUser
                                                    : handleMuteUser
                                            }
                                        />
                                    </MenuItem>
                                    <MenuItem
                                        bg={'none'}
                                        icon={<BsPersonXFill />}
                                        onClick={onOpen3}
                                    >
                                        Kick
                                        <ModalConfirm
                                            isOpen={isOpen3}
                                            onClose={onClose3}
                                            onOpen={onOpen3}
                                            title={'Kick User'}
                                            body={
                                                'Are you sure you want to kick this user?'
                                            }
                                            handleBlockedUser={handleKickUser}
                                        />
                                    </MenuItem>
                                    <MenuItem
                                        bg={'none'}
                                        icon={<BsPersonDashFill />}
                                        onClick={onOpen4}
                                    >
                                        {props.room.banned.some(
                                            (banned) =>
                                                banned.id ===
                                                props.participant?.id
                                        )
                                            ? 'Unban'
                                            : 'Ban'}
                                        <ModalConfirm
                                            isOpen={isOpen4}
                                            onClose={onClose4}
                                            onOpen={onOpen4}
                                            title={'Ban User'}
                                            body={
                                                props.room.banned.some(
                                                    (banned) =>
                                                        banned.id ===
                                                        props.participant?.id
                                                )
                                                    ? 'Are you sure you want to unban this user?'
                                                    : 'Are you sure you want to ban this user?'
                                            }
                                            handleBlockedUser={
                                                props.room.banned.some(
                                                    (banned) =>
                                                        banned.id ===
                                                        props.participant?.id
                                                )
                                                    ? handleUnbanUser
                                                    : handleBanUser
                                            }
                                        />
                                    </MenuItem>
                                </Box>
                            ) : null}

                            <Link to={`/user-profile/${props.participant?.id}`}>
                                <MenuItem bg={'none'} icon={<BsPersonCircle />}>
                                    View Profile
                                </MenuItem>
                            </Link>
                        </MenuList>
                    </Menu>
                ) : null}
            </Box>
        </Flex>
    );
};
export default MemberInfo;
