import {
    Avatar,
    Box,
    Card,
    CardBody,
    Flex,
    Heading,
    IconButton,
    Image,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spacer,
    Stack,
    Text,
    AvatarBadge
} from '@chakra-ui/react';
import { useContext, useEffect } from 'react';
import { BsChatLeftFill, BsThreeDotsVertical, BsTrash } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { UserType } from '../../Types/User';
import React from 'react';
import { SocketContext } from '../../socket';
import { RenderContextType } from '../../RenderContext';

interface FriendsProps {
    friend: boolean;
    user?: UserType;
    update?: boolean;
    setUpdate?: React.Dispatch<React.SetStateAction<boolean>>;
    friends?: UserType[];
    setFriends?: React.Dispatch<React.SetStateAction<UserType[]>>;
    renderData?: RenderContextType;
}

const Friends = (props: FriendsProps) => {
    const socket = React.useContext(SocketContext);
    const handleRemoveFriend = (username: string) => {
        console.log('REMOVE FRIEND');
        socket.emit('removeFriend', {
            target: username
        });
        props.setUpdate!(!props.update);
        props.renderData?.setRenderData!(!props.renderData?.renderData);
    };
    return (
        <div>
            {props.friends?.map((friend) => {
                return (
                    <Card
                        direction={{ base: 'column', sm: 'row' }}
                        overflow="hidden"
                        variant="outline"
                        bg={'#EEEEFF'}
                        boxShadow={'2xl'}
                        p={2}
                        h={'100px'}
                        w={'100%'}
                        style={{ boxShadow: 'none' }}
                    >
                        <Flex>
                            <Flex>
                                <Avatar src={friend.avatar} marginTop={'18px'}>
                                    <AvatarBadge
                                        boxSize="1.25em"
                                        bg={
                                            friend.status === 'offline'
                                                ? '#F5F5F5'
                                                : 'green.500'
                                        }
                                    />
                                </Avatar>
                                <Stack>
                                    <CardBody>
                                        <Heading
                                            as="h6"
                                            size="sm"
                                            fontWeight="bold"
                                            marginLeft={'-10px'}
                                            marginTop={'8px'}
                                            marginBottom={1}
                                        >
                                            {friend.username}
                                        </Heading>

                                        <Text
                                            marginLeft={'-10px'}
                                            color={'#808080'}
                                        >
                                            {friend.status}
                                        </Text>
                                    </CardBody>
                                </Stack>
                            </Flex>
                            <Spacer w={'60em'} />
                            <Box>
                                <Link to={`/chat/rooms-dms/${friend?.id}`}>
                                    <IconButton
                                        aria-label=""
                                        icon={<BsChatLeftFill size={30} />}
                                        color={'#a435f0'}
                                        size={'lg'}
                                    />
                                </Link>
                                {props.friend ? (
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            aria-label="Options"
                                            icon={
                                                <BsThreeDotsVertical
                                                    size={40}
                                                    color="#a435f0"
                                                />
                                            }
                                            variant="outline"
                                            h={100}
                                            border={'none'}
                                            bg={'none'}
                                        >
                                            Action
                                        </MenuButton>
                                        <MenuList
                                            bg={'#c56af0'}
                                            color={'white'}
                                            marginRight={0}
                                            marginTop={-80.5}
                                        >
                                            <MenuItem
                                                paddingBottom={2}
                                                bg={'none'}
                                                icon={<BsTrash />}
                                                onClick={() =>
                                                    handleRemoveFriend(
                                                        friend.username
                                                    )
                                                }
                                            >
                                                Remove Friend
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                ) : null}
                            </Box>
                        </Flex>
                    </Card>
                );
            })}
        </div>
    );
};

export default Friends;
