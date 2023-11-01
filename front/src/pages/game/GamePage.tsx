import React, { useEffect } from 'react';
import Game from './Game';
import { SocketGameContext } from '../../socket';

const GamePage = () => {
    const token = localStorage.getItem('token');
    const socketGame = React.useContext(SocketGameContext);
    useEffect(() => {
        socketGame.auth = { token: token };
        socketGame.connect();
    }, []);
    return <Game />;
};

export default GamePage;
