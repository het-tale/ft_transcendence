
import { Room, Ball } from "../types";

const MAX_ANGLE_CHANGE = Math.PI / 4;

function resetBall(ball: Ball) {
  ball.x = 500;
  ball.y = 500;
  ball.dx = 3;
  ball.dy = 3;
}

export function colision(room: Room, containerWidth: number, containerHeight: number) {
	const player = room.players[0];
	const otherPlayer = room.players.find((p) => p !== player);

	const ball = room.ball;
	const playerPaddle = player.paddle;
	const otherPaddle = otherPlayer.paddle;

	if (
		ball.x + ball.radius >= playerPaddle.x &&
		ball.y >= playerPaddle.y &&
		ball.y <= playerPaddle.y + playerPaddle.height
	) {
		// Calculate the relative intersection point on the paddle
		const relativeIntersectY =
			(ball.y - (playerPaddle.y + playerPaddle.height / 2)) /
			(playerPaddle.height / 2);

		// Calculate the bounce angle based on the relative intersection point
		const bounceAngle = relativeIntersectY * MAX_ANGLE_CHANGE;

		// Update ball direction based on the paddle hit
		ball.dx = -ball.dx;
		ball.dy = Math.sin(bounceAngle) * 3;
	} else if (
		ball.x - ball.radius <= otherPaddle.x + otherPaddle.width &&
		ball.y >= otherPaddle.y &&
		ball.y <= otherPaddle.y + otherPaddle.height
	) {
		// Calculate the relative intersection point on the paddle
		const relativeIntersectY =
			(ball.y - (otherPaddle.y + otherPaddle.height / 2)) /
			(otherPaddle.height / 2);

		// Calculate the bounce angle based on the relative intersection point
		const bounceAngle = relativeIntersectY * MAX_ANGLE_CHANGE;

		// Update ball direction based on the paddle hit
		ball.dx = -ball.dx;
		ball.dy = Math.sin(bounceAngle) * 3;
	}

	// Check for scoring conditions
	if (ball.x + ball.radius > playerPaddle.x + playerPaddle.width) {
		// Player misses the ball
		otherPlayer.score++;
		resetBall(ball);
	} else if (ball.x - ball.radius < otherPaddle.x) {
		// Other player misses the ball
		player.score++;
		resetBall(ball);
	}

	// Emit updated ball position to both players
	player.socket.emit("UPDATE", {
		ball,
		paddle: playerPaddle,
		otherPaddle,
	});
	otherPlayer.socket.emit("UPDATE", {
		ball,
		paddle: otherPaddle,
		otherPaddle: playerPaddle,
	});
}

// import { Room, Ball } from "../types";

// const MAX_ANGLE_CHANGE = Math.PI / 4;


// function resetBall(ball: Ball) {
// 	ball.x = 500;
// 	ball.y = 500;
// 	ball.dx = 3;
// 	ball.dy = 3;
// }

// export function colision(room: Room, containerWidth: number, containerHeight: number) {
// 	const player = room.players[0];
// 	const otherPlayer = room.players.find((p) => p !== player);
// 	if (
// 		room.ball.x + room.ball.radius >= player.paddle.x &&
// 		room.ball.y >= player.paddle.y &&
// 		room.ball.y < player.paddle.y + player.paddle.height
// 	) {
// 		// change angle of ball depending on where it hits the paddle
// 		const relativeIntersectY = player.paddle.y + player.paddle.height / 2 - room.ball.y;
// 		const normalizedRelativeIntersectionY = relativeIntersectY / (player.paddle.height / 2);
// 		const bounceAngle = normalizedRelativeIntersectionY * MAX_ANGLE_CHANGE;
// 		room.ball.dx = -room.ball.dx;
// 		room.ball.dy = room.ball.dy > 0 ? Math.sin(bounceAngle) * -3 : Math.sin(bounceAngle) * 3;
// 	} else if (
// 		room.ball.x - room.ball.radius <= otherPlayer.paddle.x &&
// 		room.ball.y >= otherPlayer.paddle.y &&
// 		room.ball.y < otherPlayer.paddle.y + otherPlayer.paddle.height
// 	) {
// 		// change angle of ball depending on where it hits the paddle
// 		const relativeIntersectY = otherPlayer.paddle.y + otherPlayer.paddle.height / 2 - room.ball.y;
// 		const normalizedRelativeIntersectionY = relativeIntersectY / (otherPlayer.paddle.height / 2);
// 		const bounceAngle = normalizedRelativeIntersectionY * MAX_ANGLE_CHANGE;
// 		room.ball.dx = -room.ball.dx;
// 		room.ball.dy = room.ball.dy > 0 ? Math.sin(bounceAngle) * -3 : Math.sin(bounceAngle) * 3;
// 	}
// 	// Check for scoring conditions
// 	if (room.ball.x + room.ball.radius > player.paddle.x + player.paddle.width) {
// 		// Player misses the ball
// 		otherPlayer.score++;
// 		resetBall(room.ball);
// 		// console.log("player " + otherPlayer.id + " score " + otherPlayer.score);
// 	} else if (room.ball.x - room.ball.radius < otherPlayer.paddle.x - otherPlayer.paddle.width) {
// 		// Other player misses the ball
// 		player.score++;
// 		resetBall(room.ball);
// 		// console.log("player " + player.id + " score " + player.score);
// 	}
// 	// Emit updated ball position to the current player and the other player paddle
// 	player.socket.emit('UPDATE', { ball: room.ball, paddle: player.paddle, otherPaddle: otherPlayer.paddle});
// 	otherPlayer.socket.emit('UPDATE', { ball: room.ball, paddle: otherPlayer.paddle, otherPaddle: player.paddle});
// }

