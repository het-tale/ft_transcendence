import React, { useEffect, useState } from 'react';
import '../../css/chat/Right.css';
import { SocketContext } from '../../socket';
import { set } from 'react-hook-form';
import { useToast } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import { io } from 'socket.io-client';

const TypingBar = (props: any) => {
    const [message, setMessage] = useState('');
    const socket = React.useContext(SocketContext);
    const toast = useToast();
    const sendMessageHandler = (e: any) => {
        e.preventDefault();
        console.log('message sent');
        socket.emit('privateMessage', {
            message: message,
            to: props.userDm.id
        });
        setMessage('');
        props.setRender(!props.render);
    };
    useEffect(() => {
        socket.on('privateMessage', (data: any) => {
            console.log('MESSAGE DATA', data);
            // props.setRender(!props.render);
            // setMessage(data.message);
            // from: data.from;
        });
    }, [message]);
    return (
        <form className="typing-bar" onSubmit={sendMessageHandler}>
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

export default TypingBar;
