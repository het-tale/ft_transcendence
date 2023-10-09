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
    MenuItem
} from '@chakra-ui/react';
import {
    BsThreeDotsVertical,
    BsPencilFill,
    BsVolumeMuteFill,
    BsPersonDashFill,
    BsPersonXFill,
    BsGearFill,
    BsBoxArrowRight,
    BsPersonCircle
} from 'react-icons/bs';
import '../../../css/chat/channelSetting.css';
import MessageUser from '../MessageUser';
import { ChannelInfoProps } from './ChannelInfo';

const MemberInfo = (props: ChannelInfoProps) => {
    console.log('admins are', props.ChannelDm?.admins.length);
    if (props.user) {
        console.log('participant name', props.participant);
        console.log(
            'isAdmin',
            props.ChannelDm?.admins?.some(
                (admin) => admin.id === props.participant?.id
            )
        );
        console.log(
            'the index is',
            props.ChannelDm?.admins?.indexOf(props.user)
        );
    }
    return (
        <Flex bg={'#F5F5F5'} p={'10px'} marginBottom={8} marginTop={-6}>
            <Box w={'90%'}>
                <Flex>
                    <Image
                        src={props.participant?.avatar}
                        borderRadius={'30px'}
                        width={'50px'}
                        height={'50px'}
                        marginRight={'10px'}
                    />
                    <Text
                        as="h6"
                        size="sm"
                        marginLeft={'-5px'}
                        marginTop={'20px'}
                    >
                        {props.participant?.username}
                    </Text>
                </Flex>
            </Box>
            <Box w={'10%'}>
                {props.participant?.id !== props.user?.id ? (
                    <Menu>
                        <MenuButton
                            as={IconButton}
                            aria-label="Options"
                            icon={
                                <BsThreeDotsVertical
                                    color="#a435f0"
                                    size={40}
                                />
                            }
                            variant="outline"
                            border={'none'}
                            marginTop={1.5}
                        />
                        <MenuList
                            marginRight={0}
                            bg={'#c56af0'}
                            color={'white'}
                            w={300}
                            p={6}
                            fontFamily={'krona one'}
                            borderRadius={20}
                            marginTop={-25}
                        >
                            {props.user?.id === props.ChannelDm?.ownerId ? (
                                <MenuItem
                                    paddingBottom={2}
                                    bg={'none'}
                                    icon={<BsGearFill />}
                                >
                                    Set Admin
                                </MenuItem>
                            ) : null}
                            {props.user &&
                            props.ChannelDm?.admins?.some(
                                (admin) => admin.id === props.user?.id
                            ) ? (
                                <Box>
                                    <MenuItem
                                        bg={'none'}
                                        icon={<BsVolumeMuteFill />}
                                    >
                                        Mute
                                    </MenuItem>
                                    <MenuItem
                                        bg={'none'}
                                        icon={<BsPersonXFill />}
                                    >
                                        Kick
                                    </MenuItem>
                                    <MenuItem
                                        bg={'none'}
                                        icon={<BsPersonDashFill />}
                                    >
                                        Ban
                                    </MenuItem>
                                </Box>
                            ) : null}

                            <MenuItem bg={'none'} icon={<BsPersonCircle />}>
                                View Profile
                            </MenuItem>
                        </MenuList>
                    </Menu>
                ) : null}
            </Box>
        </Flex>
    );
};
export default MemberInfo;
