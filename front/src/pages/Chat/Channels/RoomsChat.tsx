import {
    BsBoxArrowLeft,
    BsPersonCircle,
    BsPersonFillSlash,
    BsThreeDots,
    BsTrash
} from 'react-icons/bs';
import MessageContent from '../MessageContent';
import TypingBar from '../TypingBar';
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
    Image,
    Button
} from '@chakra-ui/react';
import MessageUser from '../MessageUser';
import { Channel } from '../../../Types/Channel';
import ChannelDmInfo from './ChannelDmInfo';
import ChannelTypingBar from './ChannelTypingBar';
import React, { useEffect } from 'react';
import { UserType } from '../../../Types/User';
import User from '../../../components/User';
import { MessageType } from '../../../Types/Message';
import GetChannelMessages from './GetChannelMessages';
import ChannelInfo from './ChannelInfo';

export interface RoomsChatProps {
    handleRenderActions: () => void;
    channelDm?: Channel;
    render: boolean;
    setRender: React.Dispatch<React.SetStateAction<boolean>>;
}

const RoomsChat = (props: RoomsChatProps) => {
    const [user, setUser] = React.useState<UserType>();
    const [messages, setMessages] = React.useState<MessageType[]>([]);
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
    if (!props.channelDm) return <></>;
    return (
        <Flex flexDirection={'row'}>
            <Flex flexDirection={'column'} width={'100%'}>
                <Flex>
                    <Box width={'98%'}>
                        <button
                            onClick={props.handleRenderActions}
                            style={{ background: 'transparent', width: '100%' }}
                        >
                            {props.channelDm ? (
                                <ChannelDmInfo
                                    profile={props.channelDm.avatar}
                                    type={props.channelDm.type}
                                    name={props.channelDm.name}
                                    showChannelInfo={showChannelInfo}
                                    setShowChannelInfo={setShowChannelInfo}
                                />
                            ) : (
                                <></>
                            )}
                        </button>
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
                                icon={<BsTrash />}
                            >
                                Delete Chat
                            </MenuItem>
                            <MenuItem bg={'none'} icon={<BsBoxArrowLeft />}>
                                Leave Chat
                            </MenuItem>
                        </MenuList>
                    </Menu>
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
                </div>
                <Box flex={1}>
                    <ChannelTypingBar
                        ChannelDm={props.channelDm}
                        render={props.render}
                        setRender={props.setRender}
                        user={user}
                    />
                </Box>
            </Flex>
            {showChannelInfo ? (
                <div className="container">
                    <ChannelInfo ChannelDm={props.channelDm} user={user} />
                </div>
            ) : null}
        </Flex>
    );
};

export default RoomsChat;
