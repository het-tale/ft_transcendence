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
    List,
    ListItem,
    ListIcon,
    useDisclosure
} from '@chakra-ui/react';
import {
    BsThreeDotsVertical,
    BsPencilFill,
    BsVolumeMuteFill,
    BsPersonDashFill,
    BsPersonXFill,
    BsGearFill,
    BsBoxArrowRight,
    BsCircleFill
} from 'react-icons/bs';
import ModalUi from '../../components/ModalUi';
import EditProfileBody from './EditProfileBody';
import { UserType } from '../../Types/User';
import { SocketContext } from '../../socket';
import React, { useState } from 'react';
import { EditIcon } from '@chakra-ui/icons';
import { Opacity } from '@mui/icons-material';
import EditUserNameBody from './EditUserNameBody';
import EditPasswordBody from './EditPasswordBody';
import EditAvatarBody from './EditAvatarBody';

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
        console.log('ADD FRIEND');
        socket.emit('sendFriendRequest', {
            target: props.user?.username
        });
        props.setUpdate!(!props.update);
    };
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div className="container" style={{ width: '600px' }}>
            <Center
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Image
                    objectFit="cover"
                    src={user?.avatar}
                    alt="profile"
                    borderRadius={'50%'}
                    w={200}
                    alignItems={'center'}
                    _hover={{ cursor: 'pointer', opacity: '0.5' }}
                />
                {props.isMyProfile ? (
                    <>
                        {isHovered && (
                            <IconButton
                                icon={<EditIcon />}
                                aria-label="Edit Image"
                                transform="translate(-300%, -20%)"
                                zIndex="1"
                                colorScheme="purple"
                                opacity={'0.8'}
                                onClick={onOpen4}
                            />
                        )}
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
            </Center>

            <Flex justifyContent={'space-between'} marginTop={12}>
                <Text
                    textAlign={'center'}
                    fontSize={14}
                    fontFamily={'Krona One'}
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
                            icon={<BsPencilFill />}
                            color={'#a435f0'}
                            onClick={onOpen}
                            size={'sm'}
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
                    <Flex justifyContent={'space-between'} marginTop={2}>
                        <Text
                            textAlign={'center'}
                            fontSize={14}
                            fontFamily={'Krona One'}
                            marginTop={2}
                        >
                            Change Password
                        </Text>
                        <IconButton
                            variant="ghost"
                            colorScheme="purple"
                            backgroundColor={'transparent'}
                            aria-label=""
                            icon={<BsPencilFill />}
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
                    <Flex justifyContent={'space-between'} marginTop={2}>
                        <Text
                            textAlign={'center'}
                            fontSize={14}
                            fontFamily={'Krona One'}
                            marginTop={2}
                        >
                            Enable/Disable 2FA
                        </Text>
                        <IconButton
                            variant="ghost"
                            colorScheme="purple"
                            backgroundColor={'transparent'}
                            aria-label=""
                            icon={<BsPencilFill />}
                            color={'#a435f0'}
                            onClick={onOpen3}
                        />
                        <ModalUi
                            isOpen={isOpen3}
                            onOpen={onOpen3}
                            onClose={onClose3}
                            title={'Change Two Factor Authentication'}
                            body={''}
                        />
                    </Flex>
                </>
            ) : null}

            <Flex justifyContent={'space-between'} marginTop={2}>
                <Text
                    textAlign={'center'}
                    fontSize={14}
                    fontFamily={'Krona One'}
                    marginTop={2}
                >
                    {user?.email}
                </Text>
            </Flex>
            {props.isMyProfile ? null : (
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
                        : 'Add Friend'}
                </Button>
            )}
        </div>
    );
};

export default UserInfo;
