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
    useDisclosure
} from '@chakra-ui/react';
import { BsPencilFill, BsBoxArrowRight } from 'react-icons/bs';
import '../../../css/chat/channelSetting.css';
import { Channel } from '../../../Types/Channel';
import MemberInfo from './MemberInfo';
import { UserType } from '../../../Types/User';
import React from 'react';
import { SocketContext } from '../../../socket';
import ModalUi from '../../../components/ModalUi';
import BodySetOwnerModal from './BodySetOwnerModal';
import ChangeChannelNameModal from './ChangeChannelNameModal';
import ChangeChannelAvatarModal from './ChangeChannelAvatarModal';
import ChangeChannelTypeModal from './ChangeChannelTypeModal';
import BannedMemberInfo from './BannedMemberInfo';

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
    const socket = React.useContext(SocketContext);
    const [room, setRoom] = React.useState<Channel>();
    const handleLeaveChannel = () => {
        console.log('Hello From Leave Channel');
        socket.emit('leaveRoom', {
            room: props.ChannelDm?.name
        });
        props.setRender && props.setRender(!props.render);
    };
    const handleChangeAvatar = () => {
        console.log('Hello From Change Avatar');
    };

    return (
        <div>
            <Card maxW="md" marginBottom={2}>
                <CardHeader>
                    <Heading textAlign={'center'}>Channel Info</Heading>
                </CardHeader>
                <CardBody>
                    <Center>
                        <Button
                            onClick={onOpen3}
                            backgroundColor={'transparent'}
                            h={'150px'}
                        >
                            <Image
                                objectFit="cover"
                                src={props.ChannelDm?.avatar}
                                alt="profile"
                                borderRadius={'50%'}
                                w={200}
                                alignItems={'center'}
                            />
                            <ModalUi
                                isOpen={isOpen3}
                                onOpen={onOpen3}
                                onClose={onClose3}
                                title={'Change Channel Avatar'}
                                body={
                                    <ChangeChannelAvatarModal
                                        onClose={onClose3}
                                        setRender={props.setRender}
                                        render={props.render}
                                        channelDm={props.room}
                                        user={props.user}
                                    />
                                }
                            />
                        </Button>
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
                        <Button onClick={onOpen2}>
                            <IconButton
                                variant="ghost"
                                colorScheme="gray"
                                aria-label=""
                                icon={<BsPencilFill />}
                                color={'#a435f0'}
                            />
                            <ModalUi
                                isOpen={isOpen2}
                                onOpen={onOpen2}
                                onClose={onClose2}
                                title={'Change Channel Name'}
                                body={
                                    <ChangeChannelNameModal
                                        onClose={onClose2}
                                        setRender={props.setRender}
                                        render={props.render}
                                        channelDm={props.room}
                                        user={props.user}
                                    />
                                }
                            />
                        </Button>
                    </Flex>

                    <Flex justifyContent={'space-between'} marginTop={2}>
                        <Text
                            textAlign={'center'}
                            fontSize={16}
                            fontFamily={'Krona One'}
                            marginTop={2}
                            color={'#a435f0'}
                        >
                            Change Channel Type
                        </Text>
                        <Button onClick={onOpen4}>
                            <IconButton
                                variant="ghost"
                                colorScheme="gray"
                                aria-label=""
                                icon={<BsPencilFill />}
                                color={'#a435f0'}
                            />
                            <ModalUi
                                isOpen={isOpen4}
                                onOpen={onOpen4}
                                onClose={onClose4}
                                title={'Change Channel Type'}
                                body={
                                    <ChangeChannelTypeModal
                                        onClose={onClose4}
                                        setRender={props.setRender}
                                        render={props.render}
                                        channelDm={props.room}
                                        user={props.user}
                                    />
                                }
                            />
                        </Button>
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
            {props.room?.banned && props.room?.banned?.length > 0 ? (
                <Card maxW="md">
                    <CardHeader>
                        <Text>{props.room?.banned?.length} Banned Users</Text>
                    </CardHeader>
                    <CardBody>
                        {props.room?.banned?.map((ban) => (
                            <BannedMemberInfo
                                bannedMember={ban}
                                render={props.render}
                                setRender={props.setRender}
                                room={props.room}
                            />
                        ))}
                    </CardBody>
                </Card>
            ) : null}

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
                                props.user?.id === props.room?.ownerId &&
                                props.room?.participants &&
                                props.room?.participants?.length > 1
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
                                        channelDm={props.room}
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
