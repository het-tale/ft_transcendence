import { Box, Flex } from '@chakra-ui/react';
import Game from './Game';
import NavbarSearch from '../../components/NavbarSearch';
import Sidebar from '../../components/Sidebar';

const GamePage = () => {
    return (
        <Flex flexDirection={'column'}>
            <NavbarSearch />
            <Flex
                bg="url('assets/lilpong.png')"
                // bgGradient={'linear(to-l, #7928CA, #FF0080)'}
                backdropFilter="blur(10px) hue-rotate(90deg)"
            >
                <Sidebar />
                <Game />
            </Flex>
        </Flex>
    );
};

export default GamePage;
