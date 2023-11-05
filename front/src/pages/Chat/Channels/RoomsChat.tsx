import { BsBoxArrowLeft, BsThreeDots, BsTrash } from 'react-icons/bs';
import MessageContent from '../MessageContent';
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
import { Channel } from '../../../Types/Channel';
import ChannelDmInfo from './ChannelDmInfo';
import ChannelTypingBar from './ChannelTypingBar';
import React, { useEffect, useRef } from 'react';
import { UserType } from '../../../Types/User';
import User from '../../../components/User';
import { MessageType } from '../../../Types/Message';
import GetChannelMessages from './GetChannelMessages';
import ChannelInfo from './ChannelInfo';
import Room from './Channel';
import ModalUi from '../../../components/ModalUi';
import InviteUsersModal from './InviteUsersModal';
import { SocketContext } from '../../../socket';
import DeletChannelModal from './DeletChannelModal';

export interface RoomsChatProps {
    handleRenderActions: () => void;
    channelDm?: Channel;
    render: boolean;
    setRender: React.Dispatch<React.SetStateAction<boolean>>;
    update: boolean;
    setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
}

const RoomsChat = (props: RoomsChatProps) => {
    const socket = React.useContext(SocketContext);
    const toast = useToast();
    const [user, setUser] = React.useState<UserType>();
    const [room, setRoom] = React.useState<Channel>();
    const [messages, setMessages] = React.useState<MessageType[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const {
        isOpen: isOpen2,
        onOpen: onOpen2,
        onClose: onClose2
    } = useDisclosure();
    const [showChannelInfo, setShowChannelInfo] =
        React.useState<boolean>(false);
    useEffect(() => {
        async function fetchUserData() {
            const userData = await User();
            setUser(userData);
        }

        fetchUserData();
    }, []);
    useEffect(() => {
        const res = props.channelDm
            ? GetChannelMessages(props.channelDm.name).then((data) => {
                  setMessages(data);
              })
            : null;
    }, [props.render, props.channelDm]);
    useEffect(() => {
        chatContainerRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, [messages]);
    useEffect(() => {
        async function fetchRoomData() {
            if (props.channelDm?.name === undefined) return;
            const roomData = await Room(props.channelDm?.name);
            setRoom(roomData);
        }
        fetchRoomData();
    }, [props.render, props.update, props.channelDm]);
    const handleDeleteChannel = () => {
        socket.emit('deleteChannel', {
            room: props.channelDm?.name
        });
        props.setRender && props.setRender(!props.render);
    };
    // useEffect(() => {
    //     socket.on('channelDeleted', () => {
    //         toast({
    //             title: 'Success',
    //             description: 'Channel Deleted',
    //             status: 'success',
    //             duration: 9000,
    //             isClosable: true,
    //             position: 'bottom-right'
    //         });
    //         props.setRender && props.setRender(!props.render);
    //     });
    //     socket.on('channelDeleteError', (data: string) => {
    //         toast({
    //             title: 'Error',
    //             description: data,
    //             status: 'error',
    //             duration: 9000,
    //             isClosable: true,
    //             position: 'bottom-right'
    //         });
    //         props.setRender && props.setRender(!props.render);
    //     });
    //     return () => {
    //         socket.off('channelDeleted');
    //         socket.off('channelDeleteError');
    //     };
    // }, []);

    if (!props.channelDm) return <></>;
    return (
        <Flex flexDirection={'row'}>
            {room?.participants.some(
                (participant) => participant.id === user?.id
            ) ? (
                <>
                    <Flex flexDirection={'column'} width={'100%'}>
                        <Flex>
                            <Box
                                width={
                                    room.admins.some(
                                        (admin) => admin.id === user?.id
                                    )
                                        ? '98%'
                                        : '100%'
                                }
                            >
                                {/* <button
                                    onClick={props.handleRenderActions}
                                    style={{
                                        background: 'transparent',
                                        width: '100%'
                                    }}
                                > */}
                                <ChannelDmInfo
                                    profile={room.avatar}
                                    type={room.type}
                                    name={room.name}
                                    showChannelInfo={showChannelInfo}
                                    setShowChannelInfo={setShowChannelInfo}
                                    setRender={props.setRender}
                                    render={props.render}
                                />
                                {/* </button> */}
                            </Box>
                            {room.admins.some(
                                (admin) => admin.id === user?.id
                            ) ? (
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
                                            icon={<BsTrash />}
                                            onClick={onOpen}
                                        >
                                            <ModalUi
                                                isOpen={isOpen}
                                                onOpen={onOpen}
                                                onClose={onClose}
                                                title={'Invite new Users'}
                                                body={
                                                    <InviteUsersModal
                                                        onClose={onClose}
                                                        channelDm={room}
                                                        user={user}
                                                        render={props.render}
                                                        setRender={
                                                            props.setRender
                                                        }
                                                    />
                                                }
                                            />
                                            Invite Users
                                        </MenuItem>

                                        {room?.ownerId === user?.id ? (
                                            <MenuItem
                                                bg={'none'}
                                                icon={<BsBoxArrowLeft />}
                                                onClick={
                                                    room.type === 'protected'
                                                        ? () => {
                                                              onOpen2();
                                                              props.setRender &&
                                                                  props.setRender(
                                                                      !props.render
                                                                  );
                                                          }
                                                        : handleDeleteChannel
                                                }
                                            >
                                                Delete Channel
                                                <ModalUi
                                                    isOpen={isOpen2}
                                                    onOpen={onOpen2}
                                                    onClose={onClose2}
                                                    title={
                                                        'Please Provide a password'
                                                    }
                                                    body={
                                                        <DeletChannelModal
                                                            onClose={onClose2}
                                                            channelDm={room}
                                                            render={
                                                                props.render
                                                            }
                                                            setRender={
                                                                props.setRender
                                                            }
                                                            user={user}
                                                        />
                                                    }
                                                />
                                            </MenuItem>
                                        ) : null}
                                    </MenuList>
                                </Menu>
                            ) : null}
                        </Flex>
                        <div
                            className="messagesContainer"
                            style={{ overflowY: 'auto' }}
                        >
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
                                        room={true}
                                        userSendId={message?.senderId}
                                    />
                                );
                            })}
                            <div ref={chatContainerRef}></div>
                        </div>
                        <Box flex={1}>
                            <ChannelTypingBar
                                ChannelDm={room}
                                render={props.render}
                                setRender={props.setRender}
                                user={user}
                            />
                        </Box>
                    </Flex>
                </>
            ) : (
                <></>
            )}
            {room?.participants.some(
                (participant) => participant.id === user?.id
            ) && showChannelInfo ? (
                <div className="container" style={{ width: '40%' }}>
                    <ChannelInfo
                        ChannelDm={room}
                        user={user}
                        render={props.render}
                        setRender={props.setRender}
                        room={room}
                        setRoom={setRoom}
                    />
                </div>
            ) : null}
        </Flex>
    );
};

export default RoomsChat;
