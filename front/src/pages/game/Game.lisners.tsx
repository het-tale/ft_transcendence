import { Ball, GameData, Paddle } from "./Game.types";
import { MySocket } from "./Game";

type numberstate = React.Dispatch<React.SetStateAction<number>>;
type ballstate = React.Dispatch<React.SetStateAction<Ball | null>>;
type paddstate = React.Dispatch<React.SetStateAction<Paddle | null>>;
type stringstate = React.Dispatch<React.SetStateAction<string | null>>;

export function ListenOnSocket(
  socket: MySocket,
  setPadd: paddstate,
  setBall: ballstate,
  setOtherpad: paddstate,
  setPlayerScore: numberstate,
  setOtherScore: numberstate,
  setOtherAvatar: stringstate,
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>,
  setId: React.Dispatch<React.SetStateAction<number | null>>,
  setDimention: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>,
  setInit: React.Dispatch<React.SetStateAction<boolean>>,
  setOtherUsername: React.Dispatch<React.SetStateAction<string | null>>
) {
  socket.on("connect", () => {
    console.log("connected to server");
  });

  socket.on('connected', (message: string) => {
    console.log(message);
    // socket.emit("StartGame", "StartGame");
  });
  socket.on("disconnect", () => {
    console.log("disconnected");
  });

  socket.on("error", (error) => {
    console.log("error", error);
  });

  socket.on("OTHER AVATAR", (avatar: string, username: string) => {
	console.log("OTHER AVATAR", avatar);
	setOtherAvatar(avatar);
	setOtherUsername(username);
	  });
	
  socket.on("JoinRoom", (message: string) => {
    console.log("JoinRoom", message);
  });

  socket.on("StartGame", (message: string) => {
    console.log("StartGame on room", message); // print the start game message
	// socket?.emit("OTHER AVATAR", user?.avatar);
  });

  socket.on(
    "UPDATE",
    (update: { ball: Ball; paddle: Paddle; otherPaddle: Paddle }) => {
      setPadd(update.paddle);
      setBall(update.ball);
      setOtherpad(update.otherPaddle);
    }
  );
  socket.on("GAME OVER", (payload: any) => {
    console.log("GAME OVER", payload.winner);
	setGameOver(true);
  });
  socket.on(
    "UPDATE SCORE",
    (update: { playerScore: number; otherScore: number }) => {
      setPlayerScore(update.playerScore);
      setOtherScore(update.otherScore);
    }
  );

  socket.on("InitGame", (game: GameData) => {
	setInit(true);
	setBall(game.ball);
	setPadd(game.playerpad);
	setOtherpad(game.otherpad);
	console.log(
	  "InitGame",
	  game.playerpad,
	  " other paddle ",
	  game.otherpad
	);
	if (game.id) setId(game.id);
	if (game.playerScore) setPlayerScore(game.playerScore);
	if (game.otherScore) setOtherScore(game.otherScore);
	if (game.containerWidth && game.containerHeight)
	  setDimention({
		width: game.containerWidth,
		height: game.containerHeight,
	  });
	});
}

// export function InitGame(socket: MySocket,
// 	setInit: React.Dispatch<React.SetStateAction<boolean>>, 
// 	setBall: ballstate, setPadd: paddstate, 
// 	setOtherpad:paddstate, setId: React.Dispatch<React.SetStateAction<number | null>>, 
// 	setPlayerScore: numberstate, setOtherScore: numberstate, 
// 	setDimention: React.Dispatch<React.SetStateAction<{ width: number; height: number; }>>, 
// 	setGameStarted: React.Dispatch<React.SetStateAction<boolean>>
// 	) {
// 	socket.on("InitGame", (game: GameData) => {
// 	  setInit(true);
// 	  setBall(game.ball);
// 	  setPadd(game.playerpad);
// 	  setOtherpad(game.otherpad);
// 	  console.log(
// 		"InitGame",
// 		game.playerpad,
// 		" other paddle ",
// 		game.otherpad
// 	  );
// 	  if (game.id) setId(game.id);
// 	  if (game.playerScore) setPlayerScore(game.playerScore);
// 	  if (game.otherScore) setOtherScore(game.otherScore);
// 	  if (game.containerWidth && game.containerHeight)
// 		setDimention({
// 		  width: game.containerWidth,
// 		  height: game.containerHeight,
// 		});
// 	  setGameStarted(true);
// 	});
// }


