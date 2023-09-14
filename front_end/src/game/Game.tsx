
import React, { useEffect, useReducer, useRef, useState } from 'react'; // Clear the canvas
import { io } from 'socket.io-client';
import { throttle } from 'lodash';
// import { drawPaddle, drawBall, drawRounds, drawScore } from './DrawElements';
import { ListenOnSocket } from './Game.lisners';
import { ctxrend, cnvelem, initialState, State, Action, GameData, Paddle, Ball} from '../../Game.types';
import p5 from 'p5';

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

// function draw(state: State, p: p5, canvas: HTMLDivElement) {
// 	// console.log('draw pdalles ', gamedata.playerpad);
// 	if (state.otherpad && state.playerpad)
// 	{
// 		drawPaddle(state.otherpad, '#c5b26b', p);
// 		drawPaddle(state.playerpad, '#a7d6dc', p);
// 	}
// 	if (state.ball)
// 		drawBall(p, state.ball);
// 	// if (state.rounds)
// 	// 	drawRounds(state.rounds, p, canvas);
// 	// if (state.playerScore)
// 	// 	drawScore(true, state.playerScore, ctx, canvas);
// 	// if (state.otherScore)
// 	// 	drawScore(false, state.otherScore, ctx, canvas);
// }

function drawPaddle(paddle: Paddle, color: string, p: p5) {
	p.fill(color);
	p.rect(paddle.x, paddle.y, paddle.width, paddle.height);
  }
  
  function drawBall(p: p5, ball: Ball) {
	p.noStroke();
	p.fill(255); // White color
	p.ellipse(ball.x, ball.y, ball.radius * 2);
  }
  
//   function drawScore(first: boolean, Score: number, p: p5, canvas: cnvelem) {
// 	p.textSize(32);
// 	p.textAlign(p.CENTER);

// 	if (first)
// 	  p.text(Score.toString(), canvas.width / 2 + 100, 50);
// 	else
// 	  p.text(Score.toString(), canvas.width / 2 - 100, 50);
//   }
  
//   function drawRounds(rounds: number, p: p5, canvas: cnvelem) {
// 	p.textSize(32);
// 	p.textAlign(p.CENTER);
// 	p.text(rounds.toString(), canvas.width / 2, 50);
//   }

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
	//  const canvasContainerRef = useRef(null); // Create a ref for the canvas container
	const canvasContainerRef = useRef<HTMLDivElement | null>(null); // Add type annotation for the ref
	// const ctx = canvasRef.current?.getContext('2d');
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
		if (state.ws && state.playerpad && canvasContainerRef.current) {
			// console.log('handleMouseMove');
				const rect = canvasContainerRef.current.getBoundingClientRect();
				state.ws.emit('UpdatePlayerPaddle', {y: event.clientY, top: rect.top, hight: rect.height, with: rect.width});
		}
	};

	const throttlehandlemousemouve = throttle(handleMouseMove, 20); // Call handleMouseMove at most every 20ms
	const setupEventListeners = () => {
		if(canvasContainerRef.current)
			canvasContainerRef.current.addEventListener('mousemove', throttlehandlemousemouve);
	};

	
	useEffect(() => {
		// console.log('useEffect callsed ');
		if (state.ws && !init)
		state.ws.on('InitGame', (game: GameData) => {
			console.log('InitGame');
			setInit(true);
			if(game.ball) dispatch({ type: 'SET_BALL', payload: game.ball });
			if(game.playerpad) dispatch({ type: 'SET_PLAYER_PADDLE', payload: game.playerpad });
			if(game.otherpad) dispatch({ type: 'SET_OTHER_PADDLE', payload: game.otherpad });
			if(game.playerScore) dispatch({ type: 'SET_PLAYER_SCORE', payload: game.playerScore });
			if(game.otherScore) dispatch({ type: 'SET_OTHER_SCORE', payload: game.otherScore });
			if(game.rounds) dispatch({ type: 'SET_ROUNDS', payload: game.rounds });
			if(game.id) dispatch({ type: 'SET_ID', payload: game.id });
			});
		}, [init, state.ws]);

	const updateCanvas = (p: p5) => {
		if (canvasContainerRef.current && state && state.ws) {
			p.resizeCanvas(600, 300);

			p.background(0); // Clear the canvas to black
			// console.log('clearing canvas');
			if (!listning){
				listning = true;
				ListenOnSocket(state.ws, dispatch);
			}
			// draw(state, p, canvasContainerRef.current);
			if (state.otherpad && state.playerpad)
			{
				drawPaddle(state.otherpad, '#c5b26b', p);
				drawPaddle(state.playerpad, '#a7d6dc', p);
			}
			if (state.ball)
				drawBall(p, state.ball);
		}
	};


	useEffectOnce(() => {
		setupSocket(); 
		return () => {
			if (state.ws)
			state.ws.disconnect();
		}
	});

	useEffect(() => {
		if (init) setupEventListeners(); 
		return () => {
			if (canvasContainerRef.current)
			canvasContainerRef.current.removeEventListener('mousemove', throttlehandlemousemouve);
		}
	}, [init]);

	useEffect(() => {
		if (init) {
		  const p = new p5((p) => {
			p.setup = () => {
				p.createCanvas(600, 300).parent('canvas-container');
			};
			p.draw = () =>{
				updateCanvas(p);
			}
		  });
	  
		  return () => {
			p.remove(); // Remove the p5.js instance when the component unmounts
		  };
		}
	  }, [init]);
	// useEffect( updateCanvas , [state]);
	return (
		<center>
			<div ref={canvasContainerRef} id="canvas-container">
			{/* I hope that p5.js create the canvas here */}
			</div>
		</center>
	);
};

export default Game;
