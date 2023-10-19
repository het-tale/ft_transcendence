import React, { useContext, useEffect } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import LeftSide from '../Chat/LeftSide';
import UserInfo from './UserInfo';
import Friends from './Friends';
import Statistics from './Statistics';
import MatchHistory from './MatchHistory';
import { UserType } from '../../Types/User';
import UserId from '../Chat/GetUserById';
import { useLocation } from 'react-router-dom';
import User from '../../components/User';
import { GetFriendsList } from './GetFriendsList';
import { GetMutualFriendsList } from './GetMutualFriendsList';
import { RenderContext } from '../../RenderContext';

const Profile = () => {
    const [currentTab, setCurrentTab] = React.useState('1');
    const [user, setUser] = React.useState<UserType>();
    const [currentUser, setCurrentUser] = React.useState<UserType>();
    const [update, setUpdate] = React.useState(false);
    const [friends, setFriends] = React.useState<UserType[]>([]);
    const [mutualFriends, setMutualFriends] = React.useState<UserType[]>([]);
    const renderData = useContext(RenderContext);
    const location = useLocation();
    const id = location.pathname.split('/')[2];
    React.useEffect(() => {
        async function fetchUserData() {
            const userData = await UserId(Number(id));
            const currentUserData = await User();
            setUser(userData);
            setCurrentUser(currentUserData);
        }

        fetchUserData();
    }, [update, renderData.renderData]);
    useEffect(() => {
        GetFriendsList().then((data) => {
            setFriends(data);
        });
        GetMutualFriendsList(user?.username).then((data) => {
            setMutualFriends(data);
        });
    }, [renderData.renderData]);
    const isMyProfile = Number(id) === currentUser?.id;
    const tabs = [
        {
            id: 1,
            tabTitle: isMyProfile ? 'Friends' : 'Mutual Friends',
            content: (
                <>
                    {isMyProfile ? (
                        <Friends
                            friend={true}
                            update={update}
                            setUpdate={setUpdate}
                            user={user}
                            friends={friends}
                            renderData={renderData}
                        />
                    ) : (
                        <Friends
                            friend={false}
                            user={user}
                            friends={mutualFriends}
                            renderData={renderData}
                        />
                    )}
                </>
            ),
            rightSide: <>Hello Friends</>
        },
        {
            id: 2,
            tabTitle: 'Stats',
            content: (
                <>
                    <Statistics id={Number(id)} user={user} />
                </>
            ),
            rightSide: <>Hello Stats</>
        },
        {
            id: 3,
            tabTitle: 'Match History',
            content: (
                <>
                    <MatchHistory id={Number(id)} username={user?.username} />
                </>
            ),
            rightSide: <>Hello Match History</>
        }
    ];
    const handleTabClick = (e: any) => {
        setCurrentTab(e.target.id);
        renderData.setRenderData(!renderData.renderData);
    };
    return (
        <div>
            <Box w="89.5vw" bg="#E9ECEF">
                <Flex justify="space-between">
                    <UserInfo
                        user={user}
                        currentUser={currentUser}
                        isMyProfile={isMyProfile}
                        update={update}
                        setUpdate={setUpdate}
                        friends={friends}
                        mutualFriends={mutualFriends}
                    />
                    <div className="delimiter"></div>
                    <LeftSide
                        handleTabClick={handleTabClick}
                        tabs={tabs}
                        currentTab={currentTab}
                    />
                </Flex>
            </Box>
        </div>
    );
};

export default Profile;
