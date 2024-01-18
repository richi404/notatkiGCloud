FROM node:16 AS build

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

EXPOSE 80

CMD ["npm", "start"]
