import {
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
    Text
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { BsChatLeftFill, BsThreeDotsVertical, BsTrash } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { UserType } from '../../Types/User';
import React from 'react';
import { GetFriendsList } from './GetFriendsList';
import { GetMutualFriendsList } from './GetMutualFriendsList';

interface FriendsProps {
    friend: boolean;
    user?: UserType;
    update?: boolean;
    setUpdate?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Friends = (props: FriendsProps) => {
    const [friends, setFriends] = React.useState<UserType[]>([]);
    console.log('FRIENDS', props.user);
    useEffect(() => {
        console.log('Friends');
        props.friend
            ? GetFriendsList().then((data) => {
                  setFriends(data);
              })
            : GetMutualFriendsList(props.user?.username).then((data) => {
                  setFriends(data);
              });
    }, [props.update]);
    return (
        <div>
            {friends?.map((friend) => {
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
                                <Image
                                    objectFit="cover"
                                    width={'50px'}
                                    height={'50px'}
                                    marginTop={'18px'}
                                    src={friend.avatar}
                                    alt={'name'}
                                    borderRadius={'30px'}
                                />
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
                            <Box marginTop={1}>
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
