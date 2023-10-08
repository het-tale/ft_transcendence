FROM node:18

COPY ./back/* /back/

WORKDIR /back

RUN npm install

RUN chmod +x ./script.sh

CMD ["sh", "./script.sh" ]