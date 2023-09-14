import React, { useEffect, useReducer, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { throttle } from 'lodash';
import p5 from 'p5'; // Import p5.js
import { ListenOnSocket } from './Game.lisners';
import { initialState, State, Action, GameData } from '../../Game.types';

const gameReducer = (state: State, action: Action): State => {
  // ... Your gameReducer code ...
};



const Game: React.FC = () => {
  const canvasContainerRef = useRef(null); // Create a ref for the canvas container
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [init, setInit] = useState(false);
  let listning = false;

  const setupSocket = () => {
    console.log('connecting');
    const wsInstance = io('http://localhost:3001', {
      withCredentials: true,
      forceNew: true,
      timeout: 100000,
      transports: ['websocket'],
    });
    dispatch({ type: 'SET_WS', payload: wsInstance });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (state.ws && state.playerpad && canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      state.ws.emit('UpdatePlayerPaddle', { y: event.clientY, top: rect.top, height: rect.height, width: rect.width });
    }
  };

  const throttlehandlemousemouve = throttle(handleMouseMove, 20); // Call handleMouseMove at most every 20ms
  const setupEventListeners = () => {
    if (canvasContainerRef.current) canvasContainerRef.current.addEventListener('mousemove', throttlehandlemousemouve);
  };

  useEffect(() => {
    if (state.ws && !init)
      state.ws.on('InitGame', (game: GameData) => {
        setInit(true);
        // ... Your state updates ...
      });
  }, [init, state.ws]);

  const updateCanvas = (p: p5) => {
    if (canvasContainerRef.current && state && state.ws) {
      const canvas = p.createCanvas(600, 300); // Create the p5.js canvas
      canvas.parent('canvas-container'); // Set the canvas parent container element

      // Clear the p5.js canvas
      p.background(0);

      // Call your existing draw function using p5.js context
      drawPaddle(state.otherpad, '#c5b26b', p);
      drawPaddle(state.playerpad, '#a7d6dc', p);
      drawBall(p, state.ball);
      drawRounds(state.rounds, p, canvas);
      drawScore(true, state.playerScore, p, canvas);
      drawScore(false, state.otherScore, p, canvas);

      if (!listning) {
        listning = true;
        ListenOnSocket(state.ws, dispatch);
      }
    }
  };

  useEffectOnce(() => {
    setupSocket();
    return () => {
      if (state.ws) state.ws.disconnect();
    };
  });

  useEffect(() => {
    if (init) setupEventListeners();
    return () => {
      if (canvasContainerRef.current)
        canvasContainerRef.current.removeEventListener('mousemove', throttlehandlemousemouve);
    };
  }, [init]);

  return (
    <center>
      <div ref={canvasContainerRef} id="canvas-container">
        {/* p5.js will create the canvas here */}
      </div>
    </center>
  );
};

export default Game;
