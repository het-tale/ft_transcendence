FROM node:18

COPY ./back/* /back/

WORKDIR /back

RUN npm install

RUN chmod +x ./script.sh

# RUN npm run prisma:generate

# RUN npm run prisma:push

# CMD [ "npm", "run", "start:dev" ]

CMD ["sh", "./script.sh" ]