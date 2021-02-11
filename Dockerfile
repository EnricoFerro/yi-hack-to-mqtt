ARG ARCH=
FROM ${ARCH}node:slim


WORKDIR /data

COPY ./package.json ./
COPY ./package-lock.json ./

COPY . .

ENV NODE_ENV production
ENV LOG_LEVEL DEBUG

CMD ["node", "dist/main"]
ENTRYPOINT ["/data/entrypoint.sh"]