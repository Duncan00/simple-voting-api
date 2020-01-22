# Simple-Voting

# How to run?
Make sure the followings are installed: 
- `yarn`
- `docker`
- `docker-compose`
- `node >= 10.15.0`

To setup
```
yarn setup
```

To run
```
yarn start
```

- It will do setup and run the application in development env.
- By default, the application is using port `9023`, and database is using ports `from 17000 to 17007`.
- If port `9023` is in use, update port in `dev.env` to any deserved port.
- If port `17000 to 17007` is in use, update out binding ports in `docker-redis-cluster/docker-compose.yml` to any deserved port.
- After successfully starting the server, API Documentation with Swagger is hosted here: 
```
http://localhost:9023/docs
```

# Architecture
## Diagram
![simple_voting_architecture](https://github.com/Duncan00/simple-voting/blob/master/docs/simple_voting_architecture.png)

## Frontend
- A static ReactJS website is hosted by AWS s3 with CDN

## Backend
- NodeJS RESTful API by Koa2 framework is hosted in Kubernetes (GKE)
- Redis Cluster is used as database (with AOF, RDB turned on to persist data), which is capable to handle high voting throughput by sharding.

## Data structure
- Campaign with vote counts of each candidate is stored as `Hash`
```
{
  "id": "a1696d67-5772-4fab-8faa-98306333e424",
  "title": "Who is the best NBA player in the history",
  "start_date": "2020-01-01",
  "end_date": "2020-01-31",
  "number_of_votes:Michael Jordan": "0",
  "number_of_votes:Tim Duncan": "0"
}
``` 

- Duplication of vote by the same HKID is done by `Set`, with storing hashed HKID in the set
- To identify which candidate a HKID voted, `Set` is used with storing hashed HKID in the set
- To sort all campaigns according to end date, `Sorted Set` is used as index (end date unix timestamp as score) 

# Security
- To protect voter's privacy, it should not be able to identify back voter from our data stored. However, it is needed to ensure uniqueness of voting per campaign per voter. Hashing of HKID by SHA256 is used as key to confirm uniqueness of votes and meanwhile not harming voter's privacy.
- After campaign finished and as long as the hashing of HKIDs are not needed anymore for verification/debugging (say after 1 day of campaign finished), all related hashing of HKIDs will be deleted by expiration of Redis sets.
- HTTPS must be set to protect the leak of HKIDs but in this demo, the connection from device and server is assumed secure.
- Authorization and authentication should be set in `POST /campaigns` endpoint (e.g. JWT with "create_campaigns" scope) to prevent third party create campaigns publicly. However, for POC, the endpoint can be directly requested without authorization currently.

# Scalability
## Kubernetes (GKE)
- Auto horizontal scale up of compute instances and pods can be set according to RPS (requests per second), cpu, memory usages, etc without downtime.

## Redis Cluster 
- New Redis instances can be added to join Redis Cluster group anytime by horizontal scale up, and Redis Cluster will do auto sharding without downtime.
- Monitoring of redis memory and CPU should be set up with alert system to notify Engineers to do manual horizontal scale up.

# Further improvements
- Distributed load tests by tools like Locust must be done for the estimated amount of traffic in a staging env
- To make the architecture more scalable on write side, it is possible to make `POST /campaigns/:id/votes` endpoint to be async, i.e. Response status code `202 Accepted`, publish an event to a message system and worker handles all logic and access to database at background. 
- Some thoughts to do is to use CQRS with event sourcing can be applied to separate the loads and scale for write side and view side, but it will be less real time for the vote count displaying as trade-off. 
  1. (Write side) Only write campaign (without vote count), and vote event to Redis Cluster
  2. (Heavy data processing in background) Indexing, vote counting are done by cronjob in background, and store result in view DB, say Elastic Search
  3. (Read side) Read/Query data only from the view DB
![simple_voting_architecture](https://github.com/Duncan00/simple-voting/blob/master/docs/simple_voting_architecture_with_cqrs.png)
- Typescript can be added for higher maintainability and easier development

# References
- https://redislabs.com/ebook/part-1-getting-started/chapter-1-getting-to-know-redis/1-3-hello-redis/1-3-1-voting-on-articles/
- https://redis.io/topics/transactions
