import React, { useContext, useState } from 'react';
import '../../css/chat/Right.css';
import { SocketContext } from '../../socket';
import { RenderContext } from '../../RenderContext';

const TypingBar = (props: any) => {
    const [message, setMessage] = useState('');
    const socket = React.useContext(SocketContext);
    const renderData = useContext(RenderContext);
    // console.log('typing socket', socket);

    const sendMessageHandler = (e: any) => {
        e.preventDefault();
        console.log('sending message to ', props.userDm.username);
        // if (props.userDm.username === 'ROBOT')
        // {
        //     socket.emit('privateMessageROBOT', {
        //         message: message,
        //         to: props.userDm.username
        //     })
        // }
        // else {
             socket.emit('privateMessage', {
            message: message,
            to: props.userDm.username
        });
        // }
        setMessage('');
        props.setRender(!props.render);
        // renderData.setRenderData(!renderData.renderData);
    };
    return (
        <form className="typing-bar" onSubmit={sendMessageHandler}>
            <input
                type="text"
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="excludeSubmit" onClick={(e) => sendMessageHandler(e)}>
                <i className="fas fa-paper-plane"></i>
            </button>
        </form>
    );
};

export default TypingBar;
