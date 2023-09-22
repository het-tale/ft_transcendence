
import { Server } from "socket.io";
import { Room, Ball } from "../types";

const MAX_ANGLE_CHANGE = Math.PI / 4;

function resetBall(ball: Ball) {
  ball.x = 500;
  ball.y = 500;
  ball.dx = 3;
  ball.dy = 3;
}

export function colision(room: Room) {
	
	
	const player = room.players[0];
	const otherPlayer = room.players[1];

	const playerPaddle = player.paddle;
	const otherPaddle = otherPlayer.paddle;

	if (
		room.ball.x + room.ball.radius >= playerPaddle.x &&
		room.ball.y >= playerPaddle.y &&
		room.ball.y <= playerPaddle.y + playerPaddle.height
	) {
		// Calculate the relative intersection point on the paddle
		const relativeIntersectY = (room.ball.y - (playerPaddle.y + playerPaddle.height / 2)) / (playerPaddle.height / 2);

		// Calculate the bounce angle based on the relative intersection point
		const bounceAngle = relativeIntersectY * MAX_ANGLE_CHANGE;

		// Update ball direction based on the paddle hit
		// room.ball.setDXDY(-room.ball.dx, Math.sin(bounceAngle) * 3);
		room.ball.dx = -room.ball.dx;
		room.ball.dy = Math.sin(bounceAngle) * 3;
	} else if (
		room.ball.x - room.ball.radius <= otherPaddle.x + otherPaddle.width &&
		room.ball.y >= otherPaddle.y &&
		room.ball.y <= otherPaddle.y + otherPaddle.height
	) {
		// Calculate the relative intersection point on the paddle
		const relativeIntersectY =
			(room.ball.y - (otherPaddle.y + otherPaddle.height / 2)) /
			(otherPaddle.height / 2);

		// Calculate the bounce angle based on the relative intersection point
		const bounceAngle = relativeIntersectY * MAX_ANGLE_CHANGE;

		// Update room.ball direction based on the paddle hit
		// room.ball.setDXDY(-room.ball.dx, Math.sin(bounceAngle) * 3);
		room.ball.dx = -room.ball.dx;
		room.ball.dy = Math.sin(bounceAngle) * 3;
	}

	// Check for scoring conditions
	if (room.ball.x + room.ball.radius > playerPaddle.x + playerPaddle.width) {
		// Player misses the ball
		otherPlayer.score++;
		room.rounds--;
		resetBall(room.ball);
		player.socket.emit("UPDATE SCORE", {playerScore: player.score, otherScore: otherPlayer.score, rounds: room.rounds});
		otherPlayer.socket.emit("UPDATE SCORE", {playerScore: otherPlayer.score, otherScore: player.score, rounds: room.rounds});
	} else if (room.ball.x < otherPaddle.x - otherPaddle.width) {
		// Other player misses the ball
		player.score++;
		room.rounds--;
		resetBall(room.ball);
		player.socket.emit("UPDATE SCORE", {playerScore: player.score, otherScore: otherPlayer.score, rounds: room.rounds});
		otherPlayer.socket.emit("UPDATE SCORE", {playerScore: otherPlayer.score, otherScore: player.score, rounds: room.rounds});
	}
	player.socket.emit("UPDATE", {
		ball: room.ball,
		paddle: playerPaddle,
		otherPaddle: otherPaddle,
	});
	otherPlayer.socket.emit("UPDATE", {
		ball: room.ball,
		paddle: otherPaddle,
		otherPaddle: playerPaddle,
	});
}