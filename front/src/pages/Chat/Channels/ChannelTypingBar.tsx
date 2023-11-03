import React, { useState } from 'react';
import '../../../css/chat/Right.css';
import { SocketContext } from '../../../socket';
import { Channel } from '../../../Types/Channel';
import { UserType } from '../../../Types/User';

export interface ChannelTypingBarProps {
    ChannelDm?: Channel;
    render: boolean;
    setRender: React.Dispatch<React.SetStateAction<boolean>>;
    user: UserType | undefined;
}

const ChannelTypingBar = (props: ChannelTypingBarProps) => {
    const [message, setMessage] = useState('');
    const socket = React.useContext(SocketContext);

    const sendRoomMessageHandler = (e: any) => {
        e.preventDefault();
        socket.emit('sendRoomMessage', {
            message: message.trim(),
            room: props.ChannelDm?.name,
            date: new Date(),
            sender: props.user?.username
        });
        setMessage('');
        props.setRender(!props.render);
    };
    return (
        <form className="typing-bar" onSubmit={sendRoomMessageHandler}>
            <input
                type="text"
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="excludeSubmit">
                <i className="fas fa-paper-plane"></i>
            </button>
        </form>
    );
};

export default ChannelTypingBar;
