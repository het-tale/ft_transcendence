import React, { useState } from "react";
import "../../css/chat/Right.css"
import { SocketContext } from "../../socket";

const TypingBar = (props: any) => {
    const [message, setMessage] = useState('');
    const socket = React.useContext(SocketContext);
    const sendMessageHandler = (e : any) => {
        e.preventDefault();
        console.log("message sent");
        socket.emit('privateMessage', {
            message: "hello",
            to: "mokhames"
        });
    };
    socket.on('privateMessage', (data: any) => {
        console.log(data);
    });
    // console.log(socket);

    return (
        <form className="typing-bar" onSubmit={sendMessageHandler}>
            <input type="text" placeholder="Message" />
            <button type="submit">
                <i className="fas fa-paper-plane"></i>
            </button>
        </form>
    );
}

export default TypingBar;