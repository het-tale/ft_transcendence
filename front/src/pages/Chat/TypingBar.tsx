import React, { useEffect, useState } from 'react';
import '../../css/chat/Right.css';
import { SocketContext } from '../../socket';
import { SubmitHandler, set, useForm } from 'react-hook-form';
import { FormControl, FormLabel, Input, useToast } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import { io } from 'socket.io-client';

const TypingBar = (props: any) => {
    const { register, handleSubmit, reset } = useForm<{ message: string }>();
    const [message, setMessage] = useState('');
    const socket = React.useContext(SocketContext);
    console.log('typing socket', socket);
    const toast = useToast();
    const sendMessageHandler: SubmitHandler<{ message: string }> = (data) => {
        console.log('message sent');
        socket.emit('privateMessage', {
            message: data.message,
            to: props.userDm.username
        });
        setMessage('');
        props.setRender(!props.render);
        reset();
    };
    return (
        <form
            className="typing-bar"
            onSubmit={handleSubmit(sendMessageHandler)}
            noValidate
        >
            <FormControl isRequired>
                <input
                    type="text"
                    placeholder="Message"
                    {...register('message', { required: true })}
                    style={{ border: 'none', outline: 'none' }}
                />
            </FormControl>
            <button type="submit" className="excludeSubmit">
                <i className="fas fa-paper-plane"></i>
            </button>
        </form>
    );
};

export default TypingBar;
