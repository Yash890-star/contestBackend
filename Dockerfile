FROM node:16.16.0

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

EXPOSE 5001

CMD ["npm", "start"] 