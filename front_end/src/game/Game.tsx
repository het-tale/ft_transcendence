
import React, { useEffect, useRef, useState } from 'react'; // Clear the canvas
import { io } from 'socket.io-client';
import {throttle } from 'lodash';
import { ListenOnSocket } from './Game.lisners';
import {GameData, Paddle, Ball} from '../../Game.types';
// import p5 from 'p5';
import './Game.css';

export type MySocket = ReturnType<typeof io>;

function updateDivPosition(divElement: HTMLDivElement | null, position: Paddle | Ball) {
	if (divElement) {
	  divElement.style.left = `${position.x}px`;
	  divElement.style.top = `${position.y}px`;
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
		const [init, setInit] = useState(false);
		const divRefs = {
		gameContainer: useRef<HTMLDivElement>(null),
		playerPaddle: useRef<HTMLDivElement>(null),
		otherPaddle: useRef<HTMLDivElement>(null),
		ball: useRef<HTMLDivElement>(null),
		};
	
	const setupSocket = () => {
	console.log('connecting');
	setSocket(io('http://10.14.3.6:3001', {
		withCredentials: true,
		forceNew: true,
		timeout: 100000,
		transports: ['websocket']
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
		});
	}, [init, socket]);

const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
	if (socket && padd && divRefs.gameContainer.current) {
	  const gameContainerRect = divRefs.gameContainer.current.getBoundingClientRect();
  
	  // Calculate the relative mouse position within the game container
	  const mouseYRelative = event.clientY - gameContainerRect.top;
  
	  // Emit the relative mouse position and container height to the server
	  socket.emit('UpdatePlayerPaddle', {
		relativeMouseY: mouseYRelative,
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


// const  updateGameElements = () => {
	// if (padd)
	// 	updateDivPosition(divRefs.playerPaddle.current, padd);
	// if (otherpad)
	// 	updateDivPosition(divRefs.otherPaddle.current, otherpad);
	// if(ball)
	// 	updateDivPosition(divRefs.ball.current, ball);	
// };


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
	// updateGameElements();
	if (padd)
		updateDivPosition(divRefs.playerPaddle.current, padd);
}, [padd]);

useEffect(() => {
	// updateGameElements();
	if (ball)
		updateDivPosition(divRefs.ball.current, ball);
}, [ball]);

useEffect(() => {
	// updateGameElements();
	if (otherpad)
		updateDivPosition(divRefs.otherPaddle.current, otherpad);
}, [otherpad]);

return (
	<center>
	<div ref={divRefs.gameContainer} className="game-container">
	  <div ref={divRefs.playerPaddle} className="paddle player-paddle"></div>
	  <div ref={divRefs.otherPaddle} className="paddle other-paddle"></div>
	  <div ref={divRefs.ball} className="ball"></div>
	  {/* Add other game elements as <div> elements */}
	</div>
  </center>
	);
};

export default Game;
