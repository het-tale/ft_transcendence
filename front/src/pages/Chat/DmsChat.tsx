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
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import React, { useContext, useEffect, useRef } from 'react';
import { SocketContext, SocketGameContext } from '../../socket';
import GetDms from './GetDms';
import { UserType } from '../../Types/User';
import { MessageType } from '../../Types/Message';
import GetMessages from './GetMessages';
import User from '../../components/User';
import ModalConfirm from './ModalConfirm';
import client from '../../components/Client';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserDmInfo from './UserDmInfo';
import { RenderContext } from '../../RenderContext';
import UserId from '../Chat/GetUserById';

const DmsChat = (props: any) => {
    const toast = useToast();
    const renderData = useContext(RenderContext);
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
    const location = useLocation();
    const [receiver, setReceiver] = React.useState<UserType>();
    let userId = location.pathname.split('/')[3];
    React.useEffect(() => {
        async function fetchUserData() {
            if (props.userDm?.id !== undefined || Number(userId) === 0) return;
            const userData = await UserId(Number(userId));
            props.setUserDm(userData);
            setReceiver(userData);
        }
        fetchUserData();
    }, [props.render, renderData.renderData]);
    useEffect(() => {
        async function fetchUserData() {
            const userData = await User();
            setUser(userData);
        }

        fetchUserData();
    }, [props.render, renderData.renderData]);
    const [dms, setDms] = React.useState<UserType[]>([]);
    const socket = React.useContext(SocketContext);
    const socketGame = React.useContext(SocketGameContext);
    const [messages, setMessages] = React.useState<MessageType[] | undefined>(
        []
    );
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const res = GetDms().then((data) => {
            setDms(data);
        });
        const res2 = props.userDm
            ? GetMessages(props.userDm?.id).then((data) => {
                  setMessages(data);
              })
            : null;
    }, [props.render, props.userDm, renderData.renderData]);
    useEffect(() => {
        chatContainerRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, [messages]);
    const handleBlockedUser = async () => {
        const userData = await UserId(Number(userId));
        socket.emit('blockUser', {
            target: userData?.username
        });
        setBlocked(true);
        props.setRender(!props.render);
        onClose();
    };
    socket.on('userBlocked', (data: any) => {
        props.setRender(!props.render);
    });
    socket.on('userBlockError', (data: any) => {
        props.setRender(!props.render);
    });
    const handleUnblockUser = async () => {
        const userData = await UserId(Number(userId));
        socket.emit('unblockUser', {
            target: userData?.username
        });
        setBlocked(false);
        props.setRender(!props.render);
        onClose();
    };
    socket.on('userUnblocked', (data: any) => {
        props.setRender(!props.render);
    });
    socket.on('userUnblockError', (data: any) => {
        props.setRender(!props.render);
    });

    const navigate = useNavigate();
    const handleClearDeleteChat = async (clearOrDelete: string) => {
        const str =
            clearOrDelete === 'clear'
                ? 'clear-conversation'
                : 'delete-conversation';
        try {
            const userData = await UserId(Number(userId));
            const res = await client.delete(
                `chat/${str}/${userData?.username}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.status === 200) {
                props.setRender(!props.render);
                if (clearOrDelete === 'delete') {
                    props.setUserDm({});
                    navigate('/chat/rooms-dms');
                }
            }
        } catch (error: any) {
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
        <Link to="/user-profile" />;
    };
    const handleSendGameInvitation = () => {
        socketGame.emit('InvitePlayer', props.userDm?.id);
        props.setRender(!props.render);
        navigate(`/game/`);
    };
    if (!props.userDm && Number(userId) !== 0) return <></>;
    if (
        Number(userId) === 0 &&
        (!dms ||
            dms.length === 0 ||
            !props.userDm ||
            props.userDm.id === undefined)
    )
        return <></>;
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
                        {props.userDm?.id !== user?.id ? (
                            <MenuItem
                                paddingBottom={2}
                                bg={'none'}
                                icon={<BsController />}
                                onClick={handleSendGameInvitation}
                            >
                                Play with me
                            </MenuItem>
                        ) : (
                            <></>
                        )}

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
                        {props.userDm?.id !== user?.id ? (
                            <MenuItem
                                bg={'none'}
                                icon={<BsPersonFillSlash />}
                                onClick={onOpen}
                            >
                                {user?.blocked.some(
                                    (user) => user.id === props.userDm?.id
                                )
                                    ? 'Unblock'
                                    : 'Block'}
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
                                        user?.blocked.some(
                                            (user) =>
                                                user.id === props.userDm?.id
                                        )
                                            ? handleUnblockUser
                                            : handleBlockedUser
                                    }
                                    body={
                                        user?.blocked.some(
                                            (user) =>
                                                user.id === props.userDm?.id
                                        )
                                            ? 'Are you sure you want to unblock this user?'
                                            : 'Are you sure you want to block this user?'
                                    }
                                />
                            </MenuItem>
                        ) : (
                            <></>
                        )}
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
                <div ref={chatContainerRef}></div>
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
