# This Dockerfile builds a signaling server for real time collaboration
# on the WaiWaiUML Website
FROM node
RUN npm install -g node-gyp
RUN npm install --unsafe-perm -g y-websockets-server
EXPOSE 1234
CMD DEBUG=y*,-y:connector-message y-websockets-server --port 1234