# This Dockerfile builds a server for the WaiWaiUML Website
FROM node
RUN npm install -g serve
ADD . /waiwai-web
WORKDIR /waiwai-web
RUN yarn build
CMD serve -s build
