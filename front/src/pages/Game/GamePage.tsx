import { Flex } from "@chakra-ui/react";
import NavbarSearch from "../../components/NavbarSearch";
import Sidebar from "../../components/Sidebar";
import Game from "./Game";

const GamePage = () => {
    return (
    <div>
            <NavbarSearch />
            <Flex>
                <Sidebar />
                <Game />
            </Flex>
        </div>)
}

export default GamePage;