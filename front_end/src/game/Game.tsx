
import React, { useEffect, useRef, useState } from 'react'; // Clear the canvas
import { io } from 'socket.io-client';
import {throttle } from 'lodash';
import { ListenOnSocket } from './Game.lisners';
import {GameData, Paddle, Ball} from '../../Game.types';


export type MySocket = ReturnType<typeof io>;

function updateDivPosition(divElement: HTMLDivElement | null, position: Paddle | Ball, containerWidth: number, containerHeight: number) {
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
			effect(...args)
		}
	}, []);
}

const Game: React.FC = () => {
		let listning = false;
		const [playerScore, setPlayerScore] = useState(0);
		const [otherScore, setOtherScore] = useState(0);
		const [rounds, setRounds] = useState(5);
		const [id , setId] = useState<number | null>(null); // [id, setId
		const [padd, setPadd] = useState<Paddle | null>(null);
		const [ball, setBall] = useState<Ball | null>(null);
		const[otherpad, setOtherpad] = useState<Paddle | null>(null);
		const [socket, setSocket] = useState<MySocket | null>(null);
		const [Dimensions, setDimention] = useState({ width: 0, height: 0 });
		const [init, setInit] = useState(false);
		const divRefs = {
			gameContainer: useRef<HTMLDivElement>(null),
			playerPaddle: useRef<HTMLDivElement>(null),
			otherPaddle: useRef<HTMLDivElement>(null),
			ball: useRef<HTMLDivElement>(null),
			};
	
	const setupSocket = () => {
	console.log('connecting');
	setSocket(io('http://localhost:3001', {
		withCredentials: true,
		forceNew: true,
		timeout: 100000,
		transports: ['websocket'],
	}));
	};

useEffect(() => {
	// console.log('useEffect callsed ');
	if (socket && !init)
		socket.on('InitGame', (game: GameData) => {
			setInit(true);
			setBall(game.ball);
			setPadd(game.playerpad);
			setOtherpad(game.otherpad);
			setId(game.id);
			if(game.playerScore) setPlayerScore(game.playerScore);
			if(game.otherScore) setOtherScore(game.otherScore);
			if(game.rounds) setRounds(game.rounds);
			if (game.containerWidth && game.containerHeight) setDimention({ width: game.containerWidth, height: game.containerHeight});
		});
	}, [init, socket]);

const handleMouseMove = (event: MouseEvent) => {
	if (socket && padd && divRefs.gameContainer.current) {
		const gameContainerRect = divRefs.gameContainer.current.getBoundingClientRect();
		// Get the mouse position relative to dimentions withe border protected 
		const mouseYRelative = Math.min(Math.max( (event.clientY - gameContainerRect.top) - padd.height, 0), gameContainerRect.height); 
		const relativeMouseY = (mouseYRelative / gameContainerRect.height) * 100;
		socket.emit('UpdatePlayerPaddle', { relativeMouseY: relativeMouseY });
	}
	};

	const throttleHandleMouseMove = throttle(
		(event: MouseEvent) => {
			handleMouseMove(event);
		},
		16
	  );

	const setupEventListeners = () => {
		if (divRefs.gameContainer.current) {
			divRefs.gameContainer.current.addEventListener('mousemove', throttleHandleMouseMove);
		}
	};

useEffectOnce(() => {
	setupSocket();
	return () => {
		if (socket) socket.disconnect(); // Remove the canvas
	}
});

useEffect(() => {
	if (init) setupEventListeners();
	if (!listning && socket){
		listning = true;
		ListenOnSocket(socket, setPadd, setBall, setOtherpad, setPlayerScore, setOtherScore, setRounds);
	}
}, [init]);

useEffect(() => {
	if (padd && Dimensions.width > 0 && Dimensions.height > 0)
		updateDivPosition(divRefs.playerPaddle.current, padd, Dimensions.width, Dimensions.height);
}, [padd]);

useEffect(() => {
	if (ball && Dimensions.width > 0 && Dimensions.height > 0)
		updateDivPosition(divRefs.ball.current, ball, Dimensions.width, Dimensions.height);
}, [ball]);

useEffect(() => {
	if (otherpad && Dimensions.width > 0 && Dimensions.height > 0)
		updateDivPosition(divRefs.otherPaddle.current, otherpad, Dimensions.width, Dimensions.height);
}, [otherpad]);

return (
	<div className="container">
		<div className="container-profile">
			{id === 1 ? ( // Check if id is equal to 1
				<>
					<div className="player-profile">
						<img src="./cat.jpg" alt="Player Profile" />
						<div className="player-score">{playerScore}</div>
					</div>
					<div className="other-profile">
						<div className="other-score">{otherScore}</div>
						<img src="./cat1.jpg" alt="Other Profile" />
					</div>
				</>
			) : (
				<>
					<div className="player-profile">
						<img src="./cat1.jpg" alt="Player Profile" />
						<div className="player-score">{playerScore}</div>
					</div>
					<div className="other-profile">
						<div className="other-score">{otherScore}</div>
						<img src="./cat.jpg" alt="Other Profile" />
					</div>
				</>
			)}
		</div>
		<div className="game-container" ref={divRefs.gameContainer}>
			<div ref={divRefs.playerPaddle} className="paddle player-paddle"></div>
			<div ref={divRefs.otherPaddle} className="paddle other-paddle"></div>
			<div ref={divRefs.ball} className="ball"></div>
		</div>
	</div>
	);
	
};

export default Game;
