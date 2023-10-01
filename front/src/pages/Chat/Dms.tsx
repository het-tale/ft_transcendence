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
    useDisclosure
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

export interface SentData {
    message: string;
    to: string;
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
            <NavbarSearch render={render} setRender={setRender} />
            <Flex>
                <Sidebar />
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
