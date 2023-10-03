import { color } from 'framer-motion';
import NavbarSearch from '../../components/NavbarSearch';
import Sidebar from '../../components/Sidebar';
import LeftSide from './LeftSide';
import {
    Box,
    Flex,
    Grid,
    GridItem,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    SimpleGrid,
    Spacer,
    background,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import RightSide from './RightSide';
import React, { useEffect } from 'react';
import Search from '../../components/Search';
import MessageUser from './MessageUser';
import ModalUi from '../../components/ModalUi';
import {
    BsController,
    BsPersonCircle,
    BsPersonFillSlash,
    BsThreeDots,
    BsTrash
} from 'react-icons/bs';
import MessageContent from './MessageContent';
import TypingBar from './TypingBar';
import DmsChat from './DmsChat';
import RoomsChat from './RoomsChat';
import ModalBodyUi from '../../components/ModalBodyUi';
import { UserType } from '../../Types/User';
import GetDms from './GetDms';
import { SocketContext } from '../../socket';
import ModalSendMessage from '../../components/ModalSendMessage';
import { SubmitHandler, useForm } from 'react-hook-form';
import client from '../../components/Client';

export interface SentData {
    message: string;
    to: number;
}
const Dms = () => {
    const [currentTab, setCurrentTab] = React.useState('1');
    const [firstLoad, setFirstLoad] = React.useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [renderActions, setRenderActions] = React.useState(false);
    const formRef = React.useRef(null);
    const [selectedOption, setSelectedOption] = React.useState('');
    const [showField, setShowField] = React.useState(false);
    const [name, setName] = React.useState('');
    const [dms, setDms] = React.useState<UserType[]>([]);
    const [userDm, setUserDm] = React.useState<UserType>();
    const [id, setId] = React.useState(0);
    const [isUserDm, setIsUserDm] = React.useState(false);
    const socket = React.useContext(SocketContext);
    const [render, setRender] = React.useState(false);
    const toast = useToast();
    useEffect(() => {
        GetDms().then((data) => {
            setDms(data);
        });
    }, [render]);
    const handleRenderActions = () => {
        setRenderActions(!renderActions);
    };
    const handleRadioChange = (event: any) => {
        setSelectedOption(event.target.value);
        setShowField(event.target.value === 'protected');
        console.log(event.target.value);
    };

    const handleSubmit1 = () => {
        const data = new FormData(formRef.current ?? undefined);
        const formData = {
            name: data.get('name'),
            avatar: data.get('avatar'),
            type: data.get('group1'),
            password: data.get('password')
        };
        console.log('FORMDATA', formData);
    };

    const { register, handleSubmit } = useForm<SentData>();
    const handleSendMessage: SubmitHandler<SentData> = (data) => {
        console.log('FORMDATA', data);
    };
    console.log('DMS', dms);
    /**                     start listening */
    socket.on('privateMessage', (data: any) => {
        console.log('MESSAGE DATA', data);
        setRender(!render);
    });
    const timer = setTimeout(() => {
        socket.on('privateMessageError', (data: any) => {
            console.log('MESSAGE ERROR DATA', data);

            toast({
                title: 'Error',
                description: data,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'top-right'
            });
        });
    }, 500);
    socket.on('userOffline', (data: any) => {
        console.log('USER OFFLINE', data);
        setRender(!render);
    });
    socket.on('userOnline', (data: any) => {
        console.log('USER ONLINE', data);
        setRender(!render);
    });

    const handleDeleteChat = async () => {
        if (!userDm) return;
        console.log('Delete chat', userDm.id);
        try {
            const res = await client.delete(`chat/dms/${userDm.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('RES', res);
            if (res.status === 200) {
                setRender(!render);
                //delete user from dms list
                // onClose3();
            }
        } catch (error: any) {
            console.log('Error', error);
            toast({
                title: 'Error.',
                description: error.response.data.message,
                status: 'error',
                duration: 9000,
                isClosable: true,
                position: 'bottom-right'
            });
        }
    };

    /**                     end listening */
    const [test, setTest] = React.useState(false);
    const tabs = [
        {
            id: 1,
            tabTitle: 'Direct Messages',
            content: (
                <>
                    <Flex justify={'space-between'}>
                        <Search
                            name="tabDesign"
                            setName={setName}
                            filter={name}
                        />
                        <button className="newChannel" onClick={onOpen}>
                            New Message
                        </button>
                        <ModalUi
                            isOpen={isOpen}
                            onOpen={onOpen}
                            onClose={onClose}
                            title={'Send New Message'}
                            handleSubmit={handleSubmit}
                            handleMessageData={handleSendMessage}
                            body={
                                <ModalSendMessage
                                    onClose={onClose}
                                    sendMessage={register}
                                    handleSubmit={handleSubmit}
                                    handleSendMessage={handleSendMessage}
                                    setRender={setRender}
                                    render={render}
                                />
                            }
                        />
                    </Flex>
                    {dms ? (
                        dms?.map((dm) => {
                            return (
                                <MessageUser
                                    profile={dm.avatar}
                                    name={dm.username}
                                    message=""
                                    dm={dm}
                                    setUserDm={setUserDm}
                                    setFirstLoad={setFirstLoad}
                                />
                            );
                        })
                    ) : (
                        <></>
                    )}
                    {console.log('USERDM', userDm)}
                </>
            ),
            rightSide: (
                <>
                    <DmsChat
                        userDm={userDm}
                        test={test}
                        render={render}
                        setRender={setRender}
                        handleDeleteChat={handleDeleteChat}
                    />
                </>
            )
        },
        {
            id: 2,
            tabTitle: 'Channels',
            content: (
                <>
                    <Flex justify={'space-between'}>
                        <Search name="tabDesign" />

                        <button className="newChannel" onClick={onOpen}>
                            New
                        </button>
                        <ModalUi
                            isOpen={isOpen}
                            onOpen={onOpen}
                            onClose={onClose}
                            title={'Add new Channel'}
                            handleData={handleSubmit1}
                            body={
                                <ModalBodyUi
                                    formRef={formRef}
                                    selectedOption={selectedOption}
                                    handleRadioChange={handleRadioChange}
                                    showField={showField}
                                />
                            }
                        />
                    </Flex>
                </>
            ),
            rightSide: (
                <>
                    <RoomsChat handleRenderActions={handleRenderActions} />
                </>
            )
        }
    ];

    const handleTabClick = (e: any) => {
        setCurrentTab(e.target.id);
        setFirstLoad(e.target.tabTitle);
    };
    return (
        <Flex flexDirection={'column'}>
            <NavbarSearch />
            <Flex>
                <Sidebar render={render} setRender={setRender} />
                <Box w="100%" bg="#E9ECEF" h={'90%'}>
                    <Flex justify="space-between">
                        <LeftSide
                            handleTabClick={handleTabClick}
                            tabs={tabs}
                            currentTab={currentTab}
                        />
                        <div className="delimiter"></div>
                        <RightSide
                            handleTabClick={handleTabClick}
                            tabs={tabs}
                            currentTab={currentTab}
                            firstLoad={firstLoad}
                            renderActions={renderActions}
                        />
                    </Flex>
                </Box>
            </Flex>
        </Flex>
    );
};

export default Dms;
