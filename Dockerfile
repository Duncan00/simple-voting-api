FROM node:10.15.0-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --production

# Bundle app source
COPY . .

EXPOSE 9003
CMD [ "node", "server/server.js" ]
