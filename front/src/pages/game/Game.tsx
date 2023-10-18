import React, { useEffect, useRef, useState } from 'react'; // Clear the canvas
import { io } from 'socket.io-client';
import { throttle } from 'lodash';
import { Paddle, Ball } from './Game.types';
import '../../css/game/game.css';
import User from '../../components/User';
import { UserType } from '../../Types/User';
import { ListenOnSocket } from './Game.lisners';
import { SocketGameContext } from '../../socket';
import { useParams } from 'react-router-dom';
import InviteUsersModal from '../Chat/Channels/InviteUsersModal';

export type MySocket = ReturnType<typeof io>;

function draw(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    padd: React.RefObject<Paddle>,
    otherpad: React.RefObject<Paddle>,
    ball: React.RefObject<Ball>
) {
    console.log('draw', ball.current);
    if (padd.current && otherpad.current && ball.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(235, 182, 145, 1)';
        ctx.fillRect(padd.current.x, padd.current.y, padd.current.width, padd.current.height);
        ctx.fillStyle = 'beige';
        ctx.fillRect(otherpad.current.x, otherpad.current.y, otherpad.current.width, otherpad.current.height);
        ctx.beginPath();
        ctx.fillStyle = 'rgb(170, 251, 57)';
        ctx.arc(ball.current.x, ball.current.y, ball.current.radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
    }
    requestAnimationFrame(() => draw(ctx, canvas, padd, otherpad, ball));
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
    const [init, setInit] = useState(false);
    const divRefs = {
        gameContainer: useRef<HTMLDivElement>(null),
    };
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctx = canvasRef.current?.getContext('2d');
    const socketGame = React.useContext(SocketGameContext);
    const { token } = useParams();
    console.log('token', token);
    const [gameinvite , setGameinvite] = useState(
        token? true : false
    );

    useEffect(() => {
        const fetchUser = async () => {
            const response = await User();
            setUser(response);
        };
        fetchUser();
    }, []);

    const setupSocket = () => {
        setSocket(socketGame);
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (socket && padd && canvasRef.current) {
            const canvasrect = canvasRef.current.getBoundingClientRect();
            // Get the mouse position relative to dimentions withe border protected
            const mouseYRelative = Math.min(
                Math.max(
                    event.clientY - canvasrect.top - padd.height,
                    0
                ),
                canvasrect.height
            );
            const relativeMouseY =
                (mouseYRelative / canvasrect.height) * 100;
            socket.emit('UpdatePlayerPaddle', {
                relativeMouseY: relativeMouseY
            });
        }
    };

    const throttleHandleMouseMove = throttle((event: MouseEvent) => {
        handleMouseMove(event);
    }, 16.66);

    const setupEventListeners = () => {
        canvasRef.current?.addEventListener(
            'mousemove',
            throttleHandleMouseMove
        );
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
                // console.log('socket disconnected');
            }
            canvasRef.current?.removeEventListener(
                    'mousemove',
                    throttleHandleMouseMove
                );
        };
    });

    const intialise = useRef(false);
    let paddRef = useRef<Paddle | null>(null);
    let otherpaddRef = useRef<Paddle | null>(null);
    let ballRef = useRef<Ball | null>(null);
    useEffect(() => {
        paddRef.current = padd;
        otherpaddRef.current = otherpad;
        ballRef.current = ball;
    }, [padd, ball, otherpad]);
    useEffect(() => {
        if (!intialise.current && ctx && canvasRef.current) {
            intialise.current = true;
            draw(ctx, canvasRef.current, paddRef, otherpaddRef, ballRef);
        }
    }, [init]);

    useEffect(() => {
        if (init) setupEventListeners();
        console.log('init', init);
    }, [init]);

    useEffect(() => {
        if (socket && !listning) {
            console.log('listning on socket');
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
                setInit,
                setOtherUsername,
                setGameStarted,
                setGameinvite
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

    return (
        <div className="containerGame">
            <div className="container-profile">
                {id !== 1 ? (
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
                                <div className="player-score">
                                    {playerScore}
                                </div>
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
                                <div className="player-score">
                                    {playerScore}
                                </div>
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
            {gameStarted ? (
                 <div className="game-container" ref={divRefs.gameContainer}>
                    <canvas ref={canvasRef} width={720} height={480} />
                </div>
            ) : (
                <>
                    {gameinvite ? (
                        <div className="game-container">
                        <p>Waiting for other player to join</p>
                    </div>   
                    ) : (
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
                )}
             </>
    )}
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
        </div>
    );
};

export default Game;
