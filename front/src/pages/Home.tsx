import '../css/landing.css';
import '../css/sidebar.css';
import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import NavbarSearch from '../components/NavbarSearch';
import { Flex } from '@chakra-ui/react';

function Home() {
    return (
        <Flex flexDirection={'column'}>
            <NavbarSearch />
            <Sidebar />
        </Flex>
    );
}

export default Home;
