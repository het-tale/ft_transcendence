import '../css/landing.css';
import '../css/sidebar.css';
import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NavbarSearch from '../components/NavbarSearch';
import { Flex, useToast } from '@chakra-ui/react';
import { SocketContext } from '../socket';

function Home() {
    const socket = React.useContext(SocketContext);
    const toast = useToast();
    const token = localStorage.getItem('token');
    useEffect(() => {
        socket.auth = { token: token };
        socket.connect();
    }, []);

    socket.on('roomInvitation', (data: any) => {
        console.log('roomInvitation', data);
        toast({
            title: 'success',
            description: data.from,
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'bottom-right'
        });
    });
    socket.on('roomInvitationError', (data: any) => {
        console.log('roomInvitationError', data);
        toast({
            title: 'Error',
            description: data,
            status: 'error',
            duration: 9000,
            isClosable: true,
            position: 'bottom-right'
        });
    });
    return (
        <Flex flexDirection={'column'}>
            <NavbarSearch />
            <Sidebar />
        </Flex>
    );
}

export default Home;
