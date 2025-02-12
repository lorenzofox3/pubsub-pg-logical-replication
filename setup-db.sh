#!/bin/bash

npm run db:copy-schema

docker run  --rm \
	--name local_test \
 	--env-file .env \
 	-p 5432:5432 \
	-v "$PWD/docker/docker-entrypoint-initdb.d":/docker-entrypoint-initdb.d \
	-v "$PWD/docker/pg.conf":/etc/postgresql/postgresql.conf \
	postgres \
	-c 'config_file=/etc/postgresql/postgresql.conf'

