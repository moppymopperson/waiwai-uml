import React, { Component } from 'react'
import { UnControlled as ReactCodeMirror } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/markdown/markdown'
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

class App extends Component {
  state = { encodedUml: '' }

  componentDidMount() {
    this.handleTextUpdate = debounce(this.handleTextUpdate, 1000)
    this.joinRoom()
  }

  plantUmlStyling() {
    return `
    skinparam class {
      ArrowColor #0078BF
      BorderColor #0078BF
      BackgroundColor White
    }
    `
  }

  joinRoom() {
    console.log('Joining...')
    Y({
      db: {
        name: 'memory' // store the shared data in memory
      },
      connector: {
        name: 'websockets-client', // use the websockets connector
        url: `http://${window.location.hostname}:1234`, // The signalling server's address
        room: 'my_room' // Instances connected to the same room share data
      },
      share: {
        editorText: 'Text'
      },
      sourceDir: 'node_modules' // where the modules are (browser only)
    })
      .then(y => {
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

  handleTextUpdate(text) {
    const encodedUml = plantumlEncoder.encode(this.plantUmlStyling() + text)
    this.setState({ encodedUml })
    console.log(`http://${window.location.hostname}:8080/svg/${encodedUml}`)
  }

  codeOptions() {
    return {
      mode: 'markdown',
      lineNumbers: true,
      tabSize: 2,
      autoCloseBrackets: true
    }
  }

  render() {
    return (
      <div className="app">
        <nav className="header"><div><img src={icon} height={24} alt={'icon'} /><div>わいわい UML!</div></div></nav>
        <div className="container">
          <ReactCodeMirror
            value={this.state.code}
            options={this.codeOptions()}
            editorDidMount={editor => {
              this.editor = editor
            }}
          />
          <div className="uml">
            <img
              src={`http://${window.location.hostname}:8080/svg/${
                this.state.encodedUml
                }`}
              alt="uml here"
            />
          </div>
        </div>
        <div className="footer"><div><a href="http://plantuml.com/class-diagram" target="_blank" rel="noopener noreferrer">Markdown Cheat Sheet</a></div>
          Copyright Erik Hornberger, EExT LLC, 2018</div>
      </div>
    )
  }
}

export default App
