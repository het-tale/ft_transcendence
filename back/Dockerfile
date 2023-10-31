FROM node:18

RUN npm install -g npm@latest
RUN npm install -g openai

COPY ./back/* /back/

WORKDIR /back


RUN npm install

RUN chmod +x ./script.sh

CMD ["sh", "./script.sh" ]