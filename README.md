# Team chat app

Prototype app for teams chatting. It is school project.

Built with nuxtjs.

## Setting up environment

There is preconfigured docker service for easy local development. It creates MySQL database.
The `docker-compose.yml` file is located in `/docker` directory and can be started by `docker-compose up` and can be 
discarded by `docker-compose down`. Then it is required to run the `/docker/db/ddl.sql` script to initializes database.

## Running

Application can be run for local development using command `yarn dev`. For production run, first have to run `yarn build`
and then `yarn start` to start the application.

## Server API documentation

Server API documentation can be found [here](docs/api.md).
