import React, { useEffect, useState } from "react";
import "../../css/chat/Right.css"
import { SocketContext } from "../../socket";
import { set } from "react-hook-form";

const TypingBar = (props: any) => {
    const [message, setMessage] = useState('');
    const socket = React.useContext(SocketContext);
    const sendMessageHandler = (e : any) => {
        e.preventDefault();
        console.log("message sent");
        socket.emit('privateMessage', {
            message: message,
            to: props.userDm.username
        });
        setMessage('');
        props.setRender(!props.render);
    };
    useEffect(() => {
        socket.on('privateMessage', (data : any) => {
            console.log("MESSAGE DATA", data);
            // setMessage(data.message);
            // from: data.from;
    
        });
    }, [message]);
    // console.log(socket);

    return (
        <form className="typing-bar" onSubmit={sendMessageHandler}>
            <input type="text" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)}/>
            <button type="submit" className="excludeSubmit">
                <i className="fas fa-paper-plane"></i>
            </button>
        </form>
    );
}

export default TypingBar;