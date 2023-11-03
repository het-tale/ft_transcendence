import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Heading,
    Stack,
    StackDivider,
    Text,
    Image
} from '@chakra-ui/react';
import { UserType } from '../Types/User';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { RenderContext } from '../RenderContext';

interface SearchUsersProps {
    users: UserType[];
    setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
    showHide: boolean;
    setShowHide: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SearchUsers = (props: SearchUsersProps) => {
    const renderData = useContext(RenderContext);
    return (
        <>
            {props.users.length > 0 ? (
                <Card
                    w={'300px'}
                    height={'fit-content'}
                    marginRight={'12px'}
                    position={'absolute'}
                    right={'0'}
                    top={'9%'}
                >
                    <CardHeader>
                        <Heading size="md">UserName</Heading>
                    </CardHeader>

                    {props.users.map((user) => {
                        return (
                            <CardBody key={user?.id}>
                                <Stack divider={<StackDivider />} spacing="4">
                                    <Box>
                                        <Flex
                                            alignItems={'center'}
                                            marginTop={'-4rem'}
                                        >
                                            <Image
                                                objectFit="cover"
                                                width={'25px'}
                                                height={'25px'}
                                                marginTop={'18px'}
                                                src={user.avatar}
                                                alt={'name'}
                                                borderRadius={'30px'}
                                            ></Image>
                                            <Link
                                                to={`/user-profile/${user?.id}`}
                                                onClick={() => {
                                                    renderData.setRenderData(
                                                        !renderData.renderData
                                                    );
                                                    props.setShowHide &&
                                                        props.setShowHide(
                                                            false
                                                        );
                                                }}
                                            >
                                                <Text
                                                    pt="2"
                                                    fontSize="md"
                                                    fontWeight={'bold'}
                                                    marginTop={'1.8rem'}
                                                    marginLeft={'1rem'}
                                                    color={'#a435f0'}
                                                >
                                                    {user.username}
                                                </Text>
                                            </Link>
                                        </Flex>
                                    </Box>
                                </Stack>
                            </CardBody>
                        );
                    })}
                </Card>
            ) : null}
        </>
    );
};
