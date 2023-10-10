import {
    Avatar,
    Box,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Flex,
    Heading,
    IconButton,
    Text,
    Image,
    Center,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import {
    BsThreeDotsVertical,
    BsPencilFill,
    BsVolumeMuteFill,
    BsPersonDashFill,
    BsPersonXFill,
    BsGearFill,
    BsBoxArrowRight,
    BsPersonCircle
} from 'react-icons/bs';
import '../../../css/chat/channelSetting.css';
import MessageUser from '../MessageUser';
import { ChannelInfoProps } from './ChannelInfo';
import ModalConfirm from '../ModalConfirm';
import { on } from 'events';
import { SocketContext } from '../../../socket';
import React, { useEffect } from 'react';

const MemberInfo = (props: ChannelInfoProps) => {
    const socket = React.useContext(SocketContext);
    const [mute, setMute] = React.useState<boolean>(false);
    const [ban, setBan] = React.useState<boolean>(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isOpen2,
        onOpen: onOpen2,
        onClose: onClose2
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
    const handleMuteUser = () => {
        socket.emit('muteUser', {
            room: props.ChannelDm?.name,
            target: props.participant?.username
        });
        props.setRender && props.setRender(!props.render);
        onClose2();
        setMute(true);
    };
    const handleUnMuteUser = () => {
        socket.emit('unmuteUser', {
            room: props.ChannelDm?.name,
            target: props.participant?.username
        });
        props.setRender && props.setRender(!props.render);
        onClose2();
        setMute(false);
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            socket.on('adminAddError', (data: any) => {
                console.log('adminAddError', data);
                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
            });
            socket.on('adminAdded', (data: any) => {
                console.log('adminAdded', data);
                toast({
                    title: 'Success',
                    description: data,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
            });
            socket.on('userMuted', (data: any) => {
                console.log('userMuted', data);
                toast({
                    title: 'success',
                    description: data,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
            });
            socket.on('userMuteError', (data: any) => {
                console.log('userMuteError', data);
                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
            });
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, []);

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
                            {props.user?.id === props.ChannelDm?.ownerId &&
                            !props.ChannelDm?.admins?.some(
                                (admin) => admin.id === props.participant?.id
                            ) ? (
                                <MenuItem
                                    paddingBottom={2}
                                    bg={'none'}
                                    icon={<BsGearFill />}
                                    onClick={onOpen}
                                >
                                    Set Admin
                                    <ModalConfirm
                                        isOpen={isOpen}
                                        onClose={onClose}
                                        onOpen={onOpen}
                                        title={'Set Admin'}
                                        body={
                                            'Are you sure you want to set this user as admin?'
                                        }
                                        handleBlockedUser={handleSetAdmin}
                                    />
                                </MenuItem>
                            ) : null}
                            {props.user &&
                            props.ChannelDm?.admins?.some(
                                (admin) => admin.id === props.user?.id
                            ) &&
                            props.ChannelDm?.ownerId !==
                                props.participant?.id ? (
                                <Box>
                                    <MenuItem
                                        bg={'none'}
                                        icon={<BsVolumeMuteFill />}
                                        onClick={onOpen2}
                                    >
                                        {mute ? 'Unmute' : 'Mute'}
                                        <ModalConfirm
                                            isOpen={isOpen2}
                                            onClose={onClose2}
                                            onOpen={onOpen2}
                                            title={'Mute User'}
                                            body={
                                                'Are you sure you want to mute this user?'
                                            }
                                            handleBlockedUser={
                                                mute
                                                    ? handleMuteUser
                                                    : handleUnMuteUser
                                            }
                                        />
                                    </MenuItem>
                                    <MenuItem
                                        bg={'none'}
                                        icon={<BsPersonXFill />}
                                    >
                                        Kick
                                    </MenuItem>
                                    <MenuItem
                                        bg={'none'}
                                        icon={<BsPersonDashFill />}
                                    >
                                        Ban
                                    </MenuItem>
                                </Box>
                            ) : null}

                            <MenuItem bg={'none'} icon={<BsPersonCircle />}>
                                View Profile
                            </MenuItem>
                        </MenuList>
                    </Menu>
                ) : null}
            </Box>
        </Flex>
    );
};
export default MemberInfo;
