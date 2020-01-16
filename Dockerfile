FROM node:10.15.0-alpine

EXPOSE 9003

CMD ["pm2-docker", "--no-daemon", "--raw", "scripts/startup/docker/pm2.json"]
