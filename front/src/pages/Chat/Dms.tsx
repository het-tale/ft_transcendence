import LeftSide from './LeftSide';
import { Box, Flex, useDisclosure } from '@chakra-ui/react';
import RightSide from './RightSide';
import React, { useState } from 'react';
import Search from '../../components/Search';
import MessageUser from './MessageUser';
import ModalUi from '../../components/ModalUi';
import { BsPlusLg, BsBrowserChrome } from 'react-icons/bs';
import DmsChat from './DmsChat';
import RoomsChat from './Channels/RoomsChat';
import ModalBodyUi from '../../components/ModalBodyUi';
import { UserType } from '../../Types/User';
import ModalSendMessage from '../../components/ModalSendMessage';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Channel } from '../../Types/Channel';
import ChannelDisplay from './Channels/ChannelDisplay';
import { Link } from 'react-router-dom';

export interface SentData {
    message: string;
    to: string;
}
export interface CreateChannelData {
    room: string;
    type: string;
    password?: string;
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
    const [userDm, setUserDm] = React.useState<UserType>();
    const [channelDm, setChannelDm] = React.useState<Channel>();
    const [updateUser, setUpdateUser] = React.useState(false);
    const [updateClass, setUpdateClass] = useState<number>();
    const [updateRoomClass, setUpdateRoomClass] = useState<number>();

    const handleRenderActions = () => {
        setRenderActions(!renderActions);
    };
    const handleRadioChange = (event: any) => {
        setSelectedOption(event.target.value);
        setShowField(event.target.value === 'protected');
        // console.log('RADIOOOOOOO CHAAAANGE', event.target.value);
    };

    const { register, handleSubmit } = useForm<SentData>();
    const handleSendMessage: SubmitHandler<SentData> = (data) => {
        // console.log('FORMDATA', data);
    };

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
                            dms={props.dms}
                            setDms={props.setDms}
                            setFirstLoad={setFirstLoad}
                            isDm={true}
                        />
                        <button className="newChannel" onClick={onOpen}>
                            <BsPlusLg
                                size={'2rem'}
                                style={{ marginLeft: '1.2rem' }}
                                title="Create New Message"
                            />
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
                        props.dms.length > 0 ? (
                            props.dms?.map((dm: UserType) => {
                                return dm ? (
                                    <Link to={`/chat/rooms-dms/${dm?.id}`}>
                                        <MessageUser
                                            profile={dm?.avatar}
                                            name={dm?.username}
                                            dm={dm}
                                            setUserDm={setUserDm}
                                            setFirstLoad={setFirstLoad}
                                            message={dm?.status}
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
                                    </Link>
                                ) : (
                                    <></>
                                );
                            })
                        ) : (
                            <div className="noDms">No messages</div>
                        )
                    ) : (
                        <></>
                    )}
                    {/* {console.log('USERDM', userDm)} */}
                </>
            ),
            rightSide: (
                <>
                    <DmsChat
                        userDm={userDm}
                        render={props.render}
                        setRender={props.setRender}
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
                        <Search
                            name="tabDesign"
                            isDm={false}
                            setName={setName}
                            filter={name}
                            dms={props.roomDms}
                            setDms={props.setRoomDms}
                            setFirstLoad={setFirstLoad}
                        />

                        <button className="newChannel" onClick={onOpen}>
                            <BsPlusLg
                                size={'2rem'}
                                style={{ marginLeft: '1rem' }}
                                title="Add new Channel"
                            />
                        </button>
                        <button className="newChannel">
                            <Link to="/chat/browse-channels">
                                <BsBrowserChrome
                                    size={'2rem'}
                                    style={{ marginLeft: '1rem' }}
                                    title="Explore Channels"
                                />
                            </Link>
                        </button>
                        <ModalUi
                            isOpen={isOpen}
                            onOpen={onOpen}
                            onClose={onClose}
                            title={'Add new Channel'}
                            body={
                                <ModalBodyUi
                                    formRef={formRef}
                                    selectedOption={selectedOption}
                                    handleRadioChange={handleRadioChange}
                                    showField={showField}
                                    onClose={onClose}
                                    render={props.render}
                                    setRender={props.setRender}
                                    update={props.update}
                                    setUpdate={props.setUpdate}
                                />
                            }
                        />
                    </Flex>
                    {props.roomDms ? (
                        props.roomDms.length > 0 ? (
                            props.roomDms?.map((room: Channel) => {
                                // console.log('Room looop', room);
                                return (
                                    <ChannelDisplay
                                        profile={room.avatar}
                                        type={room.type}
                                        name={room.name}
                                        setChannelDm={setChannelDm}
                                        channelDm={channelDm}
                                        roomDm={room}
                                        id={room.id}
                                        updateRoomClas={updateRoomClass}
                                        setUpdateRoomClass={setUpdateRoomClass}
                                        activeCard={
                                            updateRoomClass === room?.id
                                                ? 'clickedDm'
                                                : ''
                                        }
                                    />
                                );
                            })
                        ) : (
                            <div className="noDms">No Channels</div>
                        )
                    ) : (
                        <></>
                    )}
                </>
            ),
            rightSide: (
                <>
                    <RoomsChat
                        handleRenderActions={handleRenderActions}
                        channelDm={channelDm}
                        render={props.render}
                        setRender={props.setRender}
                        update={props.update}
                        setUpdate={props.setUpdate}
                    />
                </>
            )
        }
    ];

    const handleTabClick = (e: any) => {
        setCurrentTab(e.target.id);
        setFirstLoad(e.target.tabTitle);
    };
    return (
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
    );
};

export default Dms;
