# Simple-Voting

# How to run?
`TODO`

# Architecture
## Frontend
- A static ReactJS website is hosted by AWS s3 with CDN

## Backend
- NodeJS RESTful API by Koa2 framework is hosted in Kubernetes (GKE)
	- API Documentation with Swagger: `TODO`
- Redis Cluster is used as database, which is capable to handle high voting throughput by sharding.

## Architecture Diagram
https://drive.google.com/file/d/1lAtIEehtKfHCw6WdYaNoPg-TQzksJPxx/view?usp=sharing

# Security
- To protect voter's privacy, it should not be able to identify back voter from our data stored. However, it is needed to ensure uniqueness of voting per campaign per voter. Hashing of HKID by SHA256 is used as key to confirm uniqueness of votes and meanwhile not harming voter's privacy.
- After campaign finished and as long as the hashing of HKIDs are not needed anymore for verification/debugging (say after 30 days of campaign finished), all related hashing of HKIDs will be deleted by a Kubernetes CronJob to further protect voter's privacy.
- HTTPS must be set to protect the leak of HKIDs but in this demo, the connection from device and server is assumed secure.
- Authorization and authentication should be set in `POST /campaigns` endpoint (e.g. JWT with "create_campaigns" scope) to prevent third party create campaigns publicly. However, for POC, the endpoint can be directly requested without authorization currently.

# Scaliblity
## Kubernetes (GKE)
- Auto horizontal scale up of compute instances and pods can be set according to RPS (requests per second), cpu, memory usages, etc without downtime.

## Redis Cluster 
- New Redis instances can be added to join Redis Cluster group anytime by horizontal scale up, and Redis Cluster will do auto sharding  without downtime.
- Monitoring of redis memory, CPU should be set up with alert system to notify Engineers to do manual horizontal scale up.

# References
- https://redislabs.com/ebook/part-1-getting-started/chapter-1-getting-to-know-redis/1-3-hello-redis/1-3-1-voting-on-articles/
- https://redis.io/topics/transactions
