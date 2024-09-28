# Ft_transcendence

Ft_transcendence is a full-stack web application that combines a classic Pong game with a modern chat system. It offers a unique blend of retro gaming and social interaction.

## Features

- User authentication and authorization
- Two-factor authentication (2FA)
- Real-time multiplayer Pong game
- Chat system with public channels and direct messaging
- User profiles and friend management
- Game invitations and matchmaking
- Achievements system

## Tech Stack

### Frontend
- React
- TypeScript
- Chakra UI
- Socket.IO Client
- Axios

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Socket.IO
- Passport.js

### DevOps
- Docker and Docker Compose

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- Docker and Docker Compose

### Installation

1. Clone the repository
2. Create a `.env` file in the root directory with necessary environment variables
3. Run the following commands:

```bash
make link # Creates symlink for .env file
make up # Builds and starts Docker containers
```

##  License

This project is part of the 42 school curriculum and is subject to its academic policies.