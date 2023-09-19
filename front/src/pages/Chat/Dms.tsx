import { color } from "framer-motion";
import NavbarSearch from "../../components/NavbarSearch";
import Sidebar from "../../components/Sidebar";
import LeftSide from "./LeftSide";
import { Box, Flex, Grid, GridItem, SimpleGrid, Spacer, background } from '@chakra-ui/react'
import RightSide from "./RightSide";

const Dms = () => {
    return (
        <div>
            <NavbarSearch />
            <Flex>
                <Sidebar />
                <Box w="100%" bg="#E9ECEF">
                    <Flex justify="space-between">
                        <LeftSide/>
                        <div className="delimiter"></div>
                        <RightSide />
                    </Flex>
                </Box>
            </Flex>
        </div>
    )
}

export default Dms;