import { Ball, Paddle } from "./Game.types";
import { MySocket } from "./Game";
import { type } from "os";
import { UserType } from "../../Types/User";

type numberstate = React.Dispatch<React.SetStateAction<number>>;
type ballstate = React.Dispatch<React.SetStateAction<Ball | null>>;
type paddstate = React.Dispatch<React.SetStateAction<Paddle | null>>;
type stringstate = React.Dispatch<React.SetStateAction<string | null>>;

function ListenOnSocket(
  socket: MySocket,
  setPadd: paddstate,
  setBall: ballstate,
  setOtherpad: paddstate,
  setPlayerScore: numberstate,
  setOtherScore: numberstate,
  setOtherAvatar: stringstate,
  user: UserType | null,
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>
) {
  socket.on("connect", () => {
    console.log("connected to server");
  });

  socket.on('connected', (message: string) => {
    console.log(message);
    socket.emit("StartGame", "StartGame");
  });
  socket.on("disconnect", () => {
    console.log("disconnected");
  });

  socket.on("error", (error) => {
    console.log("error", error);
  });

  socket.on("OTHER AVATAR", (avatar: string) => {
	console.log("OTHER AVATAR", avatar);
	setOtherAvatar(avatar);
	  });
	
  socket.on("JoinRoom", (message: string) => {
    console.log("JoinRoom", message);
  });

  socket.on("StartGame", (message: string) => {
    console.log("StartGame on room", message); // print the start game message
	socket?.emit("OTHER AVATAR", user?.avatar);
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
}

export { ListenOnSocket };
