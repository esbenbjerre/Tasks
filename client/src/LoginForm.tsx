import React, {Component} from "react"

type Props = {
  handleSignIn: (apiKey: string) => void
}

type State = {
  username: string
  password: string
  error: string
}

export default class LoginForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      username: "",
      password: "",
      error: ""
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const value = event.currentTarget.type === "checkbox" ? event.currentTarget.checked : event.currentTarget.value
    this.setState({
      ...this.state,
      [event.currentTarget.name]: value
    })
   }

  showError(error: string) {
    this.setState({error: error})
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    fetch("https://localhost:5001/api/login",
    {method: "POST", credentials: "same-origin", body: JSON.stringify({username: this.state.username, password: this.state.password})})
    .then(response => response.json().then(data => ({response: response, body: data})))
    .then((data) => {
      if (!data.response.ok) {
        return this.showError(data.body.message)
      }
      return this.props.handleSignIn(data.body.apiKey)
      },
      (_) => {
        this.showError("Network error")
      }
    )
  }

  render() {
    return (
      <div className="col-6 mx-auto">

        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <div className="form-group-header">
              <label htmlFor="username">Username</label>
            </div>
            <div className="form-group-body">
              <input className="form-control width-full" type="text" id="username" name="username" value={this.state.username} onChange={this.handleChange}/>
            </div>
          </div>

          <div className="form-group">
            <div className="form-group-header">
              <label htmlFor="password">Password</label>
            </div>
            <div className="form-group-body">
              <input className="form-control width-full" type="password" id="password" name="password" value={this.state.password} onChange={this.handleChange}/>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">Sign in</button>

          {this.state.error !== "" && 
          <div className="form-group">
            <div className="form-group-body">
              <div className="flash flash-error">{this.state.error}</div>
            </div>
          </div>}

        </form>
      </div>
    );
  }
}