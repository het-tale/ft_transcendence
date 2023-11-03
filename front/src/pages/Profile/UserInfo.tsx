import {
    Button,
    Flex,
    IconButton,
    Text,
    Image,
    Center,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import { BsPencilFill } from 'react-icons/bs';
import ModalUi from '../../components/ModalUi';
import { UserType } from '../../Types/User';
import { SocketContext } from '../../socket';
import React, { useContext, useState } from 'react';
import { EditIcon } from '@chakra-ui/icons';
import EditUserNameBody from './EditUserNameBody';
import EditPasswordBody from './EditPasswordBody';
import EditAvatarBody from './EditAvatarBody';
import Manage2fa from './Manage2fa';
import { RenderContext } from '../../RenderContext';
import client from '../../components/Client';

interface UserInfoProps {
    user?: UserType;
    currentUser?: UserType;
    isMyProfile: boolean;
    update?: boolean;
    setUpdate?: React.Dispatch<React.SetStateAction<boolean>>;
    friends: UserType[];
    mutualFriends: UserType[];
}

const UserInfo = (props: UserInfoProps) => {
    let status = 'Online';
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
    const user = props.isMyProfile ? props.currentUser : props.user;
    const socket = React.useContext(SocketContext);
    const handleAddFriend = () => {
        socket.emit('sendFriendRequest', {
            target: props.user?.username
        });
        props.setUpdate!(!props.update);
        renderData.setRenderData(!renderData.renderData);
    };
    const [isHovered, setIsHovered] = useState(false);
    const renderData = useContext(RenderContext);
    const toast = useToast();
    const disable2fa = async () => {
        try {
            const response = await client.get(`auth/2fa/disable`, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('token')
                }
            });
            renderData.setRenderData(!renderData.renderData);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response.data.message,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
            renderData.setRenderData(!renderData.renderData);
        }
    };
    return (
        <Flex
            className="container"
            style={{ width: '600px' }}
            flexDirection={'column'}
            gap={'3%'}
        >
            <Button
                onClick={props.isMyProfile ? onOpen4 : () => {}}
                marginTop={'10rem'}
                marginBottom={'10rem'}
                background={'transparent'}
            >
                <Image
                    objectFit="cover"
                    src={user?.avatar}
                    alt="profile"
                    borderRadius={'10%'}
                    w={'50rem'}
                    h={'25rem'}
                    alignItems={'center'}
                />
            </Button>
            {props.isMyProfile ? (
                <>
                    <ModalUi
                        isOpen={isOpen4}
                        onOpen={onOpen4}
                        onClose={onClose4}
                        title={'Change Avatar'}
                        body={
                            <EditAvatarBody
                                user={user}
                                onClose={onClose4}
                                isHovered={isHovered}
                                setIsHovered={setIsHovered}
                            />
                        }
                    />
                </>
            ) : null}

            <Flex gap={'2px'} marginTop={12}>
                <Text
                    textAlign={'center'}
                    fontSize={30}
                    fontFamily={'sans-serif'}
                    fontWeight={'bold'}
                    marginTop={2}
                >
                    {user?.username}
                </Text>
                {props.isMyProfile ? (
                    <>
                        <IconButton
                            variant="ghost"
                            colorScheme="purple"
                            backgroundColor={'transparent'}
                            aria-label=""
                            icon={<EditIcon />}
                            color={'#a435f0'}
                            onClick={onOpen}
                            size={'md'}
                            marginTop={3}
                        />
                        <ModalUi
                            isOpen={isOpen}
                            onOpen={onOpen}
                            onClose={onClose}
                            title={'Change UserName'}
                            body={
                                <EditUserNameBody
                                    user={user}
                                    onClose={onClose}
                                />
                            }
                        />
                    </>
                ) : null}
            </Flex>
            {props.isMyProfile ? (
                <>
                    <Flex gap={'2px'} marginTop={2}>
                        <Text
                            textAlign={'center'}
                            fontSize={14}
                            fontFamily={'sans-serif'}
                            marginTop={2}
                            fontWeight={'bold'}
                        >
                            <span style={{ textDecoration: 'underline' }}>
                                Password:
                            </span>{' '}
                            ***********
                        </Text>
                        <IconButton
                            variant="ghost"
                            colorScheme="purple"
                            backgroundColor={'transparent'}
                            aria-label=""
                            icon={<EditIcon />}
                            color={'#a435f0'}
                            onClick={onOpen2}
                        />
                        <ModalUi
                            isOpen={isOpen2}
                            onOpen={onOpen2}
                            onClose={onClose2}
                            title={'Change Password'}
                            body={
                                <EditPasswordBody
                                    onClose={onClose2}
                                    user={user}
                                />
                            }
                        />
                    </Flex>
                    <Flex gap={'2px'} marginTop={2}>
                        <Text
                            textAlign={'center'}
                            fontSize={14}
                            fontFamily={'sans-serif'}
                            fontWeight={'bold'}
                            marginTop={2}
                        >
                            <span style={{ textDecoration: 'underline' }}>
                                2 Factor Authentication:
                            </span>
                            {user?.is2FaEnabled ? ' Disable' : ' Enable'}
                        </Text>
                        <IconButton
                            variant="ghost"
                            colorScheme="purple"
                            backgroundColor={'transparent'}
                            aria-label=""
                            icon={<EditIcon />}
                            color={'#a435f0'}
                            onClick={user?.is2FaEnabled ? disable2fa : onOpen3}
                        />
                        <ModalUi
                            isOpen={isOpen3}
                            onOpen={onOpen3}
                            onClose={onClose3}
                            title={'Change Two Factor Authentication'}
                            body={<Manage2fa onClose={onClose3} user={user} />}
                        />
                    </Flex>
                </>
            ) : null}

            <Flex gap={'2px'} marginTop={2}>
                <Text
                    textAlign={'center'}
                    fontSize={14}
                    fontFamily={'sans-serif'}
                    fontWeight={'bold'}
                    marginTop={2}
                >
                    <span style={{ textDecoration: 'underline' }}>Email: </span>
                    {user?.email}
                </Text>
            </Flex>
            {props.isMyProfile ? null : (
                <>
                    <Button
                        w={'100%'}
                        bg={'#a435f0'}
                        color={'white'}
                        marginBottom={'-42rem'}
                        onClick={
                            props.friends.some(
                                (friend) => friend.id === props.user?.id
                            )
                                ? () => {}
                                : handleAddFriend
                        }
                    >
                        {props.friends.some(
                            (friend) => friend.id === props.user?.id
                        )
                            ? 'Friends'
                            : props.currentUser?.sentFriendRequests?.some(
                                  (request) =>
                                      request.receiverId === props.user?.id &&
                                      request.status === 'pending'
                              )
                            ? 'Friend Request Sent'
                            : 'Add Friend'}
                    </Button>
                </>
            )}
        </Flex>
    );
};

export default UserInfo;
