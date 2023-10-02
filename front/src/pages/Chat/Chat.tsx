import React from 'react';
import Dms from './Dms';
import { SocketContext, socket } from '../../socket';

export default function Chat() {
    console.log('socketa', socket);
    return (
        <>
            {/* <SocketContext.Provider value={socket}> */}
            <Dms />
            {/* </SocketContext.Provider> */}
        </>
    );
}
