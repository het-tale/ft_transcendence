import { Tabs, TabList, TabPanels, Tab, TabPanel, Flex, Spacer, Box, Center, Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react'
import '../../css/chat/left.css'
import MessageUser from './MessageUser';
import { BsThreeDots, BsPersonCircle, BsPersonFillSlash, BsTrash, BsController } from "react-icons/bs";
import MessageContent from './MessageContent';
import TypingBar from './TypingBar';
const RightSide = (props: any) => {
    return (
        <div className='container'>
            {props.tabs.map((tab: any, i: any) =>
                  <div key={i}>
                      {props.currentTab === `${tab.id}` && <div>{tab.rightSide}</div>}
                  </div>
              )}
        </div>
    )
}

export default RightSide;