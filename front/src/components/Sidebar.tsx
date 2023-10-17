import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BsBellFill,
    BsHouseFill,
    BsController,
    BsChatRightFill,
    BsPersonFill
} from 'react-icons/bs';
import { UserType } from '../Types/User';
import User from './User';
import { Button, Image, useToast } from '@chakra-ui/react';
import { Notification } from '../Types/Notification';
import { RenderContext, RenderContextType } from '../RenderContext';

interface sidebarProps {
    notification?: boolean;
    setNotification?: React.Dispatch<React.SetStateAction<boolean>>;
    notifArray?: Notification[];
    isOpen?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
}

const Sidebar = (props: sidebarProps) => {
    const [user, setUser] = React.useState<UserType>();
    const renderData: RenderContextType = React.useContext(RenderContext);
    useEffect(() => {
        async function fetchUserData() {
            const userData = await User();
            setUser(userData);
        }

        fetchUserData();
    }, []);

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
                onClick={props.onOpen}
            >
                <BsBellFill
                    className="fa"
                    size={20}
                    style={{ marginRight: '15px' }}
                />
                Notifications
            </Button>
            <Link to={`/game/`}>
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
