FROM node:slim


WORKDIR /data

COPY ./package.json ./
COPY ./package-lock.json ./

COPY . .

ENV NODE_ENV production
ENV APP_BASE_PATH   ''


CMD ["npm", "run", "start:prod"]
ENTRYPOINT ["/data/entrypoint.sh"]