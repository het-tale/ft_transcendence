FROM node:18

RUN mkdir -p /app/database

WORKDIR /app/database

COPY ./back/prisma ./prisma
COPY ./database/package.json ./

RUN npm install -g npm@latest

RUN npm install

CMD ["npx", "prisma", "studio"]
