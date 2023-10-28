import {
    Card,
    CardBody,
    Image,
    Stack,
    Heading,
    Text,
    Flex
} from '@chakra-ui/react';
import { UserType } from '../../Types/User';
import React from 'react';
import UserId from './GetUserById';
import { SocketContext } from '../../socket';

interface MessageUserProps {
    children?: React.ReactNode;
    design?: string;
    id: number;
    render: boolean;
    updateUser?: boolean;
    setUpdateUser?: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserDmInfo = (props: MessageUserProps) => {
    const [user, setUser] = React.useState<UserType>();
    const socket = React.useContext(SocketContext);
    const [update, setUpdate] = React.useState(false);

    // socket.on('userOffline', (data: any) => {
    //     // console.log('USER OFFLINE', data);
    //     // console.log('RENDER Before', update);
    //     setUpdate(!update);
    //     // console.log('RENDER after', update);
    // });
    // socket.on('userOnline', (data: any) => {
    //     // console.log('USER ONLINE', data);
    //     setUpdate(!update);
    // });
    // console.log('User ID', props.id);
    React.useEffect(() => {
        async function fetchUserData() {
            const userData = await UserId(Number(props.id));
            setUser(userData);
        }
        fetchUserData();
    }, [update, props.updateUser, props.render, props.id]);
    return (
        <div>
            <button style={{ width: '100%' }}>
                <Card
                    className={props.design}
                    direction={{ base: 'column', sm: 'row' }}
                    overflow="hidden"
                    variant="outline"
                    bg={'#F5F5F5'}
                    boxShadow={'2xl'}
                    p={2}
                    h={'100px'}
                    w={'100%'}
                    style={{ boxShadow: 'none' }}
                >
                    <Image
                        objectFit="cover"
                        width={'50px'}
                        height={'50px'}
                        marginTop={'18px'}
                        src={user?.avatar}
                        alt="avatar"
                        borderRadius={'30px'}
                    />

                    <Stack>
                        <CardBody>
                            <Heading
                                as="h6"
                                size="sm"
                                fontWeight="bold"
                                marginLeft={'0.3rem'}
                                marginTop={'8px'}
                                marginBottom={1}
                            >
                                {user?.username}
                            </Heading>

                            <Flex justifyContent={'flex-start'}>
                                <Text
                                    marginLeft={'0.5rem'}
                                    color={'#808080'}
                                    marginRight={'2px'}
                                >
                                    {user?.status}
                                </Text>
                                <Text
                                    w={'10px'}
                                    backgroundColor={
                                        user?.status === 'online'
                                            ? 'green'
                                            : '#808080'
                                    }
                                    h={'10px'}
                                    borderRadius={'50%'}
                                    marginTop={1}
                                />
                            </Flex>
                        </CardBody>
                    </Stack>
                    <>{props.children}</>
                </Card>
            </button>
        </div>
    );
};

export default UserDmInfo;
