import React from 'react';
import '../../css/chat/Right.css';
import { Image } from '@chakra-ui/react';
import { UserType } from '../../Types/User';
import UserId from './GetUserById';

interface MessageContentProps {
    name: string;
    message: string;
    room: boolean;
    userSendId?: number;
}

const MessageContent = ({
    name,
    message,
    room,
    userSendId
}: MessageContentProps) => {
    let parent = name === 'sender' ? 'parentSender' : 'parentReceiver';
    let recvRoom = name === 'receiver' && room ? 'recvRoom' : '';
    const [sender, setSender] = React.useState<UserType>();
    // console.log('message', message);
    // console.log('userSendId', userSendId);
    React.useEffect(() => {
        async function fetchUserData() {
            const userData = await UserId(Number(userSendId));
            setSender(userData);
        }

        fetchUserData();
    }, []);
    return (
        <div className={`${parent}`} key={message}>
            <div className={`${name} ${recvRoom}`}>{message}</div>
            <div>
                {room && (
                    <Image
                        objectFit="cover"
                        width={'30px'}
                        height={'30px'}
                        marginTop={'18px'}
                        marginLeft={2}
                        src={sender?.avatar}
                        alt="profile"
                        borderRadius={'30px'}
                    />
                )}
            </div>
        </div>
    );
};

export default MessageContent;
