import React, {Component} from "react"
import LoginForm from "./LoginForm"
import Tasks from "./Tasks"
import {Task} from "./Models"

type State = {
  authenticated: boolean
  tasks: Array<Task>
}

export default class App extends Component<{}, State> {

  constructor(props: {}) {
    super(props)
    this.state = {
      authenticated: false,
      tasks: []
    }
    this.handleSignIn = this.handleSignIn.bind(this)
    this.handleSignOut = this.handleSignOut.bind(this)
  }

  componentDidMount() {
   this.authorize()
  }

  authorize() {
    let apiKey = localStorage.getItem("apiKey")
    if (apiKey !== null && apiKey !== "") {
      this.setState({authenticated: true})
    }
  }

  handleSignIn(apiKey: string) {
    localStorage.setItem("apiKey", apiKey)
    this.authorize()
  }

  handleSignOut() {
    localStorage.removeItem("apiKey")
    this.setState({authenticated: false})
  }

  render() {
    return (
    <div className="container-lg">
      <div className="col-12 mx-auto">
          {!this.state.authenticated && <LoginForm handleSignIn={this.handleSignIn}/>}
          {this.state.authenticated && <Tasks handleSignOut={this.handleSignOut}/>}
      </div>
    </div>
  );
  }

}