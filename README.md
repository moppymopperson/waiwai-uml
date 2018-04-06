# Wai Wai UML
Wai Wai UML is just a quick hacky experiment to enable group UML desing.
Each person in the room has the same page open on their computer and on
a projector. All members can edit the Plant UML markdown at anytime and
it will automatically update on all other users scree and also cause the
UML to re-render in realtime. I'm hoping this will make it quick and
easy to rapidly iterate on design ideas. We'll find out soon!

## Setup
1. Clone this repo
2. `cd` into `waiwai-uml` and run `yarn install` or `npm install`
3. Start a plant UML server on the same machine using `docker run -it --rm -p 8080:8080 plantuml/plantuml-server:jetty`
4. Start the dev server with `yarn start` or `npm start`
5. Have all users connect to the dev server on port 3000

### ToDo's
- [] Cannot successfully run `yarn build` to create a static site that can be published on the web (y-js issue)
- [] Cannot get y-websockets-server or y-webrtc working, so we're stuck with the default dev-only servers provided by y-js team

