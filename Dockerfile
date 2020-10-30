ARG ARCH=
FROM ${ARCH}node:slim


WORKDIR /data

COPY ./package.json ./
COPY ./package-lock.json ./

COPY . .

ENV NODE_ENV production
ENV LOG_LEVEL DEBUG

RUN npm install

CMD ["npm", "run", "start:prod"]
ENTRYPOINT ["/data/entrypoint.sh"]