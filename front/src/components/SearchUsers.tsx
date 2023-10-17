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
import React from 'react';
import { Link } from 'react-router-dom';

interface SearchUsersProps {
    users: UserType[];
    setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
}

export const SearchUsers = (props: SearchUsersProps) => {
    console.log('THIS IS THE USERS', props.users);
    console.log('THIS IS THE LENGTH USERS', props.users.length);
    return (
        <>
            {props.users.length > 0
                ? props.users.map((user) => {
                      return (
                          <Card
                              w={'300px'}
                              height={'fit-content'}
                              marginRight={'12px'}
                          >
                              <CardHeader>
                                  <Heading size="md">UserName</Heading>
                              </CardHeader>

                              <CardBody>
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
                                              >
                                                  <Text
                                                      pt="2"
                                                      fontSize="md"
                                                      fontWeight={'bold'}
                                                      marginTop={'1.8rem'}
                                                      marginLeft={'1rem'}
                                                  >
                                                      {user.username}
                                                  </Text>
                                              </Link>
                                          </Flex>
                                      </Box>
                                  </Stack>
                              </CardBody>
                          </Card>
                      );
                  })
                : null}
        </>
    );
};
