import '../css/landing.css';
import '../css/sidebar.css';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import NavbarSearch from '../components/NavbarSearch';
import { Button, ButtonGroup, Card, Flex, Text } from '@chakra-ui/react';
import { CardFooter } from 'react-bootstrap';
import { Notification } from '../Types/Notification';
import { SocketContext } from '../socket';

interface homeProps {
    notifArray: Notification[];
}

function Home(props: homeProps) {
    const [notification, setNotification] = useState(false);
    const socket = React.useContext(SocketContext);
    const handleAcceptReject = (notif: Notification, isAccepted: boolean) => {
        console.log('m handling notification');
        socket.emit('handleRoomInvitation', {
            room: notif.type,
            from: notif.from,
            isAccepted: isAccepted
        });
        props.notifArray.splice(props.notifArray.indexOf(notif), 1);
    };
    return (
        <Flex flexDirection={'column'}>
            <NavbarSearch />
            <Flex flexDirection={'row'}>
                <Sidebar
                    notification={notification}
                    setNotification={setNotification}
                    notifArray={props.notifArray}
                />
                {notification ? (
                    <div className="notifContainer">
                        <h3 style={{ textAlign: 'center' }}>Notifications</h3>
                        {props.notifArray.map((notif) => {
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
                                    marginBottom={2}
                                >
                                    <Flex
                                        w={'full'}
                                        justifyContent={'space-between'}
                                    >
                                        <Text
                                            fontWeight={'bold'}
                                            textAlign={'center'}
                                            fontSize={15}
                                            color={'#a435f0'}
                                        >
                                            {notif.from}
                                        </Text>
                                        <Flex
                                            justifyContent={'flex-end'}
                                            flexDirection={'column'}
                                        >
                                            <ButtonGroup>
                                                <Button
                                                    backgroundColor={'white'}
                                                    color={'#a435f0'}
                                                    onClick={() =>
                                                        handleAcceptReject(
                                                            notif,
                                                            false
                                                        )
                                                    }
                                                >
                                                    Decline
                                                </Button>
                                                <Button
                                                    backgroundColor={'#a435f0'}
                                                    color={'white'}
                                                    onClick={() =>
                                                        handleAcceptReject(
                                                            notif,
                                                            true
                                                        )
                                                    }
                                                >
                                                    Accept
                                                </Button>
                                            </ButtonGroup>
                                        </Flex>
                                    </Flex>
                                </Card>
                            );
                        })}
                    </div>
                ) : null}
            </Flex>
        </Flex>
    );
}

export default Home;
