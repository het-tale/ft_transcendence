import { State, Action, Ball, Paddle } from "../../Game.types";
import { MySocket } from "./Game";

function ListenOnSocket(ws: MySocket, dispatch: React.Dispatch<Action>, state: State) {
  
	ws.on('connect', () => {
	  console.log('connected');
	});
  
	ws.on('disconnect', () => {
	  console.log('disconnected');
	});
  
	ws.on('error', (error) => {
	  console.log('error', error);
	});
  
	// ws.on('update', (message) => {
	//   console.log('Received update:', message);
	//   // Handle the received update message as needed
	// });
	ws.on('JoinRoom', (message: string) => {
		console.log('JoinRoom', message);
	});
  
	ws.on('StartGame', (message: string) => {
		console.log('StartGame on room', message); // print the start game message	
	});

	ws.on('UPDATE', (ball: Ball, other: Paddle) => {
		// console.log('paddle from server ', other);

		// Dispatch an action to update the game data
		dispatch({ type: 'SET_BALL', payload: ball});
		dispatch({ type: 'SET_OTHER_PADDLE', payload: other});
	  });
}

export { ListenOnSocket};