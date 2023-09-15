
import { MySocket } from "./Game";

function ListenOnSocket(ws: MySocket, setPadd: any, setBall: any, setOtherpad: any) {
  
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
		setPadd(update.paddle);
		setBall(update.ball);
		setOtherpad(update.otherPaddle );
	});
}

export { ListenOnSocket};