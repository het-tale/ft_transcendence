import { BsController, BsPersonCircle, BsPersonFillSlash, BsThreeDots, BsTrash } from "react-icons/bs";
import MessageContent from "./MessageContent";
import TypingBar from "./TypingBar";
import { Box, Flex, Grid, GridItem, IconButton, Menu, MenuButton, MenuItem, MenuList, SimpleGrid, Spacer, background, useDisclosure } from '@chakra-ui/react'
import MessageUser from "./MessageUser";
import React, { useEffect } from "react";
import { SocketContext } from "../../socket";
import GetDms from "./GetDms";
import { UserType } from "../../Types/User";
import { MessageType } from "../../Types/Message";
import GetMessages from "./GetMessages";

const DmsChat = (props : any) => {
    const [dms, setDms] = React.useState<UserType[]>([]);
    const socket = React.useContext(SocketContext);
    const [messages, setMessages] = React.useState<MessageType[]>([]);
    const [render, setRender] = React.useState(false);
    useEffect(() => {
        const res = GetDms().then((data) => {
             setDms(data);
         })
         const res2 = props.userDm ? GetMessages(props.userDm.username).then((data) => {setMessages(data)}) : null;
    }, [render, props.userDm]);
    return (<Flex flexDirection={"column"} justifyContent={"space-between"}>
        <Flex h={"10%"}>
                <Box width={"98%"}>
                {
                    props.userDm ? <MessageUser profile={props.userDm.avatar} name={props.userDm.username} message="online" /> : <></>
                }
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
                        <MenuItem paddingBottom={2} bg={'none'} icon={<BsController />}>
                        Play with me
                        </MenuItem>
                        <MenuItem paddingBottom={2} bg={'none'} icon={<BsPersonCircle />}>
                        View Profile
                        </MenuItem>
                        <MenuItem paddingBottom={2} bg={'none'} icon={<BsTrash />}>
                        Delete Chat
                        </MenuItem>
                        <MenuItem bg={'none'} icon={<BsPersonFillSlash />}>
                        Block
                        </MenuItem>
                    </MenuList>
                    </Menu>
        </Flex>
            <div className="messagesContainer">
           {messages?.map((message) => {
                return <MessageContent message={message.content} name="sender" room={false}/>
            })
            }
            </div>
            {/* <MessageContent message='Hello' name='sender' room={false}/>
            <MessageContent message='Hello again' name='receiver' room={false}/>
            <MessageContent message='Hello again' name='receiver' room={false}/>
            <MessageContent message='Hello again' name='sender' room={false}/> */}
            <TypingBar userDm={props.userDm} setRender={setRender} render={render}/>
    </Flex>);
}

export default DmsChat;