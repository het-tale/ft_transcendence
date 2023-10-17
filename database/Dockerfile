FROM node:18

RUN mkdir -p /app/database

WORKDIR /app/database

# Copy your Prisma schema and other files
COPY ./back/prisma ./prisma
COPY ./database/package.json ./

RUN npm install -g npm@latest

RUN npm install

# RUN npm run prisma:generate

# RUN npm run prisma:push

CMD ["npx", "prisma", "studio"]
