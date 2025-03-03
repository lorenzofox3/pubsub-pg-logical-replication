# Pub/Sub with Postgres logical replication and NodeJS 

This repository shows how to set up a simple yet robust pub/sub system on top of [postgres logical replication](https://www.postgresql.org/docs/current/logical-replication.html)
It was built for writing [this blog post](https://lorenzofox.dev/posts/pub-sub-pg-logical-replication/)

## Installation

with NodeJs installed (version > 22 );

```shell
npm i
```

### database

Start the database with the proper configuration and publication:   

```shell
source setup-db.sh
```

### telemetry

You can also start an [Open Telemetry Stack](https://github.com/grafana/docker-otel-lgtm) to have some metrics and check how behaves your system

```shell
source setup-otel.sh
```

### subscriber process

Modify the [subscription program](./apps/subscriber) and start the process

```shell
npm run start:subscriber 
```

### publisher process

Modify the [publisher program](./apps/publisher) and start the process

```shell
npm run start:subscriber 
```

