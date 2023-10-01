import React, { useEffect, useState } from 'react';
import '../../css/chat/Right.css';
import { SocketContext } from '../../socket';
import { set } from 'react-hook-form';
import { useToast } from '@chakra-ui/react';
import { render } from '@testing-library/react';

const NotifDm = (props: any) => {
    const toast = useToast();
    const socket = React.useContext(SocketContext);
    useEffect(() => {
        const timer = setTimeout(() => {
            socket.on('privateMessage', (data: any) => {
                // props.setRender(!props.render);
                console.log('MESSAGE DATA', data);
                toast({
                    title: data.from,
                    description: data.message,
                    status: 'info',
                    duration: 9000,
                    isClosable: true,
                    position: 'top-right'
                });
            });
        }, 500);
        return () => {
            clearTimeout(timer);
        };
    }, [props.render]);
    return <></>;
};
export default NotifDm;
