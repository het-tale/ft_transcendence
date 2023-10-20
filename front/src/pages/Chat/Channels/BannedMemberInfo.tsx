import {
    Box,
    Flex,
    IconButton,
    Text,
    Image,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useDisclosure
} from '@chakra-ui/react';
import {
    BsThreeDotsVertical,
    BsPersonDashFill,
    BsPersonCircle
} from 'react-icons/bs';
import '../../../css/chat/channelSetting.css';
import ModalConfirm from '../ModalConfirm';
import { SocketContext } from '../../../socket';
import React from 'react';
import { UserType } from '../../../Types/User';
import { Channel } from '../../../Types/Channel';

interface BannedMemberInfoProps {
    setRender?: React.Dispatch<React.SetStateAction<boolean>>;
    render?: boolean;
    bannedMember?: UserType;
    room?: Channel;
}

const BannedMemberInfo = (props: BannedMemberInfoProps) => {
    const socket = React.useContext(SocketContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleUnbanUser = () => {
        // console.log('unban user logic');
        socket.emit('unbanUser', {
            room: props.room?.name,
            target: props.bannedMember?.username
        });
        props.setRender && props.setRender(!props.render);
        onClose();
    };
    return (
        <Flex bg={'#F5F5F5'} p={'10px'} marginBottom={8} marginTop={-6}>
            <Box w={'90%'}>
                <Flex>
                    <Image
                        src={props.bannedMember?.avatar}
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
                        {props.bannedMember?.username}
                    </Text>
                </Flex>
            </Box>
            <Box w={'10%'}>
                <Menu>
                    <MenuButton
                        as={IconButton}
                        aria-label="Options"
                        icon={<BsThreeDotsVertical color="#a435f0" size={40} />}
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
                        <MenuItem
                            bg={'none'}
                            icon={<BsPersonDashFill />}
                            onClick={onOpen}
                        >
                            <ModalConfirm
                                isOpen={isOpen}
                                onOpen={onOpen}
                                onClose={onClose}
                                title="Unban Member"
                                body="Are you sure you want to unban this member?"
                                handleBlockedUser={handleUnbanUser}
                            />
                            unbann
                        </MenuItem>

                        <MenuItem bg={'none'} icon={<BsPersonCircle />}>
                            View Profile
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Box>
        </Flex>
    );
};
export default BannedMemberInfo;
