ARG NODE_VERSION=14.17.6
FROM node:${NODE_VERSION}-alpine as pkg-base
WORKDIR /usr/src/app
COPY . .
RUN npm install
WORKDIR /usr/src/app/build

EXPOSE 8101
CMD [ "node", "index.js" ]