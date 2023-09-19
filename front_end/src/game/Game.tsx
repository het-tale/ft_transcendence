
import React, { useEffect, useRef, useState } from 'react'; // Clear the canvas
import { io } from 'socket.io-client';
import {throttle } from 'lodash';
import { ListenOnSocket } from './Game.lisners';
import {GameData, Paddle, Ball} from '../../Game.types';
// import p5 from 'p5';
import './Game.css';

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
		if(game.ball) setBall(game.ball);
		if(game.playerpad) setPadd(game.playerpad);
		if(game.otherpad) setOtherpad(game.otherpad);
		if (game.containerWidth && game.containerHeight)
			setDimention({ width: game.containerWidth, height: game.containerHeight});
		});
	}, [init, socket]);

const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
	if (socket && padd && divRefs.gameContainer.current) {
		const gameContainerRect = divRefs.gameContainer.current.getBoundingClientRect();

		const mouseYRelative = event.clientY - gameContainerRect.top;

		// Calculate the position as a percentage of container dimensions
		const relativeMouseY = (mouseYRelative / gameContainerRect.height) * 100;
		// Emit the relative mouse position and container height to the server
		socket.emit('UpdatePlayerPaddle', {
		relativeMouseY: relativeMouseY,
		containerHeight: gameContainerRect.height,
		});
	}
	};

  const throttleHandleMouseMove = throttle(handleMouseMove, 16);

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
		ListenOnSocket(socket, setPadd, setBall, setOtherpad);
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
	<center>
	<div ref={divRefs.gameContainer} className="game-container">
	  <div ref={divRefs.playerPaddle} className="paddle player-paddle"></div>
	  <div ref={divRefs.otherPaddle} className="paddle other-paddle"></div>
	  <div ref={divRefs.ball} className="ball"></div>
	  {/* Add other game elements as <div> elements, i didn't need it but i my */}
	</div>
  </center>
	);
};

export default Game;
