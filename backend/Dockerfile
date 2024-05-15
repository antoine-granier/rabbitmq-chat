FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

# COPY start.sh .
# RUN chmod +x start.sh

# CMD ["./start.sh"]

CMD ["npm", "run", "dockercmd"]