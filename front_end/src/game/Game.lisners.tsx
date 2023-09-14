import { Action} from "../../Game.types";
import { MySocket } from "./Game";

function ListenOnSocket(ws: MySocket, dispatch: React.Dispatch<Action>) {
  
	ws.on('connect', () => {
	  console.log('connected');
	});

	ws.on('disconnect', () => {
	  console.log('disconnected');
	});
  
	ws.on('error', (error) => {
	  console.log('error', error);
	});
	ws.on('JoinRoom', (message: string) => {
		console.log('JoinRoom', message);
	});
  
	ws.on('StartGame', (message: string) => {
		console.log('StartGame on room', message); // print the start game message	
	});

	ws.on('UPDATE', (update: any) => {
		console.log('UPDATE', update);
		dispatch({ type: 'SET_BALL', payload: update.ball});
		dispatch({ type: 'SET_PLAYER_PADDLE', payload: update.paddle});
		dispatch({ type: 'SET_OTHER_PADDLE', payload: update.otherPaddle});
		dispatch({ type: 'SET_PLAYER_SCORE', payload: update.playerScore});
		dispatch({ type: 'SET_OTHER_SCORE', payload: update.otherScore});
	});
}

export { ListenOnSocket};