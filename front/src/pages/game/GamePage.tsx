import { Box, Flex } from "@chakra-ui/react";
import Game from "./Game";
import NavbarSearch from "../../components/NavbarSearch";
import Sidebar from "../../components/Sidebar";

const GamePage = () => {
	return (
		<Flex flexDirection={'column'}>
            <NavbarSearch />
            <Flex>
                <Sidebar />
                <Box w="100%" bg="#E9ECEF" h={'90%'}>
                    <Flex justify="space-between">
                       <Game />
                    </Flex>
                </Box>
            </Flex>
        </Flex>
	);
}

export default GamePage;