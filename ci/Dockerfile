ARG NODE_IMAGE="node:15-alpine"
FROM $NODE_IMAGE

VOLUME /data

ENV CONFIG_PATH=/data/config.yaml \
    REGISTRATION_PATH=/data/slack-registration.yaml

# su-exec is used by docker-run.sh to drop privileges
RUN apk add --no-cache su-exec \
    cairo \
    jpeg \
    pango \
    musl \
    giflib \
    pixman \
    pangomm \
    libjpeg-turbo \
    freetype


WORKDIR /opt/mx-puppet-slack
COPY docker-run.sh ./
COPY node_modules/ ./node_modules/
COPY build/ ./build/

# change workdir to /data so relative paths in the config.yaml
# point to the persisten volume
WORKDIR /data
ENTRYPOINT ["/opt/mx-puppet-slack/docker-run.sh"]
