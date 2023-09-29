import { color } from "framer-motion";
import NavbarSearch from "../../components/NavbarSearch";
import Sidebar from "../../components/Sidebar";
import LeftSide from "./LeftSide";
import { Box, Flex, Grid, GridItem, IconButton, Menu, MenuButton, MenuItem, MenuList, SimpleGrid, Spacer, background, useDisclosure } from '@chakra-ui/react'
import RightSide from "./RightSide";
import React, { useEffect } from "react";
import Search from "../../components/Search";
import MessageUser from "./MessageUser";
import ModalUi from "../../components/ModalUi";
import { BsController, BsPersonCircle, BsPersonFillSlash, BsThreeDots, BsTrash } from "react-icons/bs";
import MessageContent from "./MessageContent";
import TypingBar from "./TypingBar";
import DmsChat from "./DmsChat";
import RoomsChat from "./RoomsChat";
import ModalBodyUi from "../../components/ModalBodyUi";
import { UserType } from "../../Types/User";
import GetDms from "./GetDms";


const Dms = () => {
    const [currentTab, setCurrentTab] = React.useState('1');
    const [firstLoad, setFirstLoad] = React.useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [renderActions, setRenderActions] = React.useState(false);
  const formRef = React.useRef(null);
  const [selectedOption, setSelectedOption] = React.useState('');
    const [showField, setShowField] = React.useState(false);
  const [name, setName] = React.useState("");
  const [dms, setDms] = React.useState<UserType[]>([]);
  const [userDm, setUserDm] = React.useState<UserType>();
  const [id, setId] = React.useState(0);
  useEffect(() => {
   GetDms().then((data) => {
        setDms(data);
    })
  }, []);
  const handleRenderActions = () => {
        setRenderActions(!renderActions);
  }
  const handleRadioChange = (event : any) => {
    setSelectedOption(event.target.value);
    setShowField(event.target.value === 'protected');
    console.log(event.target.value);
  };

  const handleSubmit = () => {
    const data = new FormData(formRef.current ?? undefined);
    const formData = {
      name: data.get('name'),
      avatar: data.get('avatar'),
      type: data.get('group1'),
      password: data.get('password'),
    };
    console.log(formData);
  };
  const tabs = [
      {
          id: 1,
          tabTitle: 'Direct Messages',
          content: <>
          <Search name="tabDesign" setName={setName} filter={name}/>
          {dms?.map((dm) => {
              return <MessageUser profile={dm.avatar} name={dm.username} message="last message" dm={dm} setUserDm={setUserDm}/>
          })
          }
          {/* <MessageUser profile='/assets/het-tale.jpg' name="Hasnaa" message="hello" /> */}
          </>,
          rightSide: <><DmsChat userDm={userDm}/></>
      },
      {
          id: 2,
          tabTitle: 'Channels',
          content: <>
          <Flex justify={'space-between'}>
          <Search name="tabDesign"/>
          
            <button className='newChannel' onClick={onOpen}>New</button>
            <ModalUi isOpen={isOpen} onOpen={onOpen} onClose={onClose} title={'Add new Channel'} handleSubmit={handleSubmit}
             body={<ModalBodyUi formRef={formRef} selectedOption={selectedOption} handleRadioChange={handleRadioChange} showField={showField}/>}/>
          </Flex>
          </>,
          rightSide: <><RoomsChat handleRenderActions={handleRenderActions}/></>
      }
  ];

  const handleTabClick = (e :any) => {
      setCurrentTab(e.target.id);
      setFirstLoad(e.target.tabTitle);
  }
    return (
        <div>
            <NavbarSearch />
            <Flex>
                <Sidebar />
                <Box w="100%" bg="#E9ECEF">
                    <Flex justify="space-between">
                        <LeftSide handleTabClick={handleTabClick} tabs={tabs} currentTab={currentTab}/>
                        <div className="delimiter"></div>
                        <RightSide handleTabClick={handleTabClick} tabs={tabs} currentTab={currentTab} firstLoad={firstLoad} renderActions={renderActions}/>
                    </Flex>
                </Box>
            </Flex>
        </div>
    )
}

export default Dms;