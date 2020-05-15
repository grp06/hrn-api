# Main information

## Architecture

See the [Notion document](https://www.notion.so/System-architecture-f274bec8cd3c45f093a8472c1b12a967).

## git

We work off the `staging` branch.  Once we release, we merge to `master`.

"start": "nodemon --exec \"babel-node --root-mode upward --ignore=\"hasura\" --ignore=\"**node_modules**\"\" src/app.js",

## Monorepo

See the `packages/web` folder for more details on this.

## .env files

Get these from an administrator.

## Startup procedure

1) Start up API: `yarn start` in `packages/api`
2) Start up Hasura & PostgreSQL: `yarn start` in `packages/hasura`)
3) Run tests: `yarn test` in `packages/api`

More details on this in the Notion doc linked above.

## Tests

All new APIs should be extensively tested.  There should be no functionality which lacks a test.

# Supplemental reference material

## Connect to AWS

`ssh -i graphql-ec2-key-pair.pem ubuntu@18.221.52.59`

## Useful commands

`docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps`

`docker-compose exec vuybe-node npm test`

`docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2a5172f3d57d`

`docker-compose -f docker-compose.dev.yml exec vuybe-postgres psql -U postgres`

`psql postgres://hasura:asdlfkj@graphql-engine-rds.capv2qnwclbf.us-east-2.rds.amazonaws.com:5432/postgres`

## Start up in test mode

scripts/docker contains various start up scripts.

You should only need `dc-down.sh` and `dc-dev.sh` in regular use.  `dc-prod.sh` is used in production.

## Troubleshooting

in case you run out of space in docker
`docker rmi $(docker images -q -f "dangling=true")`

