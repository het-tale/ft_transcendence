import React from "react";
import "../../css/chat/Right.css"


interface MessageContentProps {
    name: string;
    message: string;
  }

const MessageContent = ({name, message} : MessageContentProps) => {
    let parent = (name === "sender") ? "parent" : "";

    return (
        <div className={`${parent}`} key={message}>
            <div className={`${name}`}>{message}</div>
        </div>
    );
}

export default MessageContent;