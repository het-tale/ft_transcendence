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
import React, { useEffect } from 'react';
import { SocketContext } from '../../../socket';
import ModalConfirm from '../ModalConfirm';
import Room from './Channel';
import { on } from 'events';
import ModalUi from '../../../components/ModalUi';
import BodySetOwnerModal from './BodySetOwnerModal';

export interface ChannelInfoProps {
    ChannelDm?: Channel;
    user?: UserType;
    participant?: UserType;
    render?: boolean;
    setRender?: React.Dispatch<React.SetStateAction<boolean>>;
    room?: Channel;
    setRoom?: React.Dispatch<React.SetStateAction<Channel | undefined>>;
}

const ChannelInfo = (props: ChannelInfoProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const socket = React.useContext(SocketContext);
    const [room, setRoom] = React.useState<Channel>();
    const handleLeaveChannel = () => {
        console.log('Hello From Leave Channel');
        socket.emit('leaveRoom', {
            room: props.ChannelDm?.name
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
                    <Text>{props.room?.participants?.length} Participants</Text>
                </CardHeader>
                <CardBody>
                    {props.room?.participants?.map((participant) => (
                        <MemberInfo
                            key={participant.id}
                            ChannelDm={props.ChannelDm}
                            user={props.user}
                            participant={participant}
                            render={props.render}
                            setRender={props.setRender}
                            room={props.room}
                            setRoom={props.setRoom}
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
                                    : handleLeaveChannel
                            }
                        >
                            <ModalUi
                                isOpen={isOpen}
                                onOpen={onOpen}
                                onClose={onClose}
                                title={'Set new Channel Owner'}
                                body={
                                    <BodySetOwnerModal
                                        channelDm={props.ChannelDm}
                                        user={props.user}
                                        render={props.render}
                                        setRender={props.setRender}
                                        onClose={onClose}
                                    />
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
