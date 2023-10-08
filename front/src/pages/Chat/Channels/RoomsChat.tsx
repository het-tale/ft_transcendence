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

export interface RoomsChatProps {
    handleRenderActions: () => void;
    channelDm?: Channel;
}

const RoomsChat = (props: RoomsChatProps) => {
    if (!props.channelDm) return <></>;
    return (
        <Flex flexDirection={'column'}>
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
            <div className="messagesContainer" style={{ overflowY: 'auto' }}>
                {/* <MessageContent message='Hello' name='sender' room={true} />
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='sender' room={true}/>
            <MessageContent message='Hello' name='sender' room={true} />
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='sender' room={true}/>
            <MessageContent message='Hello' name='sender' room={true} />
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='sender' room={true}/>
            <MessageContent message='Hello' name='sender' room={true} />
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='sender' room={true}/>

            <MessageContent message='Hello' name='sender' room={true} />
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='sender' room={true}/>
            <MessageContent message='Hello' name='sender' room={true} />
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='sender' room={true}/>
            <MessageContent message='Hello' name='sender' room={true} />
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='sender' room={true}/>
            <MessageContent message='Hello' name='sender' room={true} />
            <MessageContent message='Hello again' name='receiver' room={true}/> */}
                {/* <MessageContent message='Hello again' name='receiver' room={true}/>
            <MessageContent message='Hello again' name='sender' room={true}/> */}
            </div>
            <Box flex={1}>
                <TypingBar />
            </Box>
        </Flex>
    );
};

export default RoomsChat;
