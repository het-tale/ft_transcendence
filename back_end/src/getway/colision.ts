import { Room, Ball } from "../types";

const MAX_ANGLE_CHANGE = Math.PI / 4;


function resetBall(ball: Ball) {
	ball.x = 600 / 2;
	ball.y = 300 / 2;
	ball.dx = 3;
	ball.dy = 3;
}

export function colision(room: Room) {
	const player = room.players[0];
	const otherPlayer = room.players.find((p) => p !== player);
	if (
		room.ball.x + room.ball.radius >= player.paddle.x &&
		room.ball.y >= player.paddle.y &&
		room.ball.y < player.paddle.y + player.paddle.height
	) {
		// change angle of ball depending on where it hits the paddle
		const relativeIntersectY = player.paddle.y + player.paddle.height / 2 - room.ball.y;
		const normalizedRelativeIntersectionY = relativeIntersectY / (player.paddle.height / 2);
		const bounceAngle = normalizedRelativeIntersectionY * MAX_ANGLE_CHANGE;
		room.ball.dx = -room.ball.dx;
		room.ball.dy = room.ball.dy > 0 ? Math.sin(bounceAngle) * -3 : Math.sin(bounceAngle) * 3;
	} else if (
		room.ball.x - room.ball.radius <= otherPlayer.paddle.x &&
		room.ball.y >= otherPlayer.paddle.y &&
		room.ball.y < otherPlayer.paddle.y + otherPlayer.paddle.height
	) {
		// change angle of ball depending on where it hits the paddle
		const relativeIntersectY = otherPlayer.paddle.y + otherPlayer.paddle.height / 2 - room.ball.y;
		const normalizedRelativeIntersectionY = relativeIntersectY / (otherPlayer.paddle.height / 2);
		const bounceAngle = normalizedRelativeIntersectionY * MAX_ANGLE_CHANGE;
		room.ball.dx = -room.ball.dx;
		room.ball.dy = room.ball.dy > 0 ? Math.sin(bounceAngle) * -3 : Math.sin(bounceAngle) * 3;
	}
	// Check for scoring conditions
	if (room.ball.x + room.ball.radius > player.paddle.x + player.paddle.width) {
		// Player misses the ball
		otherPlayer.score++;
		resetBall(room.ball);
		console.log("player " + otherPlayer.id + " score " + otherPlayer.score);
	} else if (room.ball.x - room.ball.radius < otherPlayer.paddle.x - otherPlayer.paddle.width) {
		// Other player misses the ball
		player.score++;
		resetBall(room.ball);
		console.log("player " + player.id + " score " + player.score);
	}
	// Emit updated ball position to the current player and the other player paddle
	player.socket.emit('UPDATE', { ball: room.ball, paddle: player.paddle, otherPaddle: otherPlayer.paddle, score: player.score, otherScore: otherPlayer.score});
	otherPlayer.socket.emit('UPDATE', { ball: room.ball, paddle: otherPlayer.paddle, otherPaddle: player.paddle, score: otherPlayer.score, otherScore: player.score});

}

