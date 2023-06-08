FROM node as development

ENV NODE_ENV=development

WORKDIR /usr/src/app

COPY package*.json ./

COPY [".env", ".env"]

RUN npm i

EXPOSE 3000

CMD npm run dev

FROM node as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

COPY [".env", ".env"]

RUN npm i

EXPOSE 3000

CMD npm run dev