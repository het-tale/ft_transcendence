import { Tabs, TabList, TabPanels, Tab, TabPanel, Flex, Spacer, Box, Center } from '@chakra-ui/react'
import '../../css/chat/left.css'
import MessageUser from './MessageUser';
import { BsThreeDots } from "react-icons/bs";
const RightSide = () => {
    return (
        <div className='container'>
            <Flex>
                <Box width={"98%"}>

                <MessageUser profile='/assets/het-tale.jpg' name="Hasnaa" message="" />
                </Box>
                <Box textAlign={"center"} marginTop={7}>

                <BsThreeDots color='#a435f0' size={60} transform='rotate(90)' />
                </Box>
            </Flex>
        </div>
    )
}

export default RightSide;