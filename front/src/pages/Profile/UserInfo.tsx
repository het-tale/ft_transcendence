import { Avatar, Box, Button, Card, CardBody, CardFooter, CardHeader, Flex, Heading, IconButton, Text, Image, Center, Menu, MenuButton, MenuList, MenuItem, List, ListItem, ListIcon, useDisclosure } from "@chakra-ui/react";
import { BsThreeDotsVertical, BsPencilFill, BsVolumeMuteFill, BsPersonDashFill, BsPersonXFill, BsGearFill, BsBoxArrowRight, BsCircleFill } from "react-icons/bs";
import ModalUi from "../../components/ModalUi";
import EditProfileBody from "./EditProfileBody";

const UserInfo = () => {
    let status = "Online";
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <div className="container" style={{width: "600px"}}>
            <Center>
            <Image
                objectFit='cover'
                src='/assets/het-tale.jpg'
                alt='profile'
                borderRadius={"50%"}
                w={200}
                alignItems={"center"}
                />
            </Center>
            <Flex marginTop={2}>
            <Center>
                <Text fontSize={15} fontWeight={"bold"} marginLeft={25} marginTop={15}>Het-tale</Text>
            <IconButton
            marginTop={11}
            size={"sm"}
            variant='ghost'
            colorScheme='gray'
            aria-label=""
            marginLeft={2}
            {
                ...status === "Online" ? {color: "#00FF00"} : {color: "#E9ECEF", border: "1px solid #E9ECEF", borderRadius: "50%", padding: "0px"}
            }
            icon={<BsCircleFill />}
            />
                </Center>
            </Flex>
            <List spacing={4} marginTop={5}>
                <ListItem>
                    <ListIcon as={IconButton} icon={<BsCircleFill />} color='#a435f0' />
                </ListItem>
                <ListItem>
                    <ListIcon as={IconButton} icon={<BsCircleFill />}color='#a435f0' />
                </ListItem>
                <ListItem>
                    <ListIcon as={IconButton} icon={<BsCircleFill />} color='#a435f0' />
                </ListItem>
                <ListItem>
                    <ListIcon as={IconButton} icon={<BsCircleFill />} color='#a435f0' />
                </ListItem>
            </List>
            <Button
            w={"100%"}
            bg={"#a435f0"}
            color={"white"}
            marginBottom={"-42rem"}
            onClick={onOpen}
            >EditProfile</Button>
             <ModalUi isOpen={isOpen} onOpen={onOpen} onClose={onClose} title={'Edit Profile'} body={<EditProfileBody />}/>
        </div>
    );
};

export default UserInfo;