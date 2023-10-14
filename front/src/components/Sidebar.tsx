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
import { Button, Image, useToast } from '@chakra-ui/react';
import { SocketContext } from '../socket';
import { Notification } from '../Types/Notification';

interface sidebarProps {
    notification?: boolean;
    setNotification?: React.Dispatch<React.SetStateAction<boolean>>;
    notifArray?: Notification[];
}

const Sidebar = (props: sidebarProps) => {
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
        const timer = setTimeout(() => {
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
                props.notifArray?.push({ from: data.from, type: data.room });
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

            socket.on('roomJoined', (data: any) => {
                console.log('roomJoined', data);
                toast({
                    title: 'succes',
                    description: data,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
            });

            socket.on('roomInvitationDeclined', (data: any) => {
                console.log('roomDeclined', data);
                toast({
                    title: 'Error',
                    description: data,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                    position: 'bottom-right'
                });
            });
        }, 500);

        return () => {
            socket.off('roomInvitation');
            socket.off('roomInvitationError');
            socket.off('roomJoined');
            socket.off('roomInvitationDeclined');
            clearTimeout(timer);
        };
    }, [socket]);

    return (
        <aside>
            <Link to="/home">
                <BsHouseFill className="fa" />
                Home
            </Link>
            <Link to={`/chat/rooms-dms/${user?.id}`}>
                <BsChatRightFill className="fa" />
                Chat
            </Link>
            <Button
                style={{
                    backgroundColor: 'transparent',
                    color: 'white',
                    fontWeight: 'unset',
                    fontFamily: 'unset',
                    fontSize: '13px',
                    marginLeft: '2px'
                }}
                onClick={() =>
                    props.setNotification &&
                    props.setNotification(!props.notification)
                }
            >
                <BsBellFill
                    className="fa"
                    size={20}
                    style={{ marginRight: '15px' }}
                />
                Notifications
            </Button>
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
        </aside>
    );
};
export default Sidebar;
