FROM node:18

RUN mkdir -p /app/front

WORKDIR /app/front

COPY ./front .

RUN chmod +x ./script.sh

CMD ["sh", "./script.sh" ]
