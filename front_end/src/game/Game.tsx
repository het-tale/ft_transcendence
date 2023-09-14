
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { throttle } from 'lodash';
import { drawPaddle, drawBall, drawRounds, drawScore } from './DrawElements';
import { ListenOnSocket } from './Game.lisners';
import { ctxrend, cnvelem, initialState, State, Action, GameData} from '../../Game.types';

export type MySocket = ReturnType<typeof io>;

export const gameReducer = (state: State, action: Action): State => {
	switch (action.type) {
	  case 'SET_WS': return { ...state, ws: action.payload };
	  case 'SET_PLAYER_PADDLE': return { ...state, playerpad: action.payload  };
	  case 'SET_OTHER_PADDLE': return { ...state, otherpad: action.payload  };
	  case 'SET_BALL': return { ...state, ball: action.payload };
	  case 'SET_PLAYER_SCORE': return { ...state, playerScore: action.payload };
	  case 'SET_OTHER_SCORE': return { ...state, otherScore: action.payload };
	  case 'SET_ROUNDS': return { ...state, rounds: action.payload };
	  case 'SET_ID': return { ...state, id: action.payload };
	  case 'SET_PADDLE_SPEED': return { ...state, padlleSpeed: action.payload };
	  default: return state;
	}
  };

function draw(ctx: ctxrend, canvas: cnvelem, state: State) {
	// console.log('draw pdalles ', gamedata.playerpad);
	if (state.otherpad && state.playerpad)
	{
		drawPaddle(state.otherpad, '#c5b26b', ctx, canvas);
		drawPaddle(state.playerpad, '#a7d6dc', ctx, canvas);
	}
	if (state.ball)
		drawBall(ctx, state.ball);
	if (state.rounds)
		drawRounds(state.rounds, ctx, canvas);
	if (state.playerScore)
		drawScore(true, state.playerScore, ctx, canvas);
	if (state.otherScore)
		drawScore(false, state.otherScore, ctx, canvas);
}

function useEffectOnce(effect: React.EffectCallback) {
	let ref = useRef(false);
	useEffect((...args) => {
		if (ref.current === false) {
			ref.current = true;
			effect(...args)
		}
	}, []);
}

const Game: React.FC = () => {
	const canvasRef = useRef<cnvelem | null>(null);
	const ctx = canvasRef.current?.getContext('2d');
	
	
	const [state, dispatch] = useReducer(gameReducer, initialState);
	const [init, setInit] = useState(false);
	let listning = false;
	
	const setupSocket = () => {
	console.log('connecting');
	const wsInstance = io('http://localhost:3001', {
		withCredentials: true,
		forceNew: true,
		timeout: 100000,
		transports: ['websocket']
	});
	dispatch({ type: 'SET_WS', payload: wsInstance });
};

	const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
		if (state.ws && state.playerpad && canvasRef.current) {
				const rect = canvasRef.current.getBoundingClientRect();
				state.ws.emit('UpdatePlayerPaddle', {y: event.clientY, top: rect.top, hight: rect.height, with: rect.width});
		}
	};

	const throttlehandlemousemouve = throttle(handleMouseMove, 20); // Call handleMouseMove at most every 20ms
	const setupEventListeners = () => {
		if(canvasRef.current)
			canvasRef.current.addEventListener('mousemove', throttlehandlemousemouve);
	};

	
	useEffect(() => {
		// console.log('useEffect callsed ');
		if (state.ws && !init)
		state.ws.on('InitGame', (game: GameData) => {
			setInit(true);
			// console.log('InitGame', game);
			// let newgameData = {...gamedata, ...game};
			if(game.ball) dispatch({ type: 'SET_BALL', payload: game.ball });
			if(game.playerpad) dispatch({ type: 'SET_PLAYER_PADDLE', payload: game.playerpad });
			if(game.otherpad) dispatch({ type: 'SET_OTHER_PADDLE', payload: game.otherpad });
			if(game.playerScore) dispatch({ type: 'SET_PLAYER_SCORE', payload: game.playerScore });
			if(game.otherScore) dispatch({ type: 'SET_OTHER_SCORE', payload: game.otherScore });
			if(game.rounds) dispatch({ type: 'SET_ROUNDS', payload: game.rounds });
			if(game.id) dispatch({ type: 'SET_ID', payload: game.id });
			});
		}, [init, state.ws]);

	const updateCanvas = () => {
		if (canvasRef.current && state && state.ws) {
			const canvas = canvasRef.current;
			
			// console.log('clearing canvas');
			if (!listning){
				listning = true;
				ListenOnSocket(state.ws, dispatch);
			} 
			ctx?.clearRect(0, 0, canvas.width, canvas.height);
			// console.log('draw in front end', state);
			if (ctx)
				draw(ctx, canvas, state);
		}
	};

	useEffectOnce(() => {
	//set up socket and listners
	setupSocket();
	});
	useEffect(() => {
		if (init)
			setupEventListeners();
	}, [init]);

	// const update = () => {
	// 	// console.log('update functiuon hase been called');
	// 	if (state.ws && state.playerpad) {
	// 		// console.log('UpdatePaddle in front end', state.playerpad);

	// 		state.ws.emit('UpdatePlayerPaddle', state.playerpad);
	// 	}
	// };

	useEffect(updateCanvas, [state]);
	// useEffect(update, [state]);

	return (
		<center>
			<canvas ref={canvasRef} width={600} height={300} />
		</center>
	);
};

export default Game;
