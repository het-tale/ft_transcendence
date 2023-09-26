import React from "react";
import NavbarSearch from "../../components/NavbarSearch";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "../../components/Sidebar";
import LeftSide from "../Chat/LeftSide";
import RightSide from "../Chat/RightSide";
import UserInfo from "./UserInfo";
import Friends from "./Friends";
import Statistics from "./Statistics";
import MatchHistory from "./MatchHistory";

const Profile = () => {
    const [currentTab, setCurrentTab] = React.useState('1');
    const tabs = [
        {
            id: 1,
            tabTitle: 'Friends',
            content: <><Friends /></>,
            rightSide: <>Hello Friends</>
        },
        {
            id: 2,
            tabTitle: 'Stats',
            content: <><Statistics /></>,
            rightSide: <>Hello Stats</>
        },
        {
            id: 3,
            tabTitle: 'Match History',
            content: <><MatchHistory /></>,
            rightSide: <>Hello Match History</>
        }
    ];
    const handleTabClick = (e :any) => {
        setCurrentTab(e.target.id);
    }
    return (
        <div>
             <NavbarSearch />
            <Flex>
                <Sidebar />
                <Box w="100%" bg="#E9ECEF">
                    <Flex justify="space-between">
                        <UserInfo/>
                        <div className="delimiter"></div>
                        <LeftSide handleTabClick={handleTabClick} tabs={tabs} currentTab={currentTab}/>
                    </Flex>
                </Box>
            </Flex>
        </div>
    );
};

export default Profile;