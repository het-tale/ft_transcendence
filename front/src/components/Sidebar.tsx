import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BsBoxArrowLeft,
    BsBellFill,
    BsHouseFill,
    BsController,
    BsChatRightFill,
    BsChatFill,
    BsPersonFill
} from 'react-icons/bs';
import { UserType } from '../Types/User';
import User from './User';
import { Image, useToast } from '@chakra-ui/react';
import NotifDm from '../pages/Chat/NotifDm';
import { SocketContext } from '../socket';
const Sidebar = (props: any) => {
    const [user, setUser] = React.useState<UserType>();
    useEffect(() => {
        async function fetchUserData() {
            const userData = await User();
            setUser(userData);
        }

        fetchUserData();
    }, []);
    const socket = React.useContext(SocketContext);
    const toast = useToast();
    const token = localStorage.getItem('token');
    useEffect(() => {
        socket.auth = { token: token };
        socket.connect();
    }, []);

    socket.on('roomInvitation', (data: any) => {
        console.log('roomInvitation', data);
        toast({
            title: 'success',
            description: data.from,
            status: 'success',
            duration: 9000,
            isClosable: true,
            position: 'bottom-right'
        });
    });
    socket.on('roomInvitationError', (data: any) => {
        console.log('roomInvitationError', data);
        toast({
            title: 'Error',
            description: data,
            status: 'error',
            duration: 9000,
            isClosable: true,
            position: 'bottom-right'
        });
    });
    return (
        <aside>
            <Link to="/home">
                <BsHouseFill className="fa" />
                Home
            </Link>
            <Link to="/chat/rooms-dms">
                <BsChatRightFill className="fa" />
                Chat
            </Link>
            <a href="">
                <BsBellFill className="fa" />
                Notifications
            </a>
            <Link to={'/game'}>
                <BsController className="fa" />
                Play
            </Link>
            <Link to={`/user-profile/${user?.id}`}>
                <BsPersonFill className="fa" />
                Profile
            </Link>
            <Link to="/logout" id="more" style={{ marginTop: '35rem' }}>
                {/* <i className="fa fa-gear fa-lg" aria-hidden="true"></i> */}
                {/* <BsBoxArrowLeft className='fa'/> */}
                <Image
                    src={user?.avatar}
                    objectFit="cover"
                    width={'30px'}
                    height={'30px'}
                    marginTop={'-20px'}
                    marginRight={2}
                    borderRadius={'30px'}
                />
                Log Out
            </Link>
            {/* <NotifDm render={props.render} setRender={props.setRender} /> */}
        </aside>
    );
};
export default Sidebar;
