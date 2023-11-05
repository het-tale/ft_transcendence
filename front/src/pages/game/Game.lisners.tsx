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
  setInit: React.Dispatch<React.SetStateAction<boolean>>,
  setOtherUsername: React.Dispatch<React.SetStateAction<string | null>>,
  setGameStarted: React.Dispatch<React.SetStateAction<boolean>>,
  setGameinvite: React.Dispatch<React.SetStateAction<boolean>>,
  setGameDeclined: React.Dispatch<React.SetStateAction<boolean>>,
  setMessage: React.Dispatch<React.SetStateAction<string | null>>,
  setIswiner: React.Dispatch<React.SetStateAction<boolean>>
) {
  socket.on("connect", () => {
  });

  socket.on('connected', (message: string) => {
  });
  socket.on("disconnect", () => {
  });

  socket.on("error", (error) => {
  });

  socket.on("OTHER AVATAR", (avatar: string, username: string) => {
	setOtherAvatar(avatar);
	setOtherUsername(username);
	  });

  socket.on("GameDeclined", (message: string) => {
    setGameDeclined(true);
    setGameinvite(false);
    setMessage(message);
  });
  socket.on("InvitationDeclined", (message: string) => {
    setGameDeclined(true);
    setGameinvite(false);
    setMessage(message);
  });

  socket.on("JoinRoom", (message: string) => {
  });

  socket.on("StartGame", (message: string) => { 
  });

  socket.on("GAME STARTED", (message: boolean) => {
    setGameStarted(true);
  });
  
  socket.on("GAME INVITE", (message: boolean) => {
    setGameinvite(true);
  });

  socket.on(
    "UPDATE",
    (update: { ball: Ball; paddle: Paddle; otherPaddle: Paddle }) => {
      setPadd(update.paddle);
      setBall(update.ball);
      setOtherpad(update.otherPaddle);
    }
  );
  socket.on("GAME OVER", (payload: boolean) => {
	  setGameOver(true);
    setIswiner(payload);
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
	if (game.id) setId(game.id);
	if (game.playerScore) setPlayerScore(game.playerScore);
	if (game.otherScore) setOtherScore(game.otherScore);
	});
}


