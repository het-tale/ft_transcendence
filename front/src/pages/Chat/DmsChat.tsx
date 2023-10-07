import {
    BsController,
    BsPersonCircle,
    BsPersonFillSlash,
    BsThreeDots,
    BsTrash,
    BsX
} from 'react-icons/bs';
import MessageContent from './MessageContent';
import TypingBar from './TypingBar';
import {
    Box,
    Flex,
    Grid,
    GridItem,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    SimpleGrid,
    Spacer,
    background,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import MessageUser from './MessageUser';
import React, { useEffect } from 'react';
import { SocketContext } from '../../socket';
import GetDms from './GetDms';
import { UserType } from '../../Types/User';
import { MessageType } from '../../Types/Message';
import GetMessages from './GetMessages';
import User from '../../components/User';
import ModalUi from '../../components/ModalUi';
import ModalConfirm from './ModalConfirm';
import client from '../../components/Client';
import { on } from 'events';
import Profile from '../Profile/Profile';
import { Link } from 'react-router-dom';
import UserDmInfo from './UserDmInfo';

const DmsChat = (props: any) => {
    const toast = useToast();
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
    const [user, setUser] = React.useState<UserType>();
    const [blocked, setBlocked] = React.useState(false);
    useEffect(() => {
        async function fetchUserData() {
            const userData = await User();
            setUser(userData);
            console.log('USERRRRR1', userData);
        }

        fetchUserData();
    }, []);
    const [dms, setDms] = React.useState<UserType[]>([]);
    const socket = React.useContext(SocketContext);
    const [messages, setMessages] = React.useState<MessageType[]>([]);
    // const [render, setRender] = React.useState(false);
    useEffect(() => {
        const res = GetDms().then((data) => {
            setDms(data);
        });
        const res2 = props.userDm
            ? GetMessages(props.userDm?.username).then((data) => {
                  setMessages(data);
              })
            : null;
    }, [props.render, props.userDm]);
    console.log('DMS', messages);
    console.log('USERRRRR', user);
    const handleBlockedUser = () => {
        console.log('Blocked user', props.userDm?.username);
        socket.emit('blockUser', {
            target: props.userDm?.username
        });
        setBlocked(true);
        props.setRender(!props.render);
        onClose();
    };
    socket.on('userBlocked', (data: any) => {
        console.log('BLOCK USER DATA', data);
        props.setRender(!props.render);
    });
    socket.on('userBlockError', (data: any) => {
        console.log('BLOCK USER ERROR DATA', data);
        props.setRender(!props.render);
    });
    const handleUnblockUser = () => {
        socket.emit('unblockUser', {
            target: props.userDm?.username
        });
        setBlocked(false);
        props.setRender(!props.render);
        onClose();
    };
    socket.on('userUnblocked', (data: any) => {
        console.log('unBLOCK USER DATA', data);
        props.setRender(!props.render);
    });
    socket.on('userUnblockError', (data: any) => {
        console.log('unBLOCK USER ERROR DATA', data);
        props.setRender(!props.render);
    });

    const handleClearDeleteChat = async (clearOrDelete: string) => {
        const str =
            clearOrDelete === 'clear'
                ? 'clear-conversation'
                : 'delete-conversation';
        console.log('Clear chat', props.userDm?.id);
        try {
            const res = await client.delete(
                `chat/${str}/${props.userDm?.username}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            console.log('RES', res);
            if (res.status === 200) {
                props.setRender(!props.render);
            }
        } catch (error: any) {
            console.log('Error', error);
            toast({
                title: 'Error.',
                description: error.response.data.message,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
        }
        onClose2();
        onClose3();
    };
    const handleProfile = () => {
        console.log('View Profile');
        <Link to="/user-profile" />;
    };
    if (!dms || dms.length === 0) return <></>;
    return (
        <Flex flexDirection={'column'} justifyContent={'space-between'}>
            <Flex h={'10%'}>
                <Box width={'98%'}>
                    {props.userDm ? (
                        <UserDmInfo
                            id={props.userDm.id}
                            render={props.render}
                            updateUser={props.updateUser}
                            setUpdateUser={props.setUpdateUser}
                        />
                    ) : (
                        <></>
                    )}
                </Box>
                <Menu>
                    <MenuButton
                        as={IconButton}
                        aria-label="Options"
                        icon={
                            <BsThreeDots
                                color="#a435f0"
                                size={60}
                                transform="rotate(90)"
                            />
                        }
                        variant="outline"
                        bg={'#F5F5F5'}
                        h={100}
                    />
                    <MenuList
                        marginRight={0}
                        bg={'#c56af0'}
                        color={'white'}
                        w={250}
                        p={6}
                        fontFamily={'krona one'}
                        borderRadius={20}
                        marginTop={-25}
                    >
                        <MenuItem
                            paddingBottom={2}
                            bg={'none'}
                            icon={<BsController />}
                        >
                            Play with me
                        </MenuItem>
                        <Link to={`/user-profile/${props.userDm?.id}`}>
                            <MenuItem
                                paddingBottom={2}
                                bg={'none'}
                                icon={<BsPersonCircle />}
                                onClick={handleProfile}
                            >
                                View Profile
                            </MenuItem>
                        </Link>
                        <MenuItem
                            paddingBottom={2}
                            bg={'none'}
                            icon={<BsX />}
                            onClick={onOpen2}
                        >
                            Clear Chat
                            <ModalConfirm
                                isOpen={isOpen2}
                                onOpen={onOpen2}
                                onClose={onClose2}
                                title={'Clear Chat'}
                                handleBlockedUser={async () =>
                                    await handleClearDeleteChat('clear')
                                }
                                body={
                                    'Are you sure you want to clear this chat?'
                                }
                            />
                        </MenuItem>
                        <MenuItem
                            paddingBottom={2}
                            bg={'none'}
                            icon={<BsTrash />}
                            onClick={onOpen3}
                        >
                            Delete Chat
                            <ModalConfirm
                                isOpen={isOpen3}
                                onOpen={onOpen3}
                                onClose={onClose3}
                                title={'Delete Chat'}
                                handleBlockedUser={async () =>
                                    await handleClearDeleteChat('delete')
                                }
                                body={
                                    'Are you sure you want to delete this chat?'
                                }
                            />
                        </MenuItem>
                        <MenuItem
                            bg={'none'}
                            icon={<BsPersonFillSlash />}
                            onClick={onOpen}
                        >
                            {blocked ? 'Unblock' : 'Block'}
                            <ModalConfirm
                                isOpen={isOpen}
                                onOpen={onOpen}
                                onClose={onClose}
                                title={'Block User'}
                                target={props.userDm?.id}
                                blocked={blocked}
                                setBlocked={setBlocked}
                                socket={socket}
                                handleBlockedUser={
                                    blocked
                                        ? handleUnblockUser
                                        : handleBlockedUser
                                }
                                body={
                                    blocked
                                        ? 'Are you sure you want to unblock this user?'
                                        : 'Are you sure you want to block this user?'
                                }
                            />
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Flex>
            <div className="messagesContainer" style={{ overflowY: 'auto' }}>
                {messages?.map((message) => {
                    return (
                        <MessageContent
                            key={message?.id}
                            message={message?.content}
                            name={
                                message?.senderId === user?.id
                                    ? 'sender'
                                    : 'receiver'
                            }
                            room={false}
                        />
                    );
                })}
            </div>
            <TypingBar
                userDm={props.userDm}
                setRender={props.setRender}
                render={props.render}
            />
        </Flex>
    );
};

export default DmsChat;
