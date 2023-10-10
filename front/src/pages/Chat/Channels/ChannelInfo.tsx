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
    useDisclosure
} from '@chakra-ui/react';
import {
    BsThreeDotsVertical,
    BsPencilFill,
    BsVolumeMuteFill,
    BsPersonDashFill,
    BsPersonXFill,
    BsGearFill,
    BsBoxArrowRight
} from 'react-icons/bs';
import '../../../css/chat/channelSetting.css';
import MessageUser from '../MessageUser';
import { Channel } from '../../../Types/Channel';
import MemberInfo from './MemberInfo';
import { UserType } from '../../../Types/User';
import React from 'react';
import { SocketContext } from '../../../socket';
import ModalConfirm from '../ModalConfirm';

export interface ChannelInfoProps {
    ChannelDm?: Channel;
    user?: UserType;
    participant?: UserType;
    render?: boolean;
    setRender?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChannelInfo = (props: ChannelInfoProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const socket = React.useContext(SocketContext);
    const handleLeaveChannel = (id: number | undefined) => {
        console.log('Hello From Leave Channel');
        socket.emit('leaveRoom', {
            room: props.ChannelDm?.name,
            newOwner: id
        });
        props.setRender && props.setRender(!props.render);
    };
    return (
        <div>
            <Card maxW="md" marginBottom={2}>
                <CardHeader>
                    <Heading textAlign={'center'}>Channel Info</Heading>
                </CardHeader>
                <CardBody>
                    <Center>
                        <Image
                            objectFit="cover"
                            src={props.ChannelDm?.avatar}
                            alt="profile"
                            borderRadius={'50%'}
                            w={200}
                            alignItems={'center'}
                        />
                    </Center>
                    <Flex justifyContent={'space-between'} marginTop={2}>
                        <Text
                            textAlign={'center'}
                            fontSize={16}
                            fontFamily={'Krona One'}
                            marginTop={2}
                            color={'#a435f0'}
                        >
                            {props.ChannelDm?.name}
                        </Text>
                        <IconButton
                            variant="ghost"
                            colorScheme="gray"
                            aria-label=""
                            icon={<BsPencilFill />}
                            color={'#a435f0'}
                        />
                    </Flex>
                </CardBody>
                <CardFooter
                    justify="space-between"
                    flexWrap="wrap"
                    sx={{
                        '& > button': {
                            minW: '136px'
                        }
                    }}
                ></CardFooter>
            </Card>

            <Card maxW="md">
                <CardHeader>
                    <Text>
                        {props.ChannelDm?.participants?.length} Participants
                    </Text>
                </CardHeader>
                <CardBody>
                    {props.ChannelDm?.participants?.map((participant) => (
                        <MemberInfo
                            key={participant.id}
                            ChannelDm={props.ChannelDm}
                            user={props.user}
                            participant={participant}
                            render={props.render}
                            setRender={props.setRender}
                        />
                    ))}
                </CardBody>
            </Card>

            <Card maxW="md">
                <CardHeader>
                    <Flex gap="4" color={'red'}>
                        <IconButton
                            variant="ghost"
                            colorScheme="red"
                            aria-label="See menu"
                            size="lg"
                            icon={<BsBoxArrowRight />}
                        />
                        <Button
                            style={{ background: 'none', color: 'red' }}
                            onClick={
                                props.user?.id === props.ChannelDm?.ownerId
                                    ? onOpen
                                    : () => handleLeaveChannel(undefined)
                            }
                        >
                            <ModalConfirm
                                isOpen={isOpen}
                                onClose={onClose}
                                onOpen={onOpen}
                                title={'Set new Channel Owner'}
                                body={
                                    'Please choose a new owner for this channel'
                                }
                                handleBlockedUser={() =>
                                    handleLeaveChannel(props.user?.id)
                                }
                            />
                            <Text fontSize={18} marginTop={5} marginLeft={-7}>
                                Leave Channel
                            </Text>
                        </Button>
                    </Flex>
                </CardHeader>
            </Card>
        </div>
    );
};

export default ChannelInfo;
