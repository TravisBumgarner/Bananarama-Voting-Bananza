FROM node:16

WORKDIR /app

COPY ./package*.json ./
COPY ./tsconfig.json ./
COPY ./src ./src

RUN yarn install
RUN yarn run bundle

EXPOSE 8080

CMD ["node", "build/index.js"]