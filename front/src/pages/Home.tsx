import '../css/landing.css';
import '../css/sidebar.css';
import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NavbarSearch from '../components/NavbarSearch';
import { Flex } from '@chakra-ui/react';
import { SocketContext } from '../socket';

function Home() {
    const socket = React.useContext(SocketContext);
    const token = localStorage.getItem('token');
    useEffect(() => {
        socket.auth = { token: token };
        socket.connect();
    }, []);
    return (
        <Flex flexDirection={'column'}>
            <NavbarSearch />
            <Sidebar />
        </Flex>
    );
}

export default Home;
