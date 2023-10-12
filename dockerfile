ARG NODE_VERSION=16.17.0
FROM node:${NODE_VERSION}-alpine as pkg-base
WORKDIR /usr/src/app
COPY . .
RUN npm install

EXPOSE 80
CMD [ "node", "./build/index.js" ]