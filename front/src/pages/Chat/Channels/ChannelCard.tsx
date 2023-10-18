import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Divider,
    Flex,
    Heading,
    Text,
    Stack,
    Image,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import { Channel } from '../../../Types/Channel';
import ModalUi from '../../../components/ModalUi';
import { SubmitHandler, useForm } from 'react-hook-form';
import React, { useEffect } from 'react';
import { SocketContext } from '../../../socket';
import { UserType } from '../../../Types/User';
import User from '../../../components/User';

export interface BrowseChannelsCardProps {
    ChannelInfo?: Channel;
    updateChannel?: boolean;
    setUpdateChannel?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChannelCard = (props: BrowseChannelsCardProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [message, setMessage] = React.useState<string>('');
    const [user, setUser] = React.useState<UserType>();
    const socket = React.useContext(SocketContext);
    const toast = useToast();
    React.useEffect(() => {
        async function fetchUserData() {
            const currentUserData = await User();
            setUser(currentUserData);
        }

        fetchUserData();
    }, []);
    const JoinLogic = () => {
        // console.log('Hello From Join Logic');
        // console.log('FORMDATA for JOIN', message);
        socket.emit('joinRoom', {
            room: props.ChannelInfo?.name,
            username: user?.username,
            password: message
        });
        props.setUpdateChannel && props.setUpdateChannel(!props.updateChannel);
    };
    const handleJoinRoom = (e: any) => {
        e.preventDefault();
        JoinLogic();
        props.setUpdateChannel && props.setUpdateChannel(!props.updateChannel);
        onClose();
    };

    socket.on('roomCreated', (data: any) => {
        // console.log('Create Room Data', data);
        if (props.setUpdateChannel)
            props.setUpdateChannel(!props.updateChannel);
    });
    socket.on('roomCreateError', (data: any) => {
        // console.log('Create Room Error', data);
        if (props.setUpdateChannel)
            props.setUpdateChannel(!props.updateChannel);
    });
    socket.on('roomJoined', (data: any) => {
        // console.log('Join Room Data', data);
        if (props.setUpdateChannel)
            props.setUpdateChannel(!props.updateChannel);
    });
    useEffect(() => {
        const timer = setTimeout(() => {
            socket.on('roomJoinError', (data: any) => {
                // console.log('Join Room Error', data);
                // if (props.setUpdateChannel)
                //     props.setUpdateChannel(!props.updateChannel);
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
        <Card maxW="sm">
            <CardBody>
                <Image
                    src={props.ChannelInfo?.avatar}
                    alt="het-tale"
                    borderRadius="lg"
                />
                <Stack mt="6">
                    <Heading size="md" color={'#a435f0'}>
                        {props.ChannelInfo?.name}
                    </Heading>
                    <Flex
                        justifyContent={'space-between'}
                        marginBottom={'-2rem'}
                    >
                        <Text fontWeight="bold" color={'#ccc'}>
                            {props.ChannelInfo?.type}
                        </Text>

                        <Text fontWeight="bold" color={'#ccc'}>
                            {props.ChannelInfo?.participants?.length}members
                        </Text>
                    </Flex>
                </Stack>
            </CardBody>
            <Divider />
            <CardFooter>
                <Button
                    variant="solid"
                    color={'white'}
                    width={'100%'}
                    backgroundColor={'#a435f0'}
                    onClick={() =>
                        props.ChannelInfo?.type === 'protected'
                            ? onOpen()
                            : JoinLogic()
                    }
                >
                    join
                </Button>
                <ModalUi
                    isOpen={isOpen}
                    onOpen={onOpen}
                    onClose={onClose}
                    title={'Join Channel'}
                    body={
                        <form
                            style={{ padding: '2%' }}
                            onSubmit={(e) => handleJoinRoom(e)}
                        >
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    className="form-control"
                                    type="password"
                                    placeholder="Please Provide a password"
                                    id="password"
                                    value={message}
                                    onChange={(e) => {
                                        setMessage(e.target.value);
                                    }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <button
                                    type="submit"
                                    style={{
                                        width: '100%',
                                        marginLeft: '-0.1rem'
                                    }}
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    }
                />
            </CardFooter>
        </Card>
    );
};

export default ChannelCard;
