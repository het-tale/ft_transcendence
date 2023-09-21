import { Tabs, TabList, TabPanels, Tab, TabPanel, Flex, Spacer, Box, Center, Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react'
import '../../css/chat/left.css'
import MessageUser from './MessageUser';
import { BsThreeDots, BsPersonCircle, BsPersonFillSlash, BsTrash, BsController } from "react-icons/bs";
import MessageContent from './MessageContent';
import TypingBar from './TypingBar';
const RightSide = () => {
    return (
        <div className='container'>
            <Flex>
                <Box width={"98%"}>

                <MessageUser profile='/assets/het-tale.jpg' name="Hasnaa" message="online" />
                </Box>
                <Menu>
                    <MenuButton
                        as={IconButton}
                        aria-label='Options'
                        icon={<BsThreeDots color='#a435f0' size={60} transform='rotate(90)' />}
                        variant='outline'
                        bg={"#F5F5F5"}
                        h={100}
                    />
                    <MenuList 
                    marginRight={0}
                    bg={"#c56af0"}
                    color={'white'}
                    w={250}
                    p={6}
                    fontFamily={"krona one"}
                    borderRadius={20}
                    marginTop={-25}
                    >
                        <MenuItem paddingBottom={2} icon={<BsController />}>
                        Play with me
                        </MenuItem>
                        <MenuItem paddingBottom={2} icon={<BsPersonCircle />}>
                        View Profile
                        </MenuItem>
                        <MenuItem paddingBottom={2} icon={<BsTrash />}>
                        Delete Chat
                        </MenuItem>
                        <MenuItem icon={<BsPersonFillSlash />}>
                        Block
                        </MenuItem>
                    </MenuList>
                    </Menu>
            </Flex>
            <MessageContent message='Hello' name='sender'/>
            <MessageContent message='Hello again' name='receiver'/>
            <MessageContent message='Hello again' name='receiver'/>
            <MessageContent message='Hello again' name='sender'/>
            <TypingBar />
        </div>
    )
}

export default RightSide;