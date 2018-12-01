FROM node:8

RUN apt-get update &&\
    apt-get install -y npm &&\
    npm install -g npm && \
    npm install -g nodemon 
    
WORKDIR /home/node/app

COPY package*.json ./

RUN npm cache clean --force 

RUN npm cache verify

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]
