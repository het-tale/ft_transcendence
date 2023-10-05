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
import React, { useEffect, useState } from 'react';
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
    to: string;
}
export interface CreateChannelData {
    room: string;
    avatar: string;
    type: string;
    password: string;
}

const Dms = (props: any) => {
    const [currentTab, setCurrentTab] = React.useState('1');
    const [firstLoad, setFirstLoad] = React.useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [renderActions, setRenderActions] = React.useState(false);
    const formRef = React.useRef(null);
    const [selectedOption, setSelectedOption] = React.useState('');
    const [showField, setShowField] = React.useState(false);
    const [name, setName] = React.useState('');
    // const [dms, setDms] = React.useState<UserType[]>([]);
    const [userDm, setUserDm] = React.useState<UserType>();
    const [id, setId] = React.useState(0);
    const [isUserDm, setIsUserDm] = React.useState(false);
    const [updateUser, setUpdateUser] = React.useState(false);
    const [updateClass, setUpdateClass] = useState<number>();
    // const socket = React.useContext(SocketContext);
    // const [render, setRender] = React.useState(false);
    // const toast = useToast();
    // useEffect(() => {
    //     GetDms().then((data) => {
    //         setDms(data);
    //     });
    // }, [props.render]);
    const handleRenderActions = () => {
        setRenderActions(!renderActions);
    };
    const handleRadioChange = (event: any) => {
        setSelectedOption(event.target.value);
        setShowField(event.target.value === 'Protected');
        console.log('RADIOOOOOOO CHAAAANGE', event.target.value);
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
    console.log('DMSSSSSSSSSSSSSS', props.dms);
    const handleDeleteChat = async () => {
        if (!userDm) return;
        console.log('Delete chat', userDm.username);
        try {
            const res = await client.delete(`chat/dms/${userDm.username}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('RES', res);
            if (res.status === 200) {
                props.setRender(!props.render);
                //delete user from dms list
                // onClose3();
            }
        } catch (error: any) {
            console.log('Error', error);
            props.toast({
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
                                    setRender={props.setRender}
                                    render={props.render}
                                />
                            }
                        />
                    </Flex>
                    {props.dms ? (
                        props.dms?.map((dm: UserType) => {
                            return (
                                <MessageUser
                                    profile={dm.avatar}
                                    name={dm.username}
                                    dm={dm}
                                    setUserDm={setUserDm}
                                    setFirstLoad={setFirstLoad}
                                    message={dm.status}
                                    render={props.render}
                                    setRender={props.setRender}
                                    updateUser={updateUser}
                                    setUpdateUser={setUpdateUser}
                                    updateClass={updateClass}
                                    setUpdateClass={setUpdateClass}
                                    activeCard={
                                        updateClass === dm?.id
                                            ? 'clickedDm'
                                            : ''
                                    }
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
                        render={props.render}
                        setRender={props.setRender}
                        handleDeleteChat={handleDeleteChat}
                        updateUser={updateUser}
                        setUpdateUser={setUpdateUser}
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
                                    onClose={onClose}
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
                <Sidebar render={props.render} setRender={props.setRender} />
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
