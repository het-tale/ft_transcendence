all : up

up : 
	@docker-compose -f ./docker-compose.yml up --build

down : 
	@docker-compose -f ./docker-compose.yml down

stop : 
	@docker-compose -f ./docker-compose.yml stop

start : 
	@docker-compose -f ./docker-compose.yml start

status : 
	@docker ps
prune :
	@docker system prune -a -f
link :
	ln -s ./.env ./front/.env
re: stop prune up