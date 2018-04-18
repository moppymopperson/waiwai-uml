import React, { Component } from 'react'
import { UnControlled as ReactCodeMirror } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/keymap/vim.js'
import './App.css'
import icon from './kangaroo-128.png'
import plantumlEncoder from 'plantuml-encoder'
import debounce from 'debounce'
import Y from '../node_modules/yjs/dist/y.js'
import yWebsocketsClient from '../node_modules/y-websockets-client/dist/y-websockets-client.js'
import yMemory from '../node_modules/y-memory/dist/y-memory.js'
import yArray from '../node_modules/y-array/dist/y-array.js'
import yText from '../node_modules/y-text/dist/y-text.js'
import yMap from '../node_modules/y-map/dist/y-map.js'
Y.extend(yMap, yArray, yText, yWebsocketsClient, yMemory)

/**
 * Defines a single page app with an editing area for
 * markdown and a rendering area that shows the PlantUML
 * output.
 */
class App extends Component {
  /**
   * State holds the latest version of the users' encoded
   * PlantUML markdown as well as some user preference data
   */
  state = { encodedUml: '', vimMode: false }

  /**
   * This will be triggered as soon as the app loads. Here we
   * connect to the room and debounce the `handleTextUpdate` method.
   */
  componentDidMount() {
    this.handleTextUpdate = debounce(this.handleTextUpdate, 1000)
    this.joinRoom()
  }

  /**
   * The string defined here is appended to the top of every PlantUML
   * request and defines the colors and styling of the image that will be
   * returned.
   */
  plantUmlStyling() {
    return `
    skinparam class {
      ArrowColor #0078BF
      BorderColor #0078BF
      BackgroundColor White
    }
    skinparam sequence {
      ArrowColor #0078BF
      LifeLineBorderColor #0078BF
      LifeLineBackgroundColor #0078BF 
      
      ParticipantBorderColor #0078BF 
      ParticipantBackgroundColor White
      
      ActorBorderColor #0078BF
      ActorBackgroundColor White
    }
    skinparam usecase {
      BackgroundColor White
	    BorderColor #0078BF
    }
    skinparam state {
      BackgroundColor White
      BorderColor #0078BF
    }
    skinparam BoundaryBorderColor #0078BF
    skinparam BoundaryBackgroundColor White
    skinparam ControlBorderColor #0078BF
    skinparam ControlBackgroundColor White
    skinparam EntityBorderColor #0078BF
    skinparam EntityBackgroundColor White
    skinparam DatabaseBorderColor #0078BF
    skinparam DatabaseBackgroundColor White
    skinparam CollectionsBorderColor #0078BF
    skinparam CollectionsBackgroundColor White
    `
  }

  /**
   * Connects to the websocket server responsible for propogating updates
   * across users and sets up a single shared variable.
   *
   * We use an in memory database for speed and simplicity.
   * Users will be put in a room based on the URL they are at. Users in the
   * same room will be able to see and edit the same data, but users in
   * different rooms will be able to work independently.
   */
  joinRoom() {
    console.log('Joining...')
    Y({
      db: {
        name: 'memory' // store the shared data in memory
      },
      connector: {
        name: 'websockets-client', // use the websockets connector
        url: `ws://${window.location.hostname}:1234`, // The signalling server's address
        room: window.location.pathname // Instances connected to the same room share data
      },
      share: {
        editorText: 'Text'
      },
      sourceDir: 'node_modules' // where the modules are (browser only)
    })
      .then(y => {
        console.log(`Joined room: ${y.options.connector.room}`)
        console.log('Yjs instance ready!')
        this.handleTextUpdate(y.share.editorText.toString())
        y.share.editorText.bind(this.editor)
        y.share.editorText.observe(event => {
          this.handleTextUpdate(event.object.toString())
        })
      })
      .catch(e => {
        console.error('Failed to setup Y-js')
        console.log(e)
      })
  }

  /**
   * Called each time the markdown text changes. In this method we encode the
   * PlantUML markdown that can be sent to a PlantUML server for processing. We
   * then update the state wit the latest value, which will be used by an
   * <img> tag to fetch an SVG image from the server.
   *
   * Note that this method gets debounced in `componentDidMount`. Not doing so
   * results in a heavy load on the server that can cause it to crash with just
   * one client.
   *
   * @param {string} text PlantUML markdown
   */
  handleTextUpdate(text) {
    const encodedUml = plantumlEncoder.encode(this.plantUmlStyling() + text)
    this.setState({ encodedUml })
    console.log(`http://${window.location.hostname}:8080/svg/${encodedUml}`)
  }

  /**
   * The options specified here will be applied to the CodeMirror text editor
   * the first time it mounts.
   */
  codeOptions() {
    return {
      mode: 'markdown',
      lineNumbers: true,
      tabSize: 2
    }
  }

  render() {
    return (
      <div className="app">
        <nav className="header">
          <div>
            <img src={icon} height={24} alt={'icon'} />
            <div>わいわい UML!</div>
          </div>
          <button
            onClick={() => {
              console.log(this.state.vimMode)
              this.editor.setOption(
                'keyMap',
                !this.state.vimMode ? 'vim' : 'default'
              )
              this.setState(state => ({ vimMode: !state.vimMode }))
            }}
          >
            VIM Mode: {this.state.vimMode ? 'ON' : 'OFF'}
          </button>
        </nav>
        <div className="container">
          <div className="vert">
            Room: {window.location.pathname.slice(1)}
            <ReactCodeMirror
              value={this.state.code}
              options={this.codeOptions()}
              editorDidMount={editor => {
                this.editor = editor
              }}
            />
          </div>
          <div className="uml">
            <img
              src={`http://${window.location.hostname}:8080/svg/${
                this.state.encodedUml
              }`}
              alt="uml here"
            />
          </div>
        </div>
        <div className="footer">
          <div>
            <a
              href="http://plantuml.com/class-diagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              Markdown Cheat Sheet
            </a>
          </div>
          Copyright Erik Hornberger, EExT LLC, 2018
        </div>
      </div>
    )
  }
}

export default App
