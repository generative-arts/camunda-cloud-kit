FROM node:lts AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:lts AS release

WORKDIR /app
COPY --from=builder /app /app

EXPOSE 8080
CMD [ "npm", "run", "dist" ]
