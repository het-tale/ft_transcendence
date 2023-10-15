import React, { useEffect, useRef, useState } from 'react'; // Clear the canvas
import { io } from 'socket.io-client';
import { throttle } from 'lodash';
import { Paddle, Ball } from './Game.types';
import { Image } from '@chakra-ui/react';
import '../../css/game/game.css';
import User from '../../components/User';
import { UserType } from '../../Types/User';
import { ListenOnSocket } from './Game.lisners';


export type MySocket = ReturnType<typeof io>;

function updateDivPosition(
    divElement: HTMLDivElement | null,
    position: Paddle | Ball,
    containerWidth: number,
    containerHeight: number
) {
    if (divElement) {
        const leftPercentage = (position.x / containerWidth) * 100;
        const topPercentage = (position.y / containerHeight) * 100;

        divElement.style.left = `${leftPercentage}%`;
        divElement.style.top = `${topPercentage}%`;
    }
}

function useEffectOnce(effect: React.EffectCallback) {
    const ref = useRef(false);
    useEffect((...args) => {
        if (ref.current === false) {
            ref.current = true;
            effect(...args);
        }
    }, []);
}

const Game: React.FC = () => {
    const token: string = localStorage.getItem('token') as string;
    const [user, setUser] = useState<UserType | null>(null);
    const [otherAvatar, setOtherAvatar] = useState<string | null>(null);
    const [otherUsername, setOtherUsername] = useState<string | null>(null);
    let listning = false;
    const [playerScore, setPlayerScore] = useState(0);
    const [otherScore, setOtherScore] = useState(0);
    const [id, setId] = useState<number | null>(null);
    const [padd, setPadd] = useState<Paddle | null>(null);
    const [ball, setBall] = useState<Ball | null>(null);
    const [otherpad, setOtherpad] = useState<Paddle | null>(null);
    const [socket, setSocket] = useState<MySocket | null>(null);
    const [Dimensions, setDimention] = useState({ width: 0, height: 0 });
    const [init, setInit] = useState(false);
    const divRefs = {
        gameContainer: useRef<HTMLDivElement>(null),
        playerPaddle: useRef<HTMLDivElement>(null),
        otherPaddle: useRef<HTMLDivElement>(null),
        ball: useRef<HTMLDivElement>(null)
    };
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const response = await User();
            setUser(response);
        };
        fetchUser();
    }, []);

    const setupSocket = () => {
        setSocket(
            io(`${process.env.REACT_APP_BACKEND_URL}/game`, {
                withCredentials: true,
                forceNew: true,
                timeout: 100000,
                transports: ['websocket'],
                query: { token: token }
            })
        );
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (socket && padd && divRefs.gameContainer.current) {
            const gameContainerRect =
                divRefs.gameContainer.current.getBoundingClientRect();
            // Get the mouse position relative to dimentions withe border protected
            const mouseYRelative = Math.min(
                Math.max(
                    event.clientY - gameContainerRect.top - padd.height,
                    0
                ),
                gameContainerRect.height
            );
            const relativeMouseY =
                (mouseYRelative / gameContainerRect.height) * 100;
            socket.emit('UpdatePlayerPaddle', {
                relativeMouseY: relativeMouseY
            });
        }
    };

    const throttleHandleMouseMove = throttle((event: MouseEvent) => {
        handleMouseMove(event);
    }, 16.66);

    const setupEventListeners = () => {
        if (divRefs.gameContainer.current) {
            divRefs.gameContainer.current.addEventListener(
                'mousemove',
                throttleHandleMouseMove
            );
        }
    };

    useEffectOnce(() => {
        setupSocket();
        return () => {
            if (socket) {
                socket.off('InitGame');
                socket.off('UPDATE');
                socket.off('UPDATE SCORE');
                socket.off('GAME OVER');
                socket.off('OTHER AVATAR');
                socket.off('JoinRoom');
                socket.off('StartGame');
                socket.off('connect');
                socket.off('error');
                socket.off('connected');
                socket.disconnect();
                console.log('socket disconnected');
            }
            if (divRefs.gameContainer.current) {
                divRefs.gameContainer.current.removeEventListener(
                    'mousemove',
                    throttleHandleMouseMove
                );
            }
        };
    });

    useEffect(() => {
        if (init) setupEventListeners();
    }, [init]);

    useEffect(() => {
        if (socket && !listning) {
            ListenOnSocket(
                socket,
                setPadd,
                setBall,
                setOtherpad,
                setPlayerScore,
                setOtherScore,
                setOtherAvatar,
                setGameOver,
                setId,
                setDimention,
                setInit,
                setOtherUsername
            );
            listning = true;
        }
    }, [socket]);

    const handleHomeNavigation = () => {
        window.location.href = '/home';
        socket?.disconnect();
    };

    const handleStartGame = () => {
        socket?.emit('StartGame');
        setGameStarted(true);
    };
    const handleStartGamerobot = () => {
        socket?.emit('StartGameRobot');
        setGameStarted(true);
    };

    useEffect(() => {
        if (padd && Dimensions.width > 0 && Dimensions.height > 0)
            updateDivPosition(
                divRefs.playerPaddle.current,
                padd,
                Dimensions.width,
                Dimensions.height
            );
    }, [padd]);

    useEffect(() => {
        if (ball && Dimensions.width > 0 && Dimensions.height > 0)
            updateDivPosition(
                divRefs.ball.current,
                ball,
                Dimensions.width,
                Dimensions.height
            );
    }, [ball]);

    useEffect(() => {
        if (otherpad && Dimensions.width > 0 && Dimensions.height > 0)
            updateDivPosition(
                divRefs.otherPaddle.current,
                otherpad,
                Dimensions.width,
                Dimensions.height
            );
    }, [otherpad]);

    return (
        <div className="containerGame">
            {gameOver ? (
                <div className="overlay">
                    <div className="game-over-container">
                        <div className="game-over">
                            <p className="paraInfo">Game Over</p>
                            <p className="paraInfo">
                                {playerScore > otherScore
                                    ? 'you won'
                                    : 'you lost'}
                            </p>
                        </div>
                        <button
                            className="home-button"
                            onClick={handleHomeNavigation}
                        >
                            Go to Home
                        </button>
                    </div>
                </div>
            ) : null}
            <div className="container-profile">
                {id === 1 ? (
                    <>
                        <div className="player-profile">
                            <img
                                src={
                                    otherAvatar
                                        ? otherAvatar
                                        : '/assets/circles-menu-1.gif'
                                }
                                alt="Other Profile"
                            />
                            <div className="player-username">
                                {otherUsername
                                    ? otherUsername
                                    : ' waiting ... '}
                            <div className="player-score">{otherScore}</div>
                            </div>
                        </div>
                        <div className="vs-image">
                            <img src="/assets/versus.png" alt="VS" />
                        </div>
                        <div className="player-profile">
                            <div className="player-username">
                                {user?.username}
                            <div className="player-score">{playerScore}</div>
                            </div>
                            <img src={user?.avatar} alt="Player Profile" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="player-profile">
                            <img src={user?.avatar} alt="Player Profile" />
                            <div className="player-username">
                                {user?.username}
                            <div className="player-score">{playerScore}</div>
                            </div>
                        </div>
                        <div className="vs-image">
                            <img src="/assets/versus.png" alt="VS" />
                        </div>
                        <div className="player-profile">
                            <div className="player-username">
                                {otherUsername
                                    ? otherUsername
                                    : ' waiting ... '}
                            <div className="player-score">{otherScore}</div>
                            </div>
                                    <img
                                        src={
                                            otherAvatar
                                                ? otherAvatar
                                                : '/assets/circles-menu-1.gif'
                                        }
                                        alt="Other Profile"
                                    />
                        </div>
                    </>
                )}
            </div>
            {!gameStarted ? (
                <>
                    <button
                        className="start-button"
                        id="firstButton"
                        onClick={handleStartGame}
                    >
                        Start Game
                    </button>
                    <button
                        className="start-button"
                        onClick={handleStartGamerobot}
                    >
                        Start Game with robot
                    </button>
                </>
            ) : (
                <div className="game-container" ref={divRefs.gameContainer}>
                    <div
                        ref={divRefs.playerPaddle}
                        className="paddle player-paddle"
                    ></div>
                    <div
                        ref={divRefs.otherPaddle}
                        className="paddle other-paddle"
                    ></div>
                    <div ref={divRefs.ball} className="ball"></div>
                </div>
            )}
        </div>
    );
};

export default Game;