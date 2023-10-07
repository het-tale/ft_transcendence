import {
    Box,
    Card,
    CardBody,
    Flex,
    Heading,
    IconButton,
    Image,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spacer,
    Stack,
    Text
} from '@chakra-ui/react';
import {
    Bs0CircleFill,
    BsChatLeftFill,
    BsCircleFill,
    BsThreeDots,
    BsThreeDotsVertical,
    BsTrash
} from 'react-icons/bs';
import { Link } from 'react-router-dom';

const Friends = () => {
    return (
        <div>
            <Card
                direction={{ base: 'column', sm: 'row' }}
                overflow="hidden"
                variant="outline"
                bg={'#EEEEFF'}
                boxShadow={'2xl'}
                p={2}
                h={'100px'}
                w={'100%'}
                style={{ boxShadow: 'none' }}
            >
                <Flex>
                    <Flex>
                        <Image
                            objectFit="cover"
                            width={'50px'}
                            height={'50px'}
                            marginTop={'18px'}
                            src={'/assets/het-tale.jpg'}
                            alt={'name'}
                            borderRadius={'30px'}
                        />
                        <Stack>
                            <CardBody>
                                <Heading
                                    as="h6"
                                    size="sm"
                                    fontWeight="bold"
                                    marginLeft={'-10px'}
                                    marginTop={'8px'}
                                    marginBottom={1}
                                >
                                    het-tale
                                </Heading>

                                <Text marginLeft={'-10px'} color={'#808080'}>
                                    Online
                                </Text>
                            </CardBody>
                        </Stack>
                    </Flex>
                    <Spacer w={'60em'} />
                    <Box marginTop={1}>
                        <Link to="/chat">
                            <IconButton
                                aria-label=""
                                icon={<BsChatLeftFill size={30} />}
                                color={'#a435f0'}
                                size={'lg'}
                            />
                        </Link>
                        <Menu>
                            <MenuButton
                                as={IconButton}
                                aria-label="Options"
                                icon={
                                    <BsThreeDotsVertical
                                        size={40}
                                        color="#a435f0"
                                    />
                                }
                                variant="outline"
                                h={100}
                                border={'none'}
                                bg={'none'}
                            >
                                Action
                            </MenuButton>
                            <MenuList
                                bg={'#c56af0'}
                                color={'white'}
                                marginRight={0}
                                marginTop={-80.5}
                            >
                                <MenuItem
                                    paddingBottom={2}
                                    bg={'none'}
                                    icon={<BsTrash />}
                                >
                                    Remove Friend
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </Box>
                </Flex>
            </Card>
        </div>
    );
};

export default Friends;
