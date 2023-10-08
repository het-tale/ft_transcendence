FROM node:18

RUN mkdir -p /app/front

WORKDIR /app/front

COPY ./front .


RUN npm install

CMD [ "npm", "start"]