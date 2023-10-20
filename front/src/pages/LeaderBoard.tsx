import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Flex,
    Text,
    AvatarGroup,
    Avatar,
    AvatarBadge
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { RenderContext } from '../RenderContext';
import { UserType } from '../Types/User';
import { GetLeaderBoard } from './GetLeaderBoard';
import { GetFriendsList } from './Profile/GetFriendsList';

export const LeaderBoard = () => {
    const renderData = React.useContext(RenderContext);
    const [users, setUsers] = React.useState<UserType[]>([]);
    const [friends, setFriends] = React.useState<UserType[]>([]);
    useEffect(() => {
        GetLeaderBoard().then((data) => {
            setUsers(data);
        });
        GetFriendsList().then((data) => {
            setFriends(data);
        });
    }, [renderData.renderData]);
    return (
        <Flex flexDirection={'column'} w={'full'} p={'2rem'}>
            <Flex
                flexDirection={'row'}
                justifyContent={'space-between'}
                width={'full'}
            >
                <h1>LeaderBoard</h1>
                <Flex flexDirection={'column'}>
                    <Text
                        fontSize={'xs'}
                        fontFamily={'Krona One'}
                        fontStyle={'italic'}
                        color={'#a435f0'}
                    >
                        Your Friends in this ladder:
                    </Text>
                    <AvatarGroup size="md" max={3}>
                        {friends?.map((friend) => {
                            return users?.some(
                                (user) => user.id === friend.id
                            ) ? (
                                <Avatar
                                    name={friend?.username}
                                    src={friend?.avatar}
                                />
                            ) : null;
                        })}
                    </AvatarGroup>
                </Flex>
            </Flex>
            <Flex flexDirection={'column'} marginBottom={'2rem'}>
                <Text
                    fontSize={'xs'}
                    fontFamily={'Krona One'}
                    fontStyle={'italic'}
                    color={'#a435f0'}
                >
                    Your Place in this ladder:
                </Text>
                {users?.some((user) => user.id === renderData.user?.id) ? (
                    <Table boxShadow={'md'}>
                        <Tr>
                            <Td>{renderData.user?.g_rank}</Td>
                            <Td>
                                <Flex
                                    flexDirection={'row'}
                                    alignItems={'center'}
                                >
                                    <Avatar
                                        src={renderData.user?.avatar}
                                        marginRight={'2'}
                                    >
                                        <AvatarBadge
                                            boxSize="1.25em"
                                            bg={
                                                renderData.user?.status ===
                                                'offline'
                                                    ? '#ccc'
                                                    : 'green.500'
                                            }
                                        />
                                    </Avatar>
                                    <Text marginTop={'1rem'} fontSize={'md'}>
                                        {renderData.user?.username}
                                    </Text>
                                </Flex>
                            </Td>
                            <Td>{renderData.user?.win_rate}</Td>
                        </Tr>
                    </Table>
                ) : (
                    'You Have No Place in this ladder'
                )}
            </Flex>
            <TableContainer borderWidth="1px" borderRadius="lg" p={4}>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th color={'#a435f0'}>Rank</Th>
                            <Th color={'#a435f0'}>User</Th>
                            <Th isNumeric color={'#a435f0'}>
                                Win Rate,%
                            </Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {users?.map((user) => {
                            return (
                                <Tr>
                                    <Td>{user?.g_rank}</Td>
                                    <Td>
                                        <Flex
                                            flexDirection={'row'}
                                            alignItems={'center'}
                                        >
                                            <Avatar
                                                src={user?.avatar}
                                                marginRight={'2'}
                                            >
                                                <AvatarBadge
                                                    boxSize="1.25em"
                                                    bg={
                                                        user?.status ===
                                                        'offline'
                                                            ? '#ccc'
                                                            : 'green.500'
                                                    }
                                                />
                                            </Avatar>
                                            <Text
                                                marginTop={'1rem'}
                                                fontSize={'md'}
                                            >
                                                {user?.username}
                                            </Text>
                                        </Flex>
                                    </Td>
                                    <Td isNumeric>{user?.win_rate}</Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </Flex>
    );
};
